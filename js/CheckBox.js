// Copyright 2013-2015, University of Colorado Boulder

/**
 * Check box.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var sun = require( 'SUN/sun' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Tandem = require( 'TANDEM/Tandem' );
  var TCheckBox = require( 'ifphetio!PHET_IO/types/sun/TCheckBox' );

  // constants
  var DISABLED_OPACITY = 0.3;

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @constructor
   * @param {Object} [options]
   */
  function CheckBox( content, property, options ) {

    // @public (phet-io) Store for dispose();  Use a unique name to reduce the risk of collisions with parent/child classes
    // Made public for PhET-iO so that clients can access the checkbox value and change it through the PhET-iO API
    this.checkBoxValueProperty = property;

    options = _.extend( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkBoxColor: 'black',
      checkBoxColorBackground: 'white',
      tabIndex: '0', // '0' to be in accessible navigation order, '-1' for out of navigation
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

    Tandem.validateOptions( options ); // The tandem is required when brand==='phet-io'

    var thisNode = this;
    Node.call( this );

    thisNode.content = content; // @private
    thisNode.checkBoxAppearanceStrategy = options.checkBoxAppearanceStrategy; // @private
    thisNode.contentAppearanceStrategy = options.contentAppearanceStrategy; // @private

    thisNode._enabled = true; // @private

    // @private - Create the background.  Until we are creating our own shapes, just put a rectangle behind the font
    // awesome check box icons.
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

    // @private
    this.checkBoxButtonListener = new ButtonListener( {
      fire: this.fire
    } );
    thisNode.addInputListener( this.checkBoxButtonListener );

    // @private - sync with property
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

    // @public (tandem) - Tandem support, use a novel name to reduce the risk of parent or child collisions
    this.checkBoxTandem = options.tandem;
    this.checkBoxTandem && this.checkBoxTandem.addInstance( this, TCheckBox );

    // Accessibility support
    this.setAccessibleContent( {
      createPeer: function( accessibleInstance ) {
        var peer = new CheckBoxAccessiblePeer( accessibleInstance, property, thisNode.fire, options.accessibleLabel, options.tabIndex );
        thisNode.accessibleId = peer.id; // @public (read-only), id for quick identification in the Parallel DOM
        return peer;
      }
    } );
  }

  sun.register( 'CheckBox', CheckBox );

  inherit( Node, CheckBox, {

    // @public
    dispose: function() {
      this.checkBoxTandem && this.checkBoxTandem.removeInstance( this );
      this.checkBoxValueProperty.unlink( this.checkBoxCheckedListener );
      this.removeInputListener( this.checkBoxButtonListener );
    },

    /**
     *  Sets the background color of the check box.
     *  @param {Color|String} checkBoxColorBackground
     *  @public
     */
    setCheckBoxColorBackground: function( value ) { this.backgroundNode.fill = value; },
    set checkBoxColorBackground( value ) { this.setCheckBoxColorBackground( value ); },

    /**
     * Gets the background color of the check box.
     * @returns {Color|String}
     * @public
     */
    getCheckboxColorBackground: function() { return this.backgroundNode.fill; },
    get checkBoxColorBackground() { return this.getCheckboxColorBackground(); },

    /**
     *  Sets the color of the check box.
     *  @param {Color|String} checkBoxColor
     *  @public
     */
    setCheckBoxColor: function( value ) { this.checkedNode.fill = this.uncheckedNode.fill = value; },
    set checkBoxColor( value ) { this.setCheckBoxColor( value ); },

    /**
     * Gets the color of the check box.
     * @returns {Color|String}
     * @public
     */
    getCheckboxColor: function() { this.checkedNode.fill; },
    get checkBoxColor() { return this.getCheckboxColor(); },

    /**
     * Sets whether the check box is enabled.
     * @param {boolean} value
     * @public
     */
    setEnabled: function( value ) {
      this._enabled = this.pickable = value;
      this.checkBoxAppearanceStrategy( this.checkBoxNode, value );
      this.contentAppearanceStrategy( this.content, value );
    },
    set enabled( value ) { this.setEnabled( value ); },

    /**
     * Is the check box enabled?
     * @returns {boolean}
     * @public
     */
    getEnabled: function() { return this._enabled; },
    get enabled() { return this.getEnabled(); }

  }, {

    /**
     * Default for options.checkBoxAppearanceStrategy, fades the check box by changing opacity.
     * @param {Node} checkBoxNode the check box
     * @param {boolean} enabled
     * @static
     * @public
     */
    fadeCheckBoxWhenDisabled: function( checkBoxNode, enabled ) {
      checkBoxNode.opacity = enabled ? 1 : DISABLED_OPACITY;
    },

    /**
     * Default for options.contentAppearanceStrategy, fades the content by changing opacity.
     * @param {Node} content the content that appears next to the check box
     * @param {boolean} enabled
     * @static
     * @public
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
     * @public
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
   * @param {Property} property
   * @param {function} fire - listener function fired by this checkbox
   * @param {string} accessibleLabel - invisible string description for accessible technologies
   * @param {string} tabIndex
   */
  function CheckBoxAccessiblePeer( accessibleInstance, property, fire, accessibleLabel, tabIndex ) {
    this.initialize( accessibleInstance, property, fire, accessibleLabel, tabIndex );
  }

  inherit( AccessiblePeer, CheckBoxAccessiblePeer, {

    /**
     * Initialize dom element and its attributes for the accessible check box peer of the parallel DOM.
     *
     * @param {AccessibleInstance} accessibleInstance
     * @param {Property} property
     * @param {function} fire - listener function fired by this checkbox
     * @param {string} accessibleLabel - invisible string description for accessible technologies
     * @param {string} tabIndex
     * @public (a11y)
     */
    initialize: function( accessibleInstance, property, fire, accessibleLabel, tabIndex ) {

      // will look like <input id="check-box-id" aria-label="Checkbox Label">
      this.domElement = document.createElement( 'input' ); // @private
      this.initializeAccessiblePeer( accessibleInstance, this.domElement );
      this.domElement.type = 'checkbox';

      if ( property.value ) {
        this.domElement.checked = true;
      }

      // add the label as an aria-label
      this.domElement.setAttribute( 'aria-label', accessibleLabel );

      this.domElement.tabIndex = tabIndex;
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