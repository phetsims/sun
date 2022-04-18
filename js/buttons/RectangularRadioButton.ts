// Copyright 2014-2022, University of Colorado Boulder

/**
 * RectangularRadioButton is a single rectangular radio button. It typically appears as part of a
 * RectangularRadioButtonGroup, but can be used in other context.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Emitter from '../../../axon/js/Emitter.js';
import IProperty from '../../../axon/js/IProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Color, IColor, Node, PaintableNode, PaintColorProperty } from '../../../scenery/js/imports.js';
import ISoundPlayer from '../../../tambo/js/ISoundPlayer.js';
import pushButtonSoundPlayer from '../../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
import RadioButtonInteractionStateProperty from './RadioButtonInteractionStateProperty.js';
import RectangularButton, { RectangularButtonOptions } from './RectangularButton.js';
import TButtonAppearanceStrategy from './TButtonAppearanceStrategy.js';
import TContentAppearanceStrategy from './TContentAppearanceStrategy.js';

type SelfOptions = {

  // Options used by RectangularRadioButton.FlatAppearanceStrategy.
  // If you define your own buttonAppearanceStrategy, then you may need to add your own options.
  overFill?: IColor;
  overStroke?: IColor;
  overLineWidth?: number | null;
  overButtonOpacity?: number;
  selectedStroke?: IColor;
  selectedLineWidth?: number;
  selectedButtonOpacity?: number;
  deselectedStroke?: IColor;
  deselectedLineWidth?: number;
  deselectedButtonOpacity?: number;

  // Options used by RectangularRadioButton.ContentAppearanceStrategy.
  // If you define your own contentAppearanceStrategy, then you may need to add your own options.
  overContentOpacity?: number;
  selectedContentOpacity?: number;
  deselectedContentOpacity?: number;

  // Sound generation - If set to null a default will be used that is based on this button's
  // position within the radio button group.  Can be set to nullSoundPlayer to disable.
  soundPlayer?: ISoundPlayer | null;
};

export type RectangularRadioButtonOptions = SelfOptions & RectangularButtonOptions;

export default class RectangularRadioButton<T> extends RectangularButton {

  // the Property this button changes
  public readonly property: IProperty<T>;

  // the value that is set to the Property when this button is pressed
  public readonly value: T;

  public readonly interactionStateProperty: RadioButtonInteractionStateProperty<T>;

  private readonly firedEmitter: Emitter<[]>;

  private readonly disposeRectangularRadioButton: () => void;

  /**
   * @param property - axon Property that can take on a set of values, one for each radio button in the group
   * @param value - value when this radio button is selected
   * @param providedOptions
   */
  constructor( property: IProperty<T>, value: T, providedOptions?: RectangularRadioButtonOptions ) {

    const options = optionize<RectangularRadioButtonOptions, SelfOptions, RectangularButtonOptions, 'tandem'>( {

      // SelfOptions
      overFill: null,
      overStroke: null,
      overLineWidth: null,
      overButtonOpacity: 0.8,
      selectedStroke: 'black',
      selectedLineWidth: 1.5,
      selectedButtonOpacity: 1,
      deselectedStroke: new Color( 50, 50, 50 ),
      deselectedLineWidth: 1,
      deselectedButtonOpacity: 0.6,
      overContentOpacity: 0.8,
      selectedContentOpacity: 1,
      deselectedContentOpacity: 0.6,
      soundPlayer: null,

      // RectangularButtonOptions
      baseColor: ColorConstants.LIGHT_BLUE,
      buttonAppearanceStrategy: RectangularRadioButton.FlatAppearanceStrategy,
      contentAppearanceStrategy: RectangularRadioButton.ContentAppearanceStrategy,

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
    }, providedOptions );

    assert && assert( !options.tandem.supplied || options.tandem.name.endsWith( 'RadioButton' ),
      `RectangularRadioButton tandem.name must end with RadioButton: ${options.tandem.phetioID}` );

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new ButtonModel( {
      tandem: options.tandem
    } );

    const interactionStateProperty = new RadioButtonInteractionStateProperty( buttonModel, property, value );

    super( buttonModel, interactionStateProperty, options );

    // for use in RectangularRadioButtonGroup for managing the labels
    this.interactionStateProperty = interactionStateProperty;

    // pdom - Specify the default value for assistive technology, this attribute is needed in addition to
    // the 'checked' Property to mark this element as the default selection since 'checked' may be set before
    // we are finished adding RectangularRadioButtons to the RectangularRadioButtonGroup.
    if ( property.value === value ) {
      this.setPDOMAttribute( 'checked', 'checked' );
    }

    // pdom - when the Property changes, make sure the correct radio button is marked as 'checked' so that this button
    // receives focus on 'tab'
    const pdomCheckedListener = ( newValue: T ) => {
      this.pdomChecked = ( newValue === value );
    };
    property.link( pdomCheckedListener );

    this.property = property;
    this.value = value;
    this.firedEmitter = new Emitter( {
      tandem: options.tandem.createTandem( 'firedEmitter' ),
      phetioDocumentation: 'Emits when the radio button is pressed',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: EventType.USER
    } );

    this.firedEmitter.addListener( () => property.set( value ) );

    // When the button model triggers an event, fire from the radio button
    buttonModel.downProperty.link( down => {
      if ( !down && ( buttonModel.overProperty.get() || buttonModel.focusedProperty.get() ) && !buttonModel.interrupted ) {
        this.fire();
        this.voicingSpeakFullResponse( {
          hintResponse: null
        } );
      }
    } );

    // sound generation
    const soundPlayer = options.soundPlayer || pushButtonSoundPlayer;
    const playSound = () => { soundPlayer.play(); };
    buttonModel.produceSoundEmitter.addListener( playSound );

    this.disposeRectangularRadioButton = () => {
      property.unlink( pdomCheckedListener );
      this.firedEmitter.dispose();
      buttonModel.produceSoundEmitter.removeListener( playSound );
      buttonModel.dispose();
      this.interactionStateProperty.dispose();
    };
  }

  override dispose(): void {
    this.disposeRectangularRadioButton();
    super.dispose();
  }

  /**
   * fire on up if the button is enabled, public for use in the accessibility tree
   */
  public fire(): void {
    if ( this.buttonModel.enabledProperty.get() ) {
      this.firedEmitter.emit();
      this.buttonModel.produceSoundEmitter.emit();
    }
  }

  /**
   * FlatAppearanceStrategy is a value for RectangularRadioButton options.buttonAppearanceStrategy. It makes radio buttons
   * that look flat, i.e. no shading or highlighting, but that change color on mouseover, press, selected, etc.
   */
  static override FlatAppearanceStrategy: TButtonAppearanceStrategy = class FlatAppearanceStrategy {

    private readonly disposeFlatAppearanceStrategy: () => void;

    /**
     * buttonBackground is the Node for the button's background, sans content
     */
    constructor( buttonBackground: PaintableNode, interactionStateProperty: IProperty<RadioButtonInteractionState>,
                 baseColorProperty: IProperty<Color>, options: any ) {

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
      function interactionStateListener( interactionState: RadioButtonInteractionState ) {
        switch( interactionState ) {

          case RadioButtonInteractionState.SELECTED:
            buttonBackground.fill = baseColorProperty;
            buttonBackground.stroke = options.selectedStroke;
            buttonBackground.lineWidth = options.selectedLineWidth;
            buttonBackground.opacity = options.selectedButtonOpacity;
            break;

          case RadioButtonInteractionState.DESELECTED:
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

      this.disposeFlatAppearanceStrategy = () => {
        if ( interactionStateProperty.hasListener( interactionStateListener ) ) {
          interactionStateProperty.unlink( interactionStateListener );
        }
        overStroke.dispose();
        overFill.dispose();
        pressedFill.dispose();
      };
    }

    public dispose(): void {
      this.disposeFlatAppearanceStrategy();
    }
  }

  /**
   * ContentAppearanceStrategy is a value for RectangularRadioButton options.contentAppearanceStrategy. It changes
   * their look based on the value of interactionStateProperty.
   */
  static ContentAppearanceStrategy: TContentAppearanceStrategy = class ContentAppearanceStrategy {

    private readonly disposeContentAppearanceStrategy: () => void;

    constructor( content: Node, interactionStateProperty: IProperty<RadioButtonInteractionState>, options: any ) {

      // The button is not the parent of the content, therefore it is necessary to set the opacity on the content separately
      function handleInteractionStateChanged( state: RadioButtonInteractionState ) {
        if ( content !== null ) {
          switch( state ) {

            case RadioButtonInteractionState.DESELECTED:
              content.opacity = options.deselectedContentOpacity;
              break;

            // mouseover for deselected buttons
            case RadioButtonInteractionState.OVER:
              content.opacity = options.overContentOpacity;
              break;

            case RadioButtonInteractionState.SELECTED:
              content.opacity = options.selectedContentOpacity;
              break;

            case RadioButtonInteractionState.PRESSED:
              content.opacity = options.deselectedContentOpacity;
              break;

            default:
              throw new Error( `unsupported state: ${state}` );
          }
        }
      }

      interactionStateProperty.link( handleInteractionStateChanged );

      this.disposeContentAppearanceStrategy = () => {
        if ( interactionStateProperty.hasListener( handleInteractionStateChanged ) ) {
          interactionStateProperty.unlink( handleInteractionStateChanged );
        }
      };
    }

    public dispose(): void {
      this.disposeContentAppearanceStrategy();
    }
  }
}

sun.register( 'RectangularRadioButton', RectangularRadioButton );
