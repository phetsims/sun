// Copyright 2002-2013, University of Colorado Boulder

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
  var AriaSpeech = require( 'SCENERY/accessibility/AriaSpeech' );

  // constants
  var DISABLED_OPACITY = 0.3;

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @constructor
   * @param {Object} [options]
   */
  function CheckBox( content, property, options ) {

    options = _.extend( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkBoxColor: 'black',
      checkBoxColorBackground: 'white',
      tabIndex: 0,
      focusable: true,

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

    // interactivity
    thisNode.addInputListener( new ButtonListener( {
      fire: function() {
        if ( thisNode._enabled ) {
          var oldValue = property.value;
          var newValue = !property.value;
          thisNode.trigger2( 'startedCallbacksForToggled', oldValue, newValue );
          property.value = newValue;
          thisNode.trigger2( 'endedCallbacksForToggled', oldValue, newValue );
        }
      }
    } ) );

    // sync with property
    property.link( function( checked ) {
      thisNode.checkedNode.visible = checked;
      thisNode.uncheckedNode.visible = !checked;
      AriaSpeech.setText( property.value ? 'checked' : 'unchecked' );
    } );

    property.link( function( value ) {
      _.each( thisNode.instances, function( instance ) {

        //Make sure accessibility is enabled, then apply the change to the peer
        _.each( instance.peers, function( peer ) {
          peer.element.setAttribute( 'checked', value );
        } );
      } );
    } );

    // Apply additional options
    thisNode.mutate( options );
  }

  return inherit( Node, CheckBox, {

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
} );