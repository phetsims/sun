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
  var Emitter = require( 'AXON/Emitter' );
  var EmitterIO = require( 'AXON/EmitterIO' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );

  // ifphetio
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );

  // constants
  var DISABLED_OPACITY = 0.3;

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @constructor
   * @param {Object} [options]
   */
  function Checkbox( content, property, options ) {

    options = _.extend( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkboxColor: 'black',
      checkboxColorBackground: 'white',

      // phet-io
      tandem: Tandem.required,
      phetioEventType: 'user',
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly, // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioInstanceDocumentation: '', // different default than PhetioObject, see implementation below

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

    assert && options.tandem.supplied && assert( property.tandem && property.tandem.supplied,
      'Property must be instrumented if controlling Checkbox is.' );

    // (phet-io) document the instrumented Property that this Checkbox manipulates
    options.phetioInstanceDocumentation +=
      ' This checkbox controls the PropertyIO: ' +
      '<a href="#' + phetio.PhetioIDUtils.getDOMElementID( property.tandem.phetioID ) + '">' + property.tandem.phetioID + '</a>';
    options.phetioInstanceDocumentation = options.phetioInstanceDocumentation.trim(); // eliminate preceding whitespace, if any.

    var self = this;

    Node.call( this );

    this.content = content; // @private
    this.checkboxAppearanceStrategy = options.checkboxAppearanceStrategy; // @private
    this.contentAppearanceStrategy = options.contentAppearanceStrategy; // @private

    this._enabled = true; // @private

    // @private - sends out notifications when the checkbox is toggled.
    var toggledEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'toggledEmitter' ),
      phetioInstanceDocumentation: 'Emits when the checkbox is toggled, emitting a single arg: the new boolean value of the checkbox state.',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: 'user',
      phetioType: EmitterIO( [ BooleanIO ] )
    } );
    toggledEmitter.addListener( function( value ) {
      property.value = value;
    } );

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

    // interactivity
    var fire = function() {
      if ( self._enabled ) {
        var newValue = !property.value;
        toggledEmitter.emit1( newValue );
      }
    };

    var checkboxButtonListener = new ButtonListener( {
      fire: fire
    } );
    this.addInputListener( checkboxButtonListener );

    // @private (a11y) - fire the listener when checkbox is clicked with keyboard or assistive technology
    var changeListener = {
      change: fire
    };
    this.addAccessibleInputListener( changeListener );

    // @private - sync with property
    var checkboxCheckedListener = function( checked ) {
      self.checkedNode.visible = checked;
      self.uncheckedNode.visible = !checked;
      self.accessibleChecked = checked;
    };
    property.link( checkboxCheckedListener );

    // Apply additional options
    this.mutate( options );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Checkbox', this );

    // @private
    this.disposeCheckbox = function() {
      this.removeInputListener( checkboxButtonListener );
      this.removeAccessibleInputListener( changeListener );
      property.unlink( checkboxCheckedListener );
      toggledEmitter.dispose();
    };
  }

  sun.register( 'Checkbox', Checkbox );

  inherit( Node, Checkbox, {

    // @public
    dispose: function() {
      this.disposeCheckbox();
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