// Copyright 2013-2019, University of Colorado Boulder

/**
 * Checkbox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Action = require( 'AXON/Action' );
  const BooleanIO = require( 'TANDEM/types/BooleanIO' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const ButtonListener = require( 'SCENERY/input/ButtonListener' );
  const EventType = require( 'TANDEM/EventType' );
  const FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetioObject = require( 'TANDEM/PhetioObject' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const sun = require( 'SUN/sun' );
  const SunConstants = require( 'SUN/SunConstants' );
  const Tandem = require( 'TANDEM/Tandem' );

  // constants
  const ENABLED_PROPERTY_TANDEM_NAME = 'enabledProperty';

  // sounds
  const checkboxCheckedSoundPlayer = require( 'TAMBO/shared-sound-players/checkboxCheckedSoundPlayer' );
  const checkboxUncheckedSoundPlayer = require( 'TAMBO/shared-sound-players/checkboxUncheckedSoundPlayer' );

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @param {Object} [options]
   * @constructor
   */
  function Checkbox( content, property, options ) {
    const self = this;

    options = merge( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkboxColor: 'black',
      checkboxColorBackground: 'white',
      enabledProperty: null, // {BooleanProperty} initialized below if not provided
      disabledOpacity: SunConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioEventType: EventType.USER,
      // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
      phetioLinkProperty: true, // whether a link to the checkbox's Property is created
      phetioComponentOptions: null, // filled in below with PhetioObject.mergePhetioComponentOptions()

      // {Playable|null} - sound generators, if set to null defaults will be used, set to Playable.NO_SOUND to disable
      checkedSoundPlayer: null,
      uncheckedSoundPlayer: null,

      // a11y
      tagName: 'input',
      inputType: 'checkbox',
      appendDescription: true
    }, options );

    Node.call( this );

    PhetioObject.mergePhetioComponentOptions( { visibleProperty: { phetioFeatured: true } }, options );

    // @private - sends out notifications when the checkbox is toggled.
    const toggleAction = new Action( function( value ) {
      property.value = value;
    }, {
      parameters: [ { name: 'isChecked', phetioType: BooleanIO } ],
      tandem: options.tandem.createTandem( 'toggleAction' ),
      phetioDocumentation: 'Emits when user input causes the checkbox to toggle, emitting a single arg: ' +
                           'the new boolean value of the checkbox state.',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: EventType.USER
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
    const iconScale = options.boxWidth / this.uncheckedNode.width;
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

    // get default sound generators if needed
    const checkedSoundPlayer = options.checkedSoundPlayer || checkboxCheckedSoundPlayer;
    const uncheckedSoundPlayer = options.uncheckedSoundPlayer || checkboxUncheckedSoundPlayer;

    // interactivity
    const checkboxButtonListener = new ButtonListener( {
      fire: function() {
        if ( self.enabledProperty.value ) {
          const newValue = !property.value;
          toggleAction.execute( newValue );
          if ( newValue ) {
            checkedSoundPlayer.play();
          }
          else {
            uncheckedSoundPlayer.play();
          }
        }
      }
    } );
    this.addInputListener( checkboxButtonListener );

    // sync with property
    const checkboxCheckedListener = function( checked ) {
      self.checkedNode.visible = checked;
      self.uncheckedNode.visible = !checked;
      self.accessibleChecked = checked;
    };
    property.link( checkboxCheckedListener );

    // Apply additional options
    this.mutate( options );

    // must be after the Checkbox is instrumented
    options.phetioLinkProperty && this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // does this instance own enabledProperty?
    const ownsEnabledProperty = !options.enabledProperty;

    if ( !ownsEnabledProperty ) {
      assert && this.isPhetioInstrumented() && assert( !!options.enabledProperty.phetioFeatured === !!this.phetioFeatured,
        'provided enabledProperty must be phetioFeatured if this checkbox is' );

      // If enabledProperty was passed in, Studio needs to know about that linkage
      this.addLinkedElement( options.enabledProperty, {
        tandem: options.tandem.createTandem( ENABLED_PROPERTY_TANDEM_NAME )
      } );
    }

    // @public
    this.enabledProperty = options.enabledProperty || new BooleanProperty( true, {
      tandem: options.tandem.createTandem( ENABLED_PROPERTY_TANDEM_NAME ),
      phetioReadOnly: options.phetioReadOnly,
      phetioDocumentation: 'When disabled, the checkbox is grayed out and cannot be pressed.',
      phetioFeatured: true
    } );

    const enabledListener = function( enabled ) {
      if ( enabled ) {
        self.setAccessibleAttribute( 'onclick', '' );
        self.setAccessibleAttribute( 'aria-disabled', false );
      }
      else {
        self.interruptSubtreeInput(); // interrupt interaction

        // By returning false, we prevent the a11y checkbox from toggling when the enabledProperty is false. This way
        // we can keep the checkbox in tab order and don't need to add the `disabled` attribute. See https://github.com/phetsims/sun/issues/519
        // This solution was found at https://stackoverflow.com/a/12267350/3408502
        self.setAccessibleAttribute( 'onclick', 'return false' );
        self.setAccessibleAttribute( 'aria-disabled', true );
      }

      self.pickable = enabled;
      self.opacity = enabled ? 1 : options.disabledOpacity;
    };
    this.enabledProperty.link( enabledListener );

    // assert that phet-io is set up correctly after the PhetioObject has been properly initialized (after mutate)

    // If either one is instrumented, then the other must be too.
    assert && Tandem.errorOnFailedValidation() && assert( this.enabledProperty.isPhetioInstrumented() === this.isPhetioInstrumented(),
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
      toggleAction.dispose();
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