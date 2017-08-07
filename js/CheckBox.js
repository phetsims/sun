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
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var sun = require( 'SUN/sun' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Tandem = require( 'TANDEM/Tandem' );

  // phet-io modules
  var TCheckBox = require( 'SUN/TCheckBox' );

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
      tandem: Tandem.tandemRequired(),
      phetioType: TCheckBox,

      // a11y
      tagName: 'input',
      inputType: 'checkbox',

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

    var self = this;

    Node.call( this );

    this.content = content; // @private
    this.checkBoxAppearanceStrategy = options.checkBoxAppearanceStrategy; // @private
    this.contentAppearanceStrategy = options.contentAppearanceStrategy; // @private

    this._enabled = true; // @private

    // Emitters for the PhET-iO data stream
    this.startedCallbacksForToggledEmitter = new Emitter( { indicateCallbacks: false } );
    this.endedCallbacksForToggledEmitter = new Emitter( { indicateCallbacks: false } );

    // @private - Create the background.  Until we are creating our own shapes, just put a rectangle behind the font
    // awesome check box icons.
    this.backgroundNode = new Rectangle( 0, -options.boxWidth, options.boxWidth * 0.95, options.boxWidth * 0.95,
      options.boxWidth * 0.2, options.boxWidth * 0.2, {
        fill: options.checkBoxColorBackground
      } );

    // @private
    this.uncheckedNode = new FontAwesomeNode( 'check_empty', {
      fill: options.checkBoxColor
    } );
    var iconScale = options.boxWidth / this.uncheckedNode.width;
    this.uncheckedNode.scale( iconScale );

    // @private
    this.checkedNode = new FontAwesomeNode( 'check_square_o', {
      scale: iconScale,
      fill: options.checkBoxColor
    } );

    // @private
    this.checkBoxNode = new Node( { children: [ this.backgroundNode, this.checkedNode, this.uncheckedNode ] } );

    this.addChild( this.checkBoxNode );
    this.addChild( content );

    content.left = this.checkedNode.right + options.spacing;
    content.centerY = this.checkedNode.centerY;

    // put a rectangle on top of everything to prevent dead zones when clicking
    this.addChild( new Rectangle( this.left, this.top, this.width, this.height ) );

    content.pickable = false; // since there's a pickable rectangle on top of content

    // @private interactivity
    this.fire = function() {
      if ( self._enabled ) {
        var oldValue = property.value;
        var newValue = !property.value;
        self.startedCallbacksForToggledEmitter.emit2( oldValue, newValue );
        property.value = newValue;
        self.endedCallbacksForToggledEmitter.emit();
      }
    };

    // @private
    this.checkBoxButtonListener = new ButtonListener( {
      fire: this.fire
    } );
    this.addInputListener( this.checkBoxButtonListener );

    // @private (a11y) - fire the listener when checkbox is clicked with keyboard or assistive technology
    this.changeListener = this.addAccessibleInputListener( {
      change: this.fire
    } );

    // @private - sync with property
    this.checkBoxCheckedListener = function( checked ) {
      self.checkedNode.visible = checked;
      self.uncheckedNode.visible = !checked;
    };
    property.link( this.checkBoxCheckedListener );

    // Apply additional options
    this.mutate( options );
  }

  sun.register( 'CheckBox', CheckBox );

  inherit( Node, CheckBox, {

    // @public
    dispose: function() {
      this.checkBoxValueProperty.unlink( this.checkBoxCheckedListener );
      this.removeInputListener( this.checkBoxButtonListener );
      this.removeAccessibleInputListener( this.changeListener );
      Node.prototype.dispose.call( this );
    },

    /**
     *  Sets the background color of the check box.
     *  @param {Color|String} value
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
     *  @param {Color|String} value
     *  @public
     */
    setCheckBoxColor: function( value ) { this.checkedNode.fill = this.uncheckedNode.fill = value; },
    set checkBoxColor( value ) { this.setCheckBoxColor( value ); },

    /**
     * Gets the color of the check box.
     * @returns {Color|String}
     * @public
     */
    getCheckboxColor: function() { return this.checkedNode.fill; },
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

  return CheckBox;
} );