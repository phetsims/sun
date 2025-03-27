// Copyright 2014-2025, University of Colorado Boulder

/**
 * ToggleSwitch is a switch for toggling between 2 values, similar to iOS' UISwitch, used in iOS `'Settings' app.
 *
 * Interaction behavior is as follows:
 * Drag the thumb to change the value, or click anywhere to toggle the value.
 * If you click without dragging, it's a toggle.
 * If you drag but don't cross the midpoint of the track, then it's a toggle.
 * If you drag past the midpoint of the track, releasing the thumb snaps to whichever end the thumb is closest to.
 * If you drag the thumb far enough to the side (outside of the switch), it will immediately toggle the model behavior.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Emitter from '../../axon/js/Emitter.js';
import type Property from '../../axon/js/Property.js';
import type TEmitter from '../../axon/js/TEmitter.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Vector2 from '../../dot/js/Vector2.js';
import Shape from '../../kite/js/Shape.js';
import optionize from '../../phet-core/js/optionize.js';
import { type TrimParallelDOMOptions } from '../../scenery/js/accessibility/pdom/ParallelDOM.js';
import Voicing, { type VoicingOptions } from '../../scenery/js/accessibility/voicing/Voicing.js';
import DragListener from '../../scenery/js/listeners/DragListener.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import SceneryConstants from '../../scenery/js/SceneryConstants.js';
import LinearGradient from '../../scenery/js/util/LinearGradient.js';
import type TPaint from '../../scenery/js/util/TPaint.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../tambo/js/TSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioAction from '../../tandem/js/PhetioAction.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import Utterance, { type TAlertable } from '../../utterance-queue/js/Utterance.js';
import sun from './sun.js';
import { clamp } from '../../dot/js/util/clamp.js';

// constants
const DEFAULT_SIZE = new Dimension2( 60, 30 );

type SelfOptions = {

  // if you want the thumb to be a circle, use width that is 2x height
  size?: Dimension2;

  // controls the behavior of when model value changes occur during dragging (if any)
  // null: triggers model changes when thumb is dragged far enough to the side, similar to iOS
  // true: triggers model changes whenever the thumb crosses sides
  // false: only trigger model changes until release
  toggleWhileDragging?: null | boolean;

  // number of view-space units the drag needs to cover to be considered a "drag" instead of a "click/tap"
  dragThreshold?: number;

  // number of thumb-widths outside the normal range past where the model value will change
  toggleThreshold?: number;

  // thumb
  thumbFill?: TPaint;
  thumbStroke?: TPaint;
  thumbTouchAreaXDilation?: number;
  thumbTouchAreaYDilation?: number;
  thumbMouseAreaXDilation?: number;
  thumbMouseAreaYDilation?: number;

  // track
  trackFillLeft?: TPaint; // track fill when property.value == leftValue, default computed below
  trackFillRight?: TPaint; // track fill when property.value == rightValue, default computed below
  trackStroke?: TPaint;

  // sound
  switchToLeftSoundPlayer?: TSoundPlayer;
  switchToRightSoundPlayer?: TSoundPlayer;

  // If provided, these responses will be spoken to describe the change in context for both Voicing
  // and Interactive Description features when value changes to either left or right value.
  leftValueContextResponse?: TAlertable;
  rightValueContextResponse?: TAlertable;

  // pdom - If true, aria attributes are added to this Node to indicate that it is a switch.
  // Aria switches do not work well when selecting between non-boolean values, so you can disable this if needed.
  accessibleSwitch?: boolean;
};
type ParentOptions = VoicingOptions & NodeOptions;
export type ToggleSwitchOptions = SelfOptions & TrimParallelDOMOptions<ParentOptions>;

export default class ToggleSwitch<T> extends Voicing( Node ) {

  private readonly disposeToggleSwitch: () => void;
  public readonly switchToLeftSoundPlayer: TSoundPlayer;
  public readonly switchToRightSoundPlayer: TSoundPlayer;

  // Emits on input that results in a change to the Property value, after the Property has changed.
  public readonly onInputEmitter: TEmitter = new Emitter();

  /**
   * @param property
   * @param leftValue - value when the switch is in the left position
   * @param rightValue - value when the switch is in the right position
   * @param providedOptions
   */
  public constructor( property: Property<T>, leftValue: T, rightValue: T, providedOptions?: ToggleSwitchOptions ) {

    assert && assert( property.valueComparisonStrategy === 'reference',
      'ToggleSwitch depends on "===" equality for value comparison' );

    const options = optionize<ToggleSwitchOptions, SelfOptions, ParentOptions>()( {

      size: DEFAULT_SIZE,
      toggleWhileDragging: null,
      dragThreshold: 3,
      toggleThreshold: 1,
      thumbFill: null, // {Color|string} thumb fill, default computed below
      thumbStroke: 'black',
      thumbTouchAreaXDilation: 8,
      thumbTouchAreaYDilation: 8,
      thumbMouseAreaXDilation: 0,
      thumbMouseAreaYDilation: 0,
      trackFillLeft: null,
      trackFillRight: null,
      trackStroke: 'black',

      // VoicingOptions
      cursor: 'pointer',
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // sound generation
      switchToLeftSoundPlayer: sharedSoundPlayers.get( 'switchToLeft' ),
      switchToRightSoundPlayer: sharedSoundPlayers.get( 'switchToRight' ),

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Switch',
      phetioEventType: EventType.USER,
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true, // opt into default PhET-iO instrumented enabledProperty
      phetioFeatured: true,

      // pdom
      tagName: 'button',
      accessibleSwitch: true,

      leftValueContextResponse: null,
      rightValueContextResponse: null
    }, providedOptions );

    // Default track fills
    let defaultTrackFill = null;
    if ( !options.trackFillLeft || !options.trackFillRight ) {
      defaultTrackFill = new LinearGradient( 0, 0, 0, options.size.height )
        .addColorStop( 0, 'rgb( 40, 40, 40 )' )
        .addColorStop( 1, 'rgb( 200, 200, 200 )' );
    }
    options.trackFillLeft = options.trackFillLeft || defaultTrackFill;
    options.trackFillRight = options.trackFillRight || defaultTrackFill;

    // Default thumb fill
    options.thumbFill = options.thumbFill ||
                        new LinearGradient( 0, 0, 0, options.size.height )
                          .addColorStop( 0, 'white' )
                          .addColorStop( 1, 'rgb( 200, 200, 200 )' );

    // If an accessibleName is provided, use it as the voicingNameResponse for this component
    if ( options.accessibleName ) {
      options.voicingNameResponse = options.accessibleName;
    }

    super();

    const cornerRadius = options.size.height / 2;

    // track that the thumb slides in
    const trackNode = new Rectangle( 0, 0, options.size.width, options.size.height, cornerRadius, cornerRadius, {
      stroke: options.trackStroke,
      fill: options.trackFillLeft
    } );
    this.addChild( trackNode );

    // track that covers the background track when the thumbNode is in the right position
    const rightTrackFillRectangle = new Rectangle( 0, 0, options.size.width, options.size.height, cornerRadius, cornerRadius, {
      stroke: options.trackStroke,
      fill: options.trackFillRight
    } );
    this.addChild( rightTrackFillRectangle );

    // thumb (aka knob)
    const thumbNode = new Rectangle( 0, 0, 0.5 * options.size.width, options.size.height, cornerRadius, cornerRadius, {
      fill: options.thumbFill,
      stroke: options.thumbStroke
    } );
    this.addChild( thumbNode );

    // thumb touchArea
    if ( options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation ) {
      thumbNode.touchArea = Shape.roundRect(
        -options.thumbTouchAreaXDilation, -options.thumbTouchAreaYDilation,
        ( 0.5 * options.size.width ) + ( 2 * options.thumbTouchAreaXDilation ),
        options.size.height + ( 2 * options.thumbTouchAreaYDilation ), cornerRadius, cornerRadius );
    }

    // thumb mouseArea
    if ( options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation ) {
      thumbNode.mouseArea = Shape.roundRect(
        -options.thumbMouseAreaXDilation, -options.thumbMouseAreaYDilation,
        ( 0.5 * options.size.width ) + ( 2 * options.thumbMouseAreaXDilation ),
        options.size.height + ( 2 * options.thumbMouseAreaYDilation ), cornerRadius, cornerRadius );
    }

    // move thumb and fill track
    const update = ( value: T ) => {

      // adjust by half a line width so the thumbNode's stroke is directly on top of the trackNode's stroke when at
      // each end of the track
      const halfLineWidth = trackNode.lineWidth / 2;
      if ( value === leftValue ) {
        thumbNode.left = -halfLineWidth;
      }
      else {
        thumbNode.right = options.size.width + halfLineWidth;
      }
      rightTrackFillRectangle.rectWidth = thumbNode.right - halfLineWidth;

      if ( options.accessibleSwitch ) {

        // pdom - Signify to screen readers that the toggle is pressed. Both aria-pressed and aria-checked
        // are used because using both sounds best with NVDA.
        this.setPDOMAttribute( 'aria-pressed', value !== leftValue );
        this.setPDOMAttribute( 'aria-checked', value !== leftValue );
      }
    };

    if ( options.accessibleSwitch ) {
      this.ariaRole = 'switch';
    }

    // sync with property, must be unlinked in dispose
    property.link( update );

    // thumb interactivity
    const dragThresholdSquared = options.dragThreshold * options.dragThreshold; // comparing squared magnitudes is a bit faster
    const accumulatedDelta = new Vector2( 0, 0 ); // stores how far we are from where our drag started, in our local coordinate frame
    let passedDragThreshold = false; // whether we have dragged far enough to be considered for "drag" behavior (pick closest side), or "tap" behavior (toggle)

    // Action that is performed when the switch is toggled.
    // Toggles the Property value and sends a phet-io message with the old and new values.
    const toggleAction = new PhetioAction<[ T ]>( value => {
      property.value = value;

      this.onInputEmitter.emit();
    }, {
      parameters: [ { validValues: [ leftValue, rightValue ], phetioPrivate: true } ],
      tandem: options.tandem.createTandem( 'toggleAction' ),
      phetioDocumentation: 'Occurs when the switch is toggled via user interaction',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: EventType.USER
    } );

    this.onInputEmitter.addListener( () => {

      // sound
      property.value === leftValue ? options.switchToLeftSoundPlayer.play() : options.switchToRightSoundPlayer.play();

      // voicing/interactive description
      const alert = property.value === rightValue ? options.rightValueContextResponse : options.leftValueContextResponse;
      if ( alert ) {
        this.addAccessibleResponse( alert );
        this.voicingSpeakResponse( {
          contextResponse: Utterance.alertableToText( alert )
        } );
      }
    } );

    // Gets the value that corresponds to the current thumb position.
    const thumbPositionToValue = () => ( thumbNode.centerX < trackNode.centerX ) ? leftValue : rightValue;

    const dragListener = new DragListener( {
      tandem: options.tandem.createTandem( 'dragListener' ),

      // Only touch to snag when moving the thumb (don't snag on the track itself),
      // but still support presses in the track to toggle the value.
      canStartPress: event => {
        if ( event && ( event.type === 'move' || event.type === 'enter' ) ) {
          return _.includes( event.trail.nodes, thumbNode );
        }
        else {
          return true;
        }
      },

      start: () => {
        // resets our state
        accumulatedDelta.setXY( 0, 0 ); // reset it mutably (less allocation)
        passedDragThreshold = false;
      },

      drag: ( event, listener ) => {

        accumulatedDelta.add( listener.modelDelta );
        passedDragThreshold = passedDragThreshold || ( accumulatedDelta.magnitudeSquared > dragThresholdSquared );

        // center the thumb on the pointer's x-coordinate if possible (but clamp to left and right ends)
        const viewPoint = listener.getCurrentTarget().globalToLocalPoint( event.pointer.point );
        const halfThumbWidth = thumbNode.width / 2;
        const halfLineWidth = trackNode.lineWidth / 2;
        thumbNode.centerX = clamp( viewPoint.x, halfThumbWidth - halfLineWidth, options.size.width - halfThumbWidth + halfLineWidth );
        rightTrackFillRectangle.rectWidth = thumbNode.right - halfLineWidth;

        // whether the thumb is dragged outside of the possible range far enough beyond our threshold to potentially
        // trigger an immediate model change
        const isDraggedOutside = viewPoint.x < ( 1 - 2 * options.toggleThreshold ) * halfThumbWidth ||
                                 viewPoint.x > ( -1 + 2 * options.toggleThreshold ) * halfThumbWidth + options.size.width;

        // value that corresponds to the current thumb position
        const value = thumbPositionToValue();


        if ( options.toggleWhileDragging === true || ( isDraggedOutside && options.toggleWhileDragging === null ) ) {

          // Only signify a change if the value actually changed to avoid duplicate messages in the PhET-iO Event
          // stream, see https://github.com/phetsims/phet-io/issues/369
          if ( property.value !== value ) {
            toggleAction.execute( value );
          }
        }
      },

      end: () => {

        // if moved past the threshold, choose value based on the side, otherwise just toggle
        const toggleValue = ( property.value === leftValue ? rightValue : leftValue );
        const value = passedDragThreshold ? thumbPositionToValue() : toggleValue;

        if ( property.value !== value ) {
          toggleAction.execute( value );
        }

        // update the thumb position (sanity check that it's here, only needs to be run if passedDragThreshold===true)
        update( value );
      },

      // pdom - allow click events to toggle the ToggleSwitch, even though it uses DragListener
      canClick: true
    } );
    this.addInputListener( dragListener );

    this.mutate( options );

    // Add a link to the Property that this switch controls
    this.addLinkedElement( property, {
      tandemName: 'property'
    } );

    // Make the sound players available to external clients that directly set the Property and thus should play the
    // corresponding sound.
    this.switchToLeftSoundPlayer = options.switchToLeftSoundPlayer;
    this.switchToRightSoundPlayer = options.switchToRightSoundPlayer;

    this.disposeToggleSwitch = () => {
      trackNode.dispose();
      rightTrackFillRectangle.dispose();
      property.unlink( update );
      toggleAction.dispose();
      dragListener.dispose();
      this.onInputEmitter.dispose();
    };
  }

  public override dispose(): void {
    this.disposeToggleSwitch();
    super.dispose();
  }
}

sun.register( 'ToggleSwitch', ToggleSwitch );