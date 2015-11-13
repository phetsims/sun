// Copyright 2013-2015, University of Colorado Boulder

/**
 * Check box.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );

  // constants
  var DISABLED_OPACITY = 0.3;

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @constructor
   * @param {Object} [options]
   */
  function CheckBox( content, property, options ) {

    // @public (together) Store for dispose();  Use a unique name to reduce the risk of collisions with parent/child classes
    // Made public for together so that clients can access the checkbox value and change it through the together API
    this.checkBoxValueProperty = property;

    options = _.extend( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkBoxColor: 'black',
      checkBoxColorBackground: 'white',
      tabIndex: 0,
      focusable: true,
      tandem: null,

      /*
       * {function( {Node} checkBox, {boolean} enabled ) }
       * Strategy for controlling the check box's appearance, excluding any content.
       * This can be a stock strategy from this file or custom.
       * To create a custom one, model it off of the stock strategies defined in this file.
       */
      checkBoxAppearanceStrategy: CheckBox.fadeCheckBoxWhenDisabled,

      /*
       * {function( {Node} content, {boolean} enabled )}
       * Strategy for controlling the appearance of the content based on the check box's state.
       * This can be a stock strategy from this file, or custom.
       * To create a custom one, model it off of the stock version(s) defined in this file.
       */
      contentAppearanceStrategy: CheckBox.fadeContentWhenDisabled
    }, options );

    var thisNode = this;
    Node.call( this );

    thisNode.content = content; // @private
    thisNode.checkBoxAppearanceStrategy = options.checkBoxAppearanceStrategy; // @private
    thisNode.contentAppearanceStrategy = options.contentAppearanceStrategy; // @private

    thisNode._enabled = true; // @private

    // Make the background.  Until we are creating our own shapes, just
    // put a rectangle behind the font awesome check box icons.
    thisNode.backgroundNode = new Rectangle( 0, -options.boxWidth, options.boxWidth * 0.95, options.boxWidth * 0.95,
      options.boxWidth * 0.2, options.boxWidth * 0.2, {
        fill: options.checkBoxColorBackground
      } );

    // @private
    thisNode.uncheckedNode = new FontAwesomeNode( 'check_empty', {
      fill: options.checkBoxColor
    } );
    var iconScale = options.boxWidth / thisNode.uncheckedNode.width;
    thisNode.uncheckedNode.scale( iconScale );

    // @private
    thisNode.checkedNode = new FontAwesomeNode( 'check', {
      scale: iconScale,
      fill: options.checkBoxColor
    } );

    // @private
    this.checkBoxNode = new Node( { children: [ thisNode.backgroundNode, thisNode.checkedNode, thisNode.uncheckedNode ] } );

    thisNode.addChild( this.checkBoxNode );
    thisNode.addChild( content );

    content.left = thisNode.checkedNode.right + options.spacing;
    content.centerY = thisNode.checkedNode.centerY;

    // put a rectangle on top of everything to prevent dead zones when clicking
    thisNode.addChild( new Rectangle( thisNode.left, thisNode.top, thisNode.width, thisNode.height ) );

    content.pickable = false; // since there's a pickable rectangle on top of content

    // @private interactivity
    this.fire = function() {
      if ( thisNode._enabled ) {
        var oldValue = property.value;
        var newValue = !property.value;
        thisNode.trigger2( 'startedCallbacksForToggled', oldValue, newValue );
        property.value = newValue;
        thisNode.trigger0( 'endedCallbacksForToggled' );
      }
    };
    this.checkBoxButtonListener = new ButtonListener( {
      fire: this.fire
    } );
    thisNode.addInputListener( this.checkBoxButtonListener );

    // sync with property
    this.checkBoxCheckedListener = function( checked ) {
      thisNode.checkedNode.visible = checked;
      thisNode.uncheckedNode.visible = !checked;

      _.each( thisNode.instances, function( instance ) {

        //Make sure accessibility is enabled, then apply the change to the peer
        _.each( instance.peers, function( peer ) {
          peer.element.setAttribute( 'checked', checked );
        } );
      } );
    };
    property.link( this.checkBoxCheckedListener );

    // Apply additional options
    thisNode.mutate( options );

    // Tandem support
    // Give it a novel name to reduce the risk of parent or child collisions
    this.checkBoxTandem = options.tandem;
    this.checkBoxTandem && this.checkBoxTandem.addInstance( this );

    // Accessibility support
    this.setAccessibleContent( {
      createPeer: function( accessibleInstance ) {
        return new CheckBoxAccessiblePeer( accessibleInstance, thisNode.fire, options.accessibleLabel );
      }
    } );
  }

  inherit( Node, CheckBox, {
    dispose: function() {
      this.checkBoxTandem && this.checkBoxTandem.removeInstance( this );
      this.checkBoxValueProperty.unlink( this.checkBoxCheckedListener );
      this.removeInputListener( this.checkBoxButtonListener );
    },

    get checkBoxColorBackground() { return this.backgroundNode.fill; },
    set checkBoxColorBackground( value ) {
      this.backgroundNode.fill = value;
    },

    get checkBoxColor() { return this.checkedNode.fill; },
    set checkBoxColor( value ) {
      this.checkedNode.fill = this.uncheckedNode.fill = value;
    },

    /**
     * Is the check box enabled?
     * @returns {boolean}
     */
    getEnabled: function() {
      return this._enabled;
    },
    get enabled() { return this.getEnabled(); },

    /**
     * Sets whether the check box is enabled.
     * @param {boolean} value
     */
    setEnabled: function( value ) {
      this._enabled = this.pickable = value;
      this.checkBoxAppearanceStrategy( this.checkBoxNode, value );
      this.contentAppearanceStrategy( this.content, value );
    },
    set enabled( value ) { this.setEnabled( value ); }

  }, {

    /**
     * Default for options.checkBoxAppearanceStrategy, fades the check box by changing opacity.
     * @param {Node} checkBoxNode the check box
     * @param {boolean} enabled
     * @static
     */
    fadeCheckBoxWhenDisabled: function( checkBoxNode, enabled ) {
      checkBoxNode.opacity = enabled ? 1 : DISABLED_OPACITY;
    },

    /**
     * Default for options.contentAppearanceStrategy, fades the content by changing opacity.
     * @param {Node} content the content that appears next to the check box
     * @param {boolean} enabled
     * @static
     */
    fadeContentWhenDisabled: function( content, enabled ) {
      content.opacity = enabled ? 1 : DISABLED_OPACITY;
    },

    /**
     * Factory method, creates a check box with a text label and optional icon.
     * @param {string} text
     * @param {Object} textOptions options passed to scenery.Text constructor
     * @param {Property.<boolean>} property
     * @param {Object} [checkBoxOptions] options passed to CheckBox constructor
     * @returns {CheckBox}
     * @static
     */
    createTextCheckBox: function( text, textOptions, property, checkBoxOptions ) {

      textOptions = textOptions || {};

      checkBoxOptions = _.extend( {
        icon: null,  // an optional node, added to the right of the text
        iconSpacing: 15
      }, checkBoxOptions );

      var content = new Node();

      // text
      var textNode = new Text( text, textOptions );
      content.addChild( textNode );

      // optional icon
      if ( checkBoxOptions.icon ) {
        content.addChild( checkBoxOptions.icon );
        //TODO support different layouts of text and image?
        checkBoxOptions.icon.left = textNode.right + checkBoxOptions.iconSpacing;
        checkBoxOptions.icon.centerY = textNode.centerY;
      }

      return new CheckBox( content, property, checkBoxOptions );
    }
  } );

  /**
   * An accessible peer for creating a check box element in the Parallel DOM.
   * See https://github.com/phetsims/scenery/issues/461
   *
   * @param {AccessibleInstance} accessibleInstance
   * @param {function} fire - listener function fired by this checkbox
   * @param {string} accessibleLabel - invisible string description for accessible technologies
   */
  function CheckBoxAccessiblePeer( accessibleInstance, fire, accessibleLabel ) {
    this.initialize( accessibleInstance, fire, accessibleLabel );
  }

  inherit( AccessiblePeer, CheckBoxAccessiblePeer, {

    /**
     * Initialize dom element and its attributes for the accessible check box peer of the parallel DOM.
     *
     * @param {AccessibleInstance} accessibleInstance
     * @param {function} fire
     * @param {string} accessibleLabel
     */
    initialize: function( accessibleInstance, fire, accessibleLabel ) {
      var trail = accessibleInstance.trail;

      // will look like <input id="checkBoxId" value="check box value" type="checkbox">Check Box Name<br>
      this.domElement = document.createElement( 'input' ); // @private
      this.initializeAccessiblePeer( accessibleInstance, this.domElement );
      this.domElement.type = 'checkbox';

      // if an accessible label has been passed in, add it as a label to the dom element
      if ( accessibleLabel ) {
        var uniqueId = trail.getUniqueId();
        this.domElement.id = 'checkBox-' + uniqueId;

        var checkBoxLabel = document.createElement( 'label' );
        checkBoxLabel.setAttribute( 'for', this.domElement.id );
        checkBoxLabel.innerText = accessibleLabel;
        this.domElement.appendChild( checkBoxLabel );
      }

      this.domElement.tabIndex = '0';
      this.domElement.addEventListener( 'click', function() {
        fire();
      } );
    },

    /**
     * Dispose function for the accessible check box.
     */
    dispose: function() {
      // TODO
    }
  } );
  return CheckBox;
} );