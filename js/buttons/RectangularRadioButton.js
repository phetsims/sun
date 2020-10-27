// Copyright 2014-2020, University of Colorado Boulder

/**
 * RectangularRadioButton is a single rectangular radio button. It typically appears as part of a
 * RectangularRadioButtonGroup, but can be used in other context.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Emitter from '../../../axon/js/Emitter.js';
import merge from '../../../phet-core/js/merge.js';
import Color from '../../../scenery/js/util/Color.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import pushButtonSoundPlayer from '../../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
import RadioButtonInteractionStateProperty from './RadioButtonInteractionStateProperty.js';
import RectangularButton from './RectangularButton.js';

class RectangularRadioButton extends RectangularButton {

  /**
   * @param {Property} property - axon Property that can take on a set of values, one for each radio button in the group
   * @param {Object} value - value when this radio button is selected
   * @param {Object} [options]
   */
  constructor( property, value, options ) {

    options = merge( {

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

      // Class that determines the button's appearance for the values of interactionStateProperty.
      // See RectangularRadioButton.FlatAppearanceStrategy for an example.
      buttonAppearanceStrategy: RectangularRadioButton.FlatAppearanceStrategy,

      // {Playable|null} - sound generation - If set to null a default will be used that is based on this button's
      // position within the radio button group.  Can be set to Playable.NO_SOUND to disable.
      soundPlayer: null,

      // pdom
      tagName: 'input',
      inputType: 'radio',
      labelTagName: 'label',
      containerTagName: 'li',
      appendDescription: true,
      appendLabel: true,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
    }, options );

    assert && assert( options.tandem instanceof Tandem, 'invalid tandem' );
    assert && assert( !options.tandem.supplied || options.tandem.name.endsWith( 'RadioButton' ),
      `RectangularRadioButton tandem.name must end with RadioButton: ${options.tandem.phetioID}` );

    // @private
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new ButtonModel( {
      tandem: options.tandem
    } );

    const interactionStateProperty = new RadioButtonInteractionStateProperty( buttonModel, property, value );

    super( buttonModel, interactionStateProperty, options );

    // @public for use in RectangularRadioButtonGroup for managing the labels
    this.interactionStateProperty = interactionStateProperty;

    // pdom - Specify the default value for assistive technology, this attribute is needed in addition to
    // the 'checked' Property to mark this element as the default selection since 'checked' may be set before
    // we are finished adding RectangularRadioButtons to the RectangularRadioButtonGroup.
    if ( property.value === value ) {
      this.setAccessibleAttribute( 'checked', 'checked' );
    }

    // pdom - when the Property changes, make sure the correct radio button is marked as 'checked' so that this button
    // receives focus on 'tab'
    const accessibleCheckedListener = newValue => {
      this.accessibleChecked = ( newValue === value );
    };
    property.link( accessibleCheckedListener );

    // @private - the Property this button changes
    this.property = property;

    // @private - the value that is set to the Property when this button is pressed
    this.value = value;

    // @private
    this.firedEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'firedEmitter' ),
      phetioDocumentation: 'Emits when the radio button is pressed',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: EventType.USER
    } );

    this.firedEmitter.addListener( () => property.set( value ) );

    // When the button model triggers an event, fire from the radio button
    buttonModel.downProperty.link( down => {
      if ( !down && buttonModel.overProperty.get() && !buttonModel.interrupted ) {
        this.fire();
      }
    } );

    // sound generation
    const soundPlayer = options.soundPlayer || pushButtonSoundPlayer;
    const playSound = () => { soundPlayer.play(); };
    buttonModel.produceSoundEmitter.addListener( playSound );

    // @private
    this.disposeRectangularRadioButton = () => {
      property.unlink( accessibleCheckedListener );
      this.firedEmitter.dispose();
      buttonModel.dispose();
      this.interactionStateProperty.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeRectangularRadioButton();
    super.dispose();
  }

  /**
   * @public (read-only) - fire on up if the button is enabled, public for use in the accessibility tree
   */
  fire() {

    // Note that @protected this.buttonModel is defined in superclass
    if ( this.buttonModel.enabledProperty.get() ) {
      this.firedEmitter.emit();
      this.buttonModel.produceSoundEmitter.emit();
    }
  }
}

/**
 * FlatAppearanceStrategy is a value for RectangularRadioButton options.buttonAppearanceStrategy. It makes radio buttons
 * that look flat, i.e. no shading or highlighting, but that change color on mouseover, press, selected, etc.
 */
class FlatAppearanceStrategy {

  /**
   * @param {Node} buttonBackground - the Node for the button's background, sans content
   * @param {Property} interactionStateProperty
   * @param {Property} baseColorProperty
   * @param {Object} [options]
   */
  constructor( buttonBackground, interactionStateProperty, baseColorProperty, options ) {

    // Dynamic fills and strokes
    const overFill = new PaintColorProperty( options.overFill || baseColorProperty, {
      luminanceFactor: options.overFill ? 0 : 0.4
    } );
    const pressedFill = new PaintColorProperty( baseColorProperty, {
      luminanceFactor: -0.4
    } );
    const overStroke = new PaintColorProperty( options.overStroke || options.deselectedStroke, {
      luminanceFactor: options.overStroke ? 0 : -0.4
    } );

    // Cache colors
    buttonBackground.cachedPaints = [
      baseColorProperty, overFill, pressedFill, overStroke, options.selectedStroke, options.deselectedStroke
    ];

    // Change colors and opacity to match interactionState
    function interactionStateListener( interactionState ) {
      switch( interactionState ) {

        case RadioButtonInteractionState.SELECTED:
        case RadioButtonInteractionState.DISABLED_SELECTED:
          buttonBackground.fill = baseColorProperty;
          buttonBackground.stroke = options.selectedStroke;
          buttonBackground.lineWidth = options.selectedLineWidth;
          buttonBackground.opacity = options.selectedButtonOpacity;
          break;

        case RadioButtonInteractionState.DESELECTED:
        case RadioButtonInteractionState.DISABLED_DESELECTED:
          buttonBackground.fill = baseColorProperty;
          buttonBackground.stroke = options.deselectedStroke;
          buttonBackground.lineWidth = options.deselectedLineWidth;
          buttonBackground.opacity = options.deselectedButtonOpacity;
          break;

        case RadioButtonInteractionState.OVER:
          buttonBackground.fill = overFill;
          buttonBackground.stroke = overStroke;
          buttonBackground.lineWidth = ( options.overLineWidth ) ? options.overLineWidth : options.deselectedLineWidth;
          buttonBackground.opacity = options.overButtonOpacity;
          break;

        case RadioButtonInteractionState.PRESSED:
          buttonBackground.fill = pressedFill;
          buttonBackground.stroke = options.deselectedStroke;
          buttonBackground.lineWidth = options.deselectedLineWidth;
          buttonBackground.opacity = options.selectedButtonOpacity;
          break;

        default:
          throw new Error( `unsupported interactionState: ${interactionState}` );
      }
    }

    interactionStateProperty.link( interactionStateListener );

    // @public
    this.dispose = () => {
      if ( interactionStateProperty.hasListener( interactionStateListener ) ) {
        interactionStateProperty.unlink( interactionStateListener );
      }
      overStroke.dispose();
      overFill.dispose();
      pressedFill.dispose();
    };
  }
}

// @public
RectangularRadioButton.FlatAppearanceStrategy = FlatAppearanceStrategy;

sun.register( 'RectangularRadioButton', RectangularRadioButton );
export default RectangularRadioButton;