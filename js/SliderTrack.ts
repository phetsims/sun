// Copyright 2016-2022, University of Colorado Boulder

/**
 * Shows a track on a slider.  Must be supplied a Node for rendering the track.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import TProperty from '../../axon/js/TProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import LinearFunction from '../../dot/js/LinearFunction.js';
import Range from '../../dot/js/Range.js';
import ValueChangeSoundPlayer, { ValueChangeSoundPlayerOptions } from '../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import optionize from '../../phet-core/js/optionize.js';
import { DragListener, Node, NodeOptions, SceneryEvent, Trail, WidthSizable } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import Slider from './Slider.js';
import { VoicingOnEndResponse } from './accessibility/AccessibleValueHandler.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';

type SelfOptions = {
  // NOTE: for backwards-compatibility, the size does NOT include the extent of the stroke, so the track will be larger
  // than this size
  size?: Dimension2;

  // called when a drag sequence starts
  startDrag?: ( e: SceneryEvent ) => void;

  // called at the beginning of a drag event, before any other drag work happens
  drag?: ( e: SceneryEvent ) => void;

  // called when a drag sequence ends
  endDrag?: ( e: SceneryEvent | null ) => void;

  // called before valueProperty is set
  constrainValue?: ( n: number ) => number;

  // Defaults to a constant range
  enabledRangeProperty?: TReadOnlyProperty<Range>;

  // This is used to generate sounds when clicking in the track.  If not provided, the default sound generator
  // will be created. If set to null, the slider will generate no sound.
  soundGenerator?: ValueChangeSoundPlayer | null;

  // Options for the default sound generator.  These should only be provided when using the default.
  valueChangeSoundGeneratorOptions?: ValueChangeSoundPlayerOptions;

  // Announces the voicing response at the end of an interaction. Used by AccessibleValueHandler, see
  // Slider for an example usage.
  voicingOnEndResponse?: VoicingOnEndResponse;

  // Since our historical slider tracks extend PAST the 0,size range (e.g. with strokes), and this information is needed
  // so we can control the size based on our preferredWidth. We'll need the size to be somewhat smaller than our
  // preferredWidth
  leftVisualOverflow?: number;
  rightVisualOverflow?: number;
};

export type SliderTrackOptions = SelfOptions & NodeOptions;

export default class SliderTrack extends WidthSizable( Node ) {

  protected readonly minimumSize: Dimension2;
  protected readonly internalWidthProperty: TReadOnlyProperty<number>;
  protected readonly sizeProperty: TReadOnlyProperty<Dimension2>;

  // For use by Slider, maps the value along the range of the track to the position along the width of the track
  public readonly valueToPositionProperty: TReadOnlyProperty<LinearFunction>;

  // public so that clients can access Properties of the DragListener that tell us about its state
  // See https://github.com/phetsims/sun/issues/680
  public readonly dragListener: DragListener;

  // (sun-internal)
  public readonly rangeProperty: TReadOnlyProperty<Range>;
  public readonly leftVisualOverflow: number;
  public readonly rightVisualOverflow: number;

  private readonly disposeSliderTrack: () => void;

  public constructor( valueProperty: TProperty<number>, trackNode: Node, range: Range | TReadOnlyProperty<Range>, providedOptions?: SliderTrackOptions ) {
    super();

    this.rangeProperty = range instanceof Range ? new TinyProperty( range ) : range;

    const options = optionize<SliderTrackOptions, SelfOptions, NodeOptions>()( {
      size: new Dimension2( 100, 5 ),
      startDrag: _.noop, // called when a drag sequence starts
      drag: _.noop, // called at the beginning of a drag event, before any other drag work happens
      endDrag: _.noop, // called when a drag sequence ends
      constrainValue: _.identity, // called before valueProperty is set
      enabledRangeProperty: this.rangeProperty,
      soundGenerator: Slider.DEFAULT_SOUND,
      valueChangeSoundGeneratorOptions: {},
      voicingOnEndResponse: _.noop,

      leftVisualOverflow: 0,
      rightVisualOverflow: 0,

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'TrackNode'
    }, providedOptions );

    // If no sound generator was provided, create the default.
    if ( options.soundGenerator === Slider.DEFAULT_SOUND ) {
      // NOTE: We'll want to update ValueChangeSoundPlayer for dynamic ranges if it's used more for that
      options.soundGenerator = new ValueChangeSoundPlayer( this.rangeProperty.value, options.valueChangeSoundGeneratorOptions || {} );
    }
    else if ( options.soundGenerator === null ) {
      options.soundGenerator = ValueChangeSoundPlayer.NO_SOUND;
    }

    this.leftVisualOverflow = options.leftVisualOverflow;
    this.rightVisualOverflow = options.rightVisualOverflow;

    this.minimumSize = options.size;
    this.minimumWidth = this.minimumSize.width;
    this.internalWidthProperty = new DerivedProperty( [ this.localPreferredWidthProperty ], localPreferredWidth => {
      // Our preferred width should be subtracted out by the anticipated overflow, so that our size can be slightly
      // smaller.
      return (
               localPreferredWidth === null
               ? this.minimumSize.width
               : Math.max( this.minimumSize.width, localPreferredWidth )
             ) - options.leftVisualOverflow - options.rightVisualOverflow;
    } );
    this.sizeProperty = new DerivedProperty( [
      this.internalWidthProperty
    ], width => new Dimension2( width, this.minimumSize.height ) );

    // NOTE: Slider needs to make a lot of assumptions about how this works (in order to figure out proper layout).
    // DO NOT change without taking a CLOSE CLOSE look at Slider's layout code.
    this.valueToPositionProperty = new DerivedProperty( [ this.rangeProperty, this.internalWidthProperty ], ( range, width ) => {
      return new LinearFunction( range.min, range.max, 0, width, true /* clamp */ );
    } );

    // click in the track to change the value, continue dragging if desired
    const handleTrackEvent = ( event: SceneryEvent, trail: Trail ) => {
      const oldValue = valueProperty.value;
      const transform = trail.subtrailTo( this ).getTransform();
      const x = transform.inversePosition2( event.pointer.point ).x;
      const value = this.valueToPositionProperty.value.inverse( x );
      const valueInRange = options.enabledRangeProperty.value.constrainValue( value );
      const newValue = options.constrainValue( valueInRange );
      valueProperty.set( newValue );

      // Down events on the track can cause value changes.  If that's what just happened, play a sound.
      if ( event.type === 'down' ) {
        options.soundGenerator!.playSoundIfThresholdReached( newValue, oldValue );
      }
    };

    this.addChild( trackNode );

    let valueOnStart = valueProperty.value;
    this.dragListener = new DragListener( {
      tandem: options.tandem.createTandem( 'dragListener' ),

      start: ( event, listener ) => {
        options.startDrag( event );
        valueOnStart = valueProperty.value;
        handleTrackEvent( event, listener.pressedTrail );
      },

      drag: ( event, listener ) => {
        options.drag( event );

        // Reuse the same handleTrackEvent but make sure the startedCallbacks call is made before the value changes
        handleTrackEvent( event, listener.pressedTrail );
      },

      end: event => {
        options.endDrag( event );
        options.voicingOnEndResponse( valueOnStart );
      }
    } );
    trackNode.addInputListener( this.dragListener );

    this.mutate( options );

    this.disposeSliderTrack = () => {
      trackNode.removeInputListener( this.dragListener );
      this.dragListener.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSliderTrack();
    super.dispose();
  }
}

sun.register( 'SliderTrack', SliderTrack );
