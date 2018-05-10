// Copyright 2013-2017, University of Colorado Boulder

/**
 * Checkbox.
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
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );
  var InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );

  // phet-io modules
  var CheckboxIO = require( 'SUN/CheckboxIO' );

  // constants
  var DISABLED_OPACITY = 0.3;

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @constructor
   * @param {Object} [options]
   */
  function Checkbox( content, property, options ) {

    // @public (phet-io) Store for dispose();  Use a unique name to reduce the risk of collisions with parent/child classes
    // Made public for PhET-iO so that clients can access the checkbox value and change it through the PhET-iO API
    this.checkboxValueProperty = property;

    options = _.extend( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkboxColor: 'black',
      checkboxColorBackground: 'white',
      tandem: Tandem.required,
      phetioType: CheckboxIO,

      // a11y
      tagName: 'input',
      inputType: 'checkbox',
      appendLabel: true,
      appendDescription: true,

      /*
       * {function( {Node} checkbox, {boolean} enabled ) }
       * Strategy for controlling the checkbox's appearance, excluding any content.
       * This can be a stock strategy from this file or custom.
       * To create a custom one, model it off of the stock strategies defined in this file.
       */
      checkboxAppearanceStrategy: Checkbox.fadeCheckboxWhenDisabled,

      /*
       * {function( {Node} content, {boolean} enabled )}
       * Strategy for controlling the appearance of the content based on the checkbox's state.
       * This can be a stock strategy from this file, or custom.
       * To create a custom one, model it off of the stock version(s) defined in this file.
       */
      contentAppearanceStrategy: Checkbox.fadeContentWhenDisabled
    }, options );

    var self = this;

    Node.call( this );

    this.content = content; // @private
    this.checkboxAppearanceStrategy = options.checkboxAppearanceStrategy; // @private
    this.contentAppearanceStrategy = options.contentAppearanceStrategy; // @private

    this._enabled = true; // @private

    // @private - Create the background.  Until we are creating our own shapes, just put a rectangle behind the font
    // awesome checkbox icons.
    this.backgroundNode = new Rectangle( 0, -options.boxWidth, options.boxWidth * 0.95, options.boxWidth * 0.95,
      options.boxWidth * 0.2, options.boxWidth * 0.2, {
        fill: options.checkboxColorBackground
      } );

    // @private
    this.uncheckedNode = new FontAwesomeNode( 'check_empty', {
      fill: options.checkboxColor
    } );
    var iconScale = options.boxWidth / this.uncheckedNode.width;
    this.uncheckedNode.scale( iconScale );

    // @private
    this.checkedNode = new FontAwesomeNode( 'check_square_o', {
      scale: iconScale,
      fill: options.checkboxColor
    } );

    // @private
    this.checkboxNode = new Node( { children: [ this.backgroundNode, this.checkedNode, this.uncheckedNode ] } );

    this.addChild( this.checkboxNode );
    this.addChild( content );

    content.left = this.checkedNode.right + options.spacing;
    content.centerY = this.checkedNode.centerY;

    // put a rectangle on top of everything to prevent dead zones when clicking
    this.addChild( new Rectangle( this.left, this.top, this.width, this.height ) );

    content.pickable = false; // since there's a pickable rectangle on top of content

    // @private interactivity
    this.fire = function() {
      if ( self._enabled ) {
        var newValue = !property.value;
        self.startEvent( 'user', 'toggled', {
          oldValue: property.value,
          newValue: newValue
        } );
        property.value = newValue;
        self.endEvent();
      }
    };

    // @private
    this.checkboxButtonListener = new ButtonListener( {
      fire: this.fire
    } );
    this.addInputListener( this.checkboxButtonListener );

    // @private (a11y) - fire the listener when checkbox is clicked with keyboard or assistive technology
    this.changeListener = {
      change: this.fire
    };
    this.addAccessibleInputListener( this.changeListener );

    // @private - sync with property
    this.checkboxCheckedListener = function( checked ) {
      self.checkedNode.visible = checked;
      self.uncheckedNode.visible = !checked;
      self.accessibleChecked = checked;
    };
    property.link( this.checkboxCheckedListener );

    // Apply additional options
    this.mutate( options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'Checkbox', this );
  }

  sun.register( 'Checkbox', Checkbox );

  inherit( Node, Checkbox, {

    // @public
    dispose: function() {
      this.checkboxValueProperty.unlink( this.checkboxCheckedListener );
      this.removeInputListener( this.checkboxButtonListener );
      this.removeAccessibleInputListener( this.changeListener );
      Node.prototype.dispose.call( this );
    },

    /**
     *  Sets the background color of the checkbox.
     *  @param {Color|String} value
     *  @public
     */
    setCheckboxColorBackground: function( value ) { this.backgroundNode.fill = value; },
    set checkboxColorBackground( value ) { this.setCheckboxColorBackground( value ); },

    /**
     * Gets the background color of the checkbox.
     * @returns {Color|String}
     * @public
     */
    getCheckboxColorBackground: function() { return this.backgroundNode.fill; },
    get checkboxColorBackground() { return this.getCheckboxColorBackground(); },

    /**
     *  Sets the color of the checkbox.
     *  @param {Color|String} value
     *  @public
     */
    setCheckboxColor: function( value ) { this.checkedNode.fill = this.uncheckedNode.fill = value; },
    set checkboxColor( value ) { this.setCheckboxColor( value ); },

    /**
     * Gets the color of the checkbox.
     * @returns {Color|String}
     * @public
     */
    getCheckboxColor: function() { return this.checkedNode.fill; },
    get checkboxColor() { return this.getCheckboxColor(); },

    /**
     * Sets whether the checkbox is enabled.
     * @param {boolean} value
     * @public
     */
    setEnabled: function( value ) {
      this._enabled = this.pickable = value;
      this.checkboxAppearanceStrategy( this.checkboxNode, value );
      this.contentAppearanceStrategy( this.content, value );
    },
    set enabled( value ) { this.setEnabled( value ); },

    /**
     * Is the checkbox enabled?
     * @returns {boolean}
     * @public
     */
    getEnabled: function() { return this._enabled; },
    get enabled() { return this.getEnabled(); }

  }, {

    /**
     * Default for options.checkboxAppearanceStrategy, fades the checkbox by changing opacity.
     * @param {Node} checkboxNode the checkbox
     * @param {boolean} enabled
     * @static
     * @public
     */
    fadeCheckboxWhenDisabled: function( checkboxNode, enabled ) {
      checkboxNode.opacity = enabled ? 1 : DISABLED_OPACITY;
    },

    /**
     * Default for options.contentAppearanceStrategy, fades the content by changing opacity.
     * @param {Node} content the content that appears next to the checkbox
     * @param {boolean} enabled
     * @static
     * @public
     */
    fadeContentWhenDisabled: function( content, enabled ) {
      content.opacity = enabled ? 1 : DISABLED_OPACITY;
    },

    /**
     * Factory method, creates a checkbox with a text label and optional icon.
     * @param {string} text
     * @param {Object} textOptions options passed to scenery.Text constructor
     * @param {Property.<boolean>} property
     * @param {Object} [checkboxOptions] options passed to Checkbox constructor
     * @returns {Checkbox}
     * @static
     * @public
     */
    createTextCheckbox: function( text, textOptions, property, checkboxOptions ) {

      textOptions = textOptions || {};

      checkboxOptions = _.extend( {
        icon: null,  // an optional node, added to the right of the text
        iconSpacing: 15
      }, checkboxOptions );

      var content = new Node();

      // text
      var textNode = new Text( text, textOptions );
      content.addChild( textNode );

      // optional icon
      if ( checkboxOptions.icon ) {
        content.addChild( checkboxOptions.icon );
        checkboxOptions.icon.left = textNode.right + checkboxOptions.iconSpacing;
        checkboxOptions.icon.centerY = textNode.centerY;
      }

      return new Checkbox( content, property, checkboxOptions );
    }
  } );

  return Checkbox;
} );