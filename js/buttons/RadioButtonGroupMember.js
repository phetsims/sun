// Copyright 2014-2019, University of Colorado Boulder

/**
 * A single radio button. This class is designed to be part of a RadioButtonGroup and there should be no need to use it
 * outside of RadioButtonGroup. It is called RadioButtonGroupMember to differentiate from RadioButton, which already
 * exists.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var Color = require( 'SCENERY/util/Color' );
  var ColorConstants = require( 'SUN/ColorConstants' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var RadioButtonGroupAppearance = require( 'SUN/buttons/RadioButtonGroupAppearance' );
  var RadioButtonInteractionStateProperty = require( 'SUN/buttons/RadioButtonInteractionStateProperty' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Property} property axon property that can take on a set of values, one for each radio button in the group
   * @param {Object} value value when this radio button is selected
   * @param {Object} [options]
   * @constructor
   */
  function RadioButtonGroupMember( property, value, options ) {

    var self = this;

    options = _.extend( {
      // The fill for the rectangle behind the radio buttons.  Default color is bluish color, as in the other button library.
      baseColor: ColorConstants.LIGHT_BLUE,
      disabledBaseColor: ColorConstants.LIGHT_GRAY,

      // Opacity can be set separately for the buttons and button content.
      selectedButtonOpacity: 1,
      deselectedButtonOpacity: 0.6,
      selectedContentOpacity: 1,
      deselectedContentOpacity: 0.6,
      overButtonOpacity: 0.8,
      overContentOpacity: 0.8,

      selectedStroke: 'black',
      deselectedStroke: new Color( 50, 50, 50 ),
      selectedLineWidth: 1.5,
      deselectedLineWidth: 1,

      // The following options specify highlight behavior overrides, leave as null to get the default behavior
      // Note that highlighting applies only to deselected buttons
      overFill: null,
      overStroke: null,
      overLineWidth: null,

      // The default appearances use the color values specified above, but other appearances could be specified for more
      // customized behavior.  Generally setting the color values above should be enough to specify the desired look.
      buttonAppearanceStrategy: RadioButtonGroupAppearance.defaultRadioButtonsAppearance,
      contentAppearanceStrategy: RadioButtonGroupAppearance.contentAppearanceStrategy,

      // a11y
      tagName: 'input',
      inputType: 'radio',
      labelTagName: 'label',
      containerTagName: 'li',
      appendDescription: true,
      appendLabel: true,

      // phet-io
      tandem: Tandem.required,
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
    }, options );

    // @private
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    this.buttonModel = new ButtonModel( {
      tandem: options.tandem.createTandem( 'buttonModel' )
    } );

    // When the button model triggers an event, fire from the radio button
    this.buttonModel.downProperty.link( function( down ) {
      if ( !down && self.buttonModel.overProperty.get() ) {
        self.fire();
      }
    } );

    // @public for use in RadioButtonGroup for managing the labels
    this.interactionStateProperty = new RadioButtonInteractionStateProperty( this.buttonModel, property, value );

    RectangularButtonView.call( this, this.buttonModel, this.interactionStateProperty, options );

    // a11y - Specify the default value for assistive technology, this attribute is needed in addition to 
    // the 'checked' property to mark this element as the default selection since 'checked' may be set before
    // we are finished adding RadioButtonGroupMembers to the RadioButtonGroup.
    if ( property.value === value ) {
      this.setAccessibleAttribute( 'checked', 'checked' );
    }

    // a11y - when the property changes, make sure the correct radio button is marked as 'checked' so that this button
    // receives focus on 'tab'
    var accessibleCheckedListener = function( newValue ) {
      self.accessibleChecked = newValue === value;
    };
    property.link( accessibleCheckedListener );

    // @private - the property this button changes
    this.property = property;

    // @private - the value that is set to the property when this button is pressed
    this.value = value;

    // @private
    this.firedEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'firedEmitter' ),
      phetioDocumentation: 'Emits when the radio button is pressed',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: PhetioObject.EventType.USER
    } );

    this.firedEmitter.addListener( function() {
      property.set( value );
    } );

    // @private
    this.disposeRadioButtonGroupMember = function() {
      property.unlink( accessibleCheckedListener );
      this.firedEmitter.dispose();
      this.buttonModel.dispose();
      this.interactionStateProperty.dispose();
    };
  }

  sun.register( 'RadioButtonGroupMember', RadioButtonGroupMember );

  return inherit( RectangularButtonView, RadioButtonGroupMember, {

    /**
     * @public (read-only) - fire on up if the button is enabled, public for use in the accessibility tree
     */
    fire: function() {
      if ( this.buttonModel.enabledProperty.get() ) {
        this.firedEmitter.emit();
      }
    },

    /**
     * Ensure eligibility for garbage collection.
     *
     * @public
     */
    dispose: function() {
      this.disposeRadioButtonGroupMember();
      RectangularButtonView.prototype.dispose && RectangularButtonView.prototype.dispose.call( this );
    }
  } );
} );