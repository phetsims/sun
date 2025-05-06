// Copyright 2014-2025, University of Colorado Boulder

/**
 * RectangularRadioButton is a single rectangular radio button. It typically appears as part of a
 * RectangularRadioButtonGroup, but can be used in other context.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Emitter from '../../../axon/js/Emitter.js';
import type TEmitter from '../../../axon/js/TEmitter.js';
import type TProperty from '../../../axon/js/TProperty.js';
import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import { type TrimParallelDOMOptions } from '../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import Voicing from '../../../scenery/js/accessibility/voicing/Voicing.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import { type PaintableNode } from '../../../scenery/js/nodes/Paintable.js';
import assertNoAdditionalChildren from '../../../scenery/js/util/assertNoAdditionalChildren.js';
import Color from '../../../scenery/js/util/Color.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../../tambo/js/TSoundPlayer.js';
import EventType from '../../../tandem/js/EventType.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';
import RadioButtonInteractionStateProperty from './RadioButtonInteractionStateProperty.js';
import RectangularButton, { type RectangularButtonOptions } from './RectangularButton.js';
import type TButtonAppearanceStrategy from './TButtonAppearanceStrategy.js';
import { type TButtonAppearanceStrategyOptions } from './TButtonAppearanceStrategy.js';
import type TContentAppearanceStrategy from './TContentAppearanceStrategy.js';
import { type TContentAppearanceStrategyOptions } from './TContentAppearanceStrategy.js';

type SelfOptions = {

  // Sound generation - If set to null a default will be used that is based on this button's position within the radio
  // button group.  Can be set to nullSoundPlayer to turn off all sound generation.
  soundPlayer?: TSoundPlayer | null;
};

export type RectangularRadioButtonOptions = SelfOptions &
  // These options are not appropriate for radio buttons, see https://github.com/phetsims/sun/issues/847
  StrictOmit<TrimParallelDOMOptions<RectangularButtonOptions>, 'enabledProperty' | 'enabled' | 'voicingFocusListener'>;

export default class RectangularRadioButton<T> extends RectangularButton {

  // the Property this button changes
  public readonly property: TProperty<T>;

  // the value that is set to the Property when this button is pressed
  public readonly value: T;

  public readonly interactionStateProperty: RadioButtonInteractionStateProperty<T>;

  private readonly firedEmitter: TEmitter;

  private readonly disposeRectangularRadioButton: () => void;

  /**
   * @param property - axon Property that can take on a set of values, one for each radio button in the group
   * @param value - value when this radio button is selected
   * @param providedOptions
   */
  public constructor( property: TProperty<T>, value: T, providedOptions?: RectangularRadioButtonOptions ) {
    assert && assert( property.valueComparisonStrategy === 'reference',
      'RectangularRadioButton depends on "===" equality for value comparison' );

    const options = optionize<RectangularRadioButtonOptions, SelfOptions, RectangularButtonOptions>()( {

      // SelfOptions
      soundPlayer: null,

      // RectangularButtonOptions
      baseColor: ColorConstants.LIGHT_BLUE,
      buttonAppearanceStrategy: RectangularRadioButton.FlatAppearanceStrategy,
      buttonAppearanceStrategyOptions: {
        overButtonOpacity: 0.8,
        overStroke: null,
        selectedStroke: Color.BLACK,
        selectedLineWidth: 1.5,
        selectedButtonOpacity: 1,
        deselectedStroke: new Color( 50, 50, 50 ),
        deselectedLineWidth: 1,
        deselectedButtonOpacity: 0.6
      },
      contentAppearanceStrategy: RectangularRadioButton.ContentAppearanceStrategy,
      contentAppearanceStrategyOptions: {
        overContentOpacity: 0.8,
        selectedContentOpacity: 1,
        deselectedContentOpacity: 0.6
      },
      listenerOptions: {
        tandem: Tandem.OPT_OUT // we make a firedEmitter which is sufficient
      },

      // pdom
      tagName: 'input',
      inputType: 'radio',
      labelTagName: 'label',
      containerTagName: 'li',
      appendDescription: true,
      appendLabel: true,
      accessibleNameBehavior: Voicing.BASIC_ACCESSIBLE_NAME_BEHAVIOR,

      // The group of radio buttons is responsible for implementing the Voicing output on focus.
      voicingFocusListener: null,

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'RadioButton'
    }, providedOptions );

    // ButtonModel is responsible for enabledProperty, so propagate enabledPropertyOptions.
    // tandem is also propagated because we want enabledProperty to appear as a child of this button.
    // Since enabledProperty is unrelated to the look of the button when selected/deselected, we've also included
    // phetioEnabledPropertyInstrumented so that one can opt out of this potentially confusing instrumentation.
    // See https://github.com/phetsims/sun/issues/847.
    const buttonModel = new ButtonModel( {
      enabledPropertyOptions: options.enabledPropertyOptions,
      tandem: options.tandem,
      phetioEnabledPropertyInstrumented: false // Uninstrumented in https://github.com/phetsims/sun/issues/920
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
      phetioReadOnly: true, // Use the Property to change the radio button value, see https://github.com/phetsims/studio/issues/323
      phetioEventType: EventType.USER
    } );

    this.firedEmitter.addListener( () => property.set( value ) );

    // When the button model triggers an event, fire from the radio button
    buttonModel.downProperty.link( down => {
      if ( !down && ( buttonModel.overProperty.get() || buttonModel.focusedProperty.get() ) && !buttonModel.interrupted ) {
        this.fire();

        // The event came from mouse/touch, so request responses. Focus related output is managed by the group.
        // If you happen to have a pointer over the button that receives focus, you will get two responses
        // and the last one will take precedence.
        if ( buttonModel.overProperty.get() ) {
          this.voicingSpeakFullResponse( {
            hintResponse: null
          } );
        }
      }
    } );

    // sound generation
    const soundPlayer = options.soundPlayer || sharedSoundPlayers.get( 'pushButton' );
    const playSound = () => { soundPlayer.play(); };
    buttonModel.fireCompleteEmitter.addListener( playSound );

    this.disposeRectangularRadioButton = () => {
      property.unlink( pdomCheckedListener );
      this.firedEmitter.dispose();
      buttonModel.fireCompleteEmitter.removeListener( playSound );
      buttonModel.dispose();
      this.interactionStateProperty.dispose();
    };

    // Adding children to UI components with content is problematic for dynamic layout.
    assert && assertNoAdditionalChildren( this );
  }

  public override dispose(): void {
    this.disposeRectangularRadioButton();
    super.dispose();
  }

  /**
   * fire on up if the button is enabled, public for use in the accessibility tree
   */
  public fire(): void {
    if ( this.buttonModel.enabledProperty.get() ) {
      this.firedEmitter.emit();
      this.buttonModel.fireCompleteEmitter.emit();
    }
  }

  /**
   * FlatAppearanceStrategy is a value for RectangularRadioButton options.buttonAppearanceStrategy. It makes radio buttons
   * that look flat, i.e. no shading or highlighting, but that change color on mouseover, press, selected, etc.
   */
  public static override readonly FlatAppearanceStrategy: TButtonAppearanceStrategy = class FlatAppearanceStrategy {

    public readonly maxLineWidth: number;

    private readonly disposeFlatAppearanceStrategy: () => void;

    /**
     * buttonBackground is the Node for the button's background, sans content
     */
    public constructor( buttonBackground: PaintableNode,
                        interactionStateProperty: TReadOnlyProperty<RadioButtonInteractionState>,
                        baseColorProperty: TReadOnlyProperty<Color>,
                        providedOptions?: TButtonAppearanceStrategyOptions ) {

      const options = optionize<TButtonAppearanceStrategyOptions>()( {
        stroke: baseColorProperty,
        lineWidth: 1,
        deselectedButtonOpacity: 1,
        deselectedLineWidth: 1,
        deselectedStroke: 'gray',
        deselectedFill: null,
        overButtonOpacity: 0.8,
        overFill: null,
        overLineWidth: 0,
        overStroke: null,
        selectedButtonOpacity: 1,
        selectedLineWidth: 1,
        selectedStroke: 'black'
      }, providedOptions );

      // Dynamic fills and strokes
      const pressedFillProperty = new PaintColorProperty( baseColorProperty, {
        luminanceFactor: -0.4
      } );
      const overFillProperty = new PaintColorProperty( options.overFill || baseColorProperty, {
        luminanceFactor: providedOptions && providedOptions.overFill ? 0 : 0.4
      } );

      // Editorial Note: The code below, where the deselected stroke is used as the value for the over stroke if no over
      // stroke is provided, seems a bit odd.  However, I (jbphet) tried removing it when refactoring this to support
      // TypeScript, and a number of sims broke.  The code was reviewed and discussed with some other devs, and we
      // decided to leave it as is, despite it being a bit unintuitive.  See https://github.com/phetsims/sun/issues/772.
      const overStrokeProperty = new PaintColorProperty( options.overStroke || options.deselectedStroke, {
        luminanceFactor: providedOptions && providedOptions.overStroke ? 0 : -0.4
      } );

      this.maxLineWidth = Math.max( options.selectedLineWidth, options.deselectedLineWidth, options.overLineWidth );

      // Cache colors
      buttonBackground.cachedPaints = [
        baseColorProperty, overFillProperty, pressedFillProperty, overStrokeProperty, options.selectedStroke, options.deselectedStroke
      ];

      // Change colors and opacity to match interactionState
      function interactionStateListener( interactionState: RadioButtonInteractionState ): void {
        switch( interactionState ) {

          case RadioButtonInteractionState.SELECTED:
            buttonBackground.fill = baseColorProperty;
            buttonBackground.stroke = options.selectedStroke;
            buttonBackground.lineWidth = options.selectedLineWidth;
            buttonBackground.opacity = options.selectedButtonOpacity;
            break;

          case RadioButtonInteractionState.DESELECTED:
            buttonBackground.fill = options.deselectedFill || baseColorProperty;
            buttonBackground.stroke = options.deselectedStroke;
            buttonBackground.lineWidth = options.deselectedLineWidth;
            buttonBackground.opacity = options.deselectedButtonOpacity;
            break;

          case RadioButtonInteractionState.OVER:
            buttonBackground.fill = overFillProperty;
            buttonBackground.stroke = overStrokeProperty;
            buttonBackground.lineWidth = Math.max( options.overLineWidth, options.deselectedLineWidth );
            buttonBackground.opacity = options.overButtonOpacity;
            break;

          case RadioButtonInteractionState.PRESSED:
            buttonBackground.fill = pressedFillProperty;
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
        overStrokeProperty.dispose();
        overFillProperty.dispose();
        pressedFillProperty.dispose();
      };
    }

    public dispose(): void {
      this.disposeFlatAppearanceStrategy();
    }
  };

  /**
   * ContentAppearanceStrategy is a value for RectangularRadioButton options.contentAppearanceStrategy. It changes
   * their look based on the value of interactionStateProperty.
   */
  public static readonly ContentAppearanceStrategy: TContentAppearanceStrategy = class ContentAppearanceStrategy {

    private readonly disposeContentAppearanceStrategy: () => void;

    public constructor( content: Node,
                        interactionStateProperty: TReadOnlyProperty<RadioButtonInteractionState>,
                        providedOptions?: TContentAppearanceStrategyOptions ) {

      const options = optionize<TContentAppearanceStrategyOptions>()( {
        deselectedContentOpacity: 1,
        overContentOpacity: 1,
        selectedContentOpacity: 1
      }, providedOptions );

      // The button is not the parent of the content, therefore it is necessary to set the opacity on the content separately
      function handleInteractionStateChanged( state: RadioButtonInteractionState ): void {
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
  };
}

sun.register( 'RectangularRadioButton', RectangularRadioButton );