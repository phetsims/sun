// Copyright 2013-2019, University of Colorado Boulder

/**
 * Checkbox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Action = require( 'AXON/Action' );
  var ActionIO = require( 'AXON/ActionIO' );
  var BooleanIO = require( 'TANDEM/types/BooleanIO' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var sun = require( 'SUN/sun' );
  var SunConstants = require( 'SUN/SunConstants' );
  var Tandem = require( 'TANDEM/Tandem' );

  // constants
  var CheckboxEmitterIO = ActionIO( [ { name: 'isChecked', type: BooleanIO } ] );

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @param {Object} [options]
   * @constructor
   */
  function Checkbox( content, property, options ) {
    var self = this;

    options = _.extend( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkboxColor: 'black',
      checkboxColorBackground: 'white',
      enabledProperty: null, // {BooleanProperty} initialized below if not provided
      disabledOpacity: SunConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.required,
      phetioEventType: PhetioObject.EventType.USER,
      // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
      phetioLinkProperty: true, // whether a link to the checkbox's Property is created

      // a11y
      tagName: 'input',
      inputType: 'checkbox',
      appendLabel: true,
      appendDescription: true

    }, options );

    Node.call( this );

    // does this instance own enabledProperty?
    var ownsEnabledProperty = !options.enabledProperty;

    options.phetioLinkProperty && this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // If enabledProperty was passed in, Studio needs to know about that linkage
    options.enabledProperty && this.addLinkedElement( options.enabledProperty, {
      tandem: options.tandem.createTandem( 'enabledProperty' )
    } );

    // @public
    this.enabledProperty = options.enabledProperty || new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'enabledProperty' ),
      phetioReadOnly: options.phetioReadOnly,
      phetioDocumentation: 'When disabled, the checkbox is grayed out and cannot be pressed.'
    } );

    // @private - sends out notifications when the checkbox is toggled.
    var toggledAction = new Action( function( value ) {
      property.value = value;
    }, {
      tandem: options.tandem.createTandem( 'toggledAction' ),
      phetioDocumentation: 'Emits when user input causes the checkbox to toggle, emitting a single arg: ' +
                           'the new boolean value of the checkbox state.',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: PhetioObject.EventType.USER,
      phetioType: CheckboxEmitterIO
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
    var checkboxButtonListener = new ButtonListener( {
      fire: function() {
        if ( self.enabledProperty.value ) {
          var newValue = !property.value;
          toggledAction.execute( newValue );
        }
      }
    } );
    this.addInputListener( checkboxButtonListener );

    // sync with property
    var checkboxCheckedListener = function( checked ) {
      self.checkedNode.visible = checked;
      self.uncheckedNode.visible = !checked;
      self.accessibleChecked = checked;
    };
    property.link( checkboxCheckedListener );

    var enabledListener = function( enabled ) {
      !enabled && self.interruptSubtreeInput(); // interrupt interaction
      self.pickable = enabled;
      self.opacity = enabled ? 1 : options.disabledOpacity;
    };
    this.enabledProperty.link( enabledListener );

    // Apply additional options
    this.mutate( options );

    // assert that phet-io is set up correctly after the PhetioObject has been properly initialized (after mutate)

    // If either one is instrumented, then the other must be too.
    assert && Tandem.validationEnabled() && assert( this.enabledProperty.isPhetioInstrumented() === this.isPhetioInstrumented(),
      'provided enabled property must be instrumented for phet-io.' );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Checkbox', this );

    // @private
    this.disposeCheckbox = function() {

      // Client owns property, remove the listener that we added.
      if ( property.hasListener( checkboxCheckedListener ) ) {
        property.unlink( checkboxCheckedListener );
      }

      if ( ownsEnabledProperty ) {

        // Checkbox owns enabledProperty, so dispose to release tandem and remove all listeners.
        self.enabledProperty.dispose();
      }
      else if ( self.enabledProperty.hasListener( enabledListener ) ) {

        // Client owns enabledProperty, remove the listener that we added.
        self.enabledProperty.unlink( enabledListener );
      }

      // Private to Checkbox, but we need to clean up tandem.
      toggledAction.dispose();
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
     * @param {boolean} enabled
     * @public
     */
    setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this.setEnabled( value ); },

    /**
     * Is the checkbox enabled?
     * @returns {boolean}
     * @public
     */
    getEnabled: function() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); }

  } );

  return Checkbox;
} );