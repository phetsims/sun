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
import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import LinearFunction from '../../dot/js/LinearFunction.js';
import Range from '../../dot/js/Range.js';
import ValueChangeSoundPlayer, { ValueChangeSoundPlayerOptions } from '../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import optionize from '../../phet-core/js/optionize.js';
import { DragListener, Node, NodeOptions, SceneryEvent, Trail } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import Slider from './Slider.js';
import { VoicingOnEndResponse } from './accessibility/AccessibleValueHandler.js';

type SelfOptions = {
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
};

export type SliderTrackOptions = SelfOptions & NodeOptions;

export default class SliderTrack extends Node {

  public readonly size: Dimension2;

  // For use by Slider, maps the value along the range of the track to the position along the width of the track
  public readonly valueToPosition: LinearFunction;

  // public so that clients can access Properties of the DragListener that tell us about its state
  // See https://github.com/phetsims/sun/issues/680
  public readonly dragListener: DragListener;

  private readonly disposeSliderTrack: () => void;

  public constructor( valueProperty: TProperty<number>, trackNode: Node, range: Range, providedOptions?: SliderTrackOptions ) {
    super();

    const options = optionize<SliderTrackOptions, SelfOptions, NodeOptions>()( {
      size: new Dimension2( 100, 5 ),
      startDrag: _.noop, // called when a drag sequence starts
      drag: _.noop, // called at the beginning of a drag event, before any other drag work happens
      endDrag: _.noop, // called when a drag sequence ends
      constrainValue: _.identity, // called before valueProperty is set
      enabledRangeProperty: new Property( new Range( range.min, range.max ) ), // Defaults to a constant range
      soundGenerator: Slider.DEFAULT_SOUND,
      valueChangeSoundGeneratorOptions: {},
      voicingOnEndResponse: _.noop,

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemSuffix: 'TrackNode'
    }, providedOptions );

    // If no sound generator was provided, create the default.
    if ( options.soundGenerator === Slider.DEFAULT_SOUND ) {
      options.soundGenerator = new ValueChangeSoundPlayer( range, options.valueChangeSoundGeneratorOptions || {} );
    }
    else if ( options.soundGenerator === null ) {
      options.soundGenerator = ValueChangeSoundPlayer.NO_SOUND;
    }

    this.size = options.size;
    this.valueToPosition = new LinearFunction( range.min, range.max, 0, this.size.width, true /* clamp */ );

    // click in the track to change the value, continue dragging if desired
    const handleTrackEvent = ( event: SceneryEvent, trail: Trail ) => {
      assert && assert( this.valueToPosition, 'valueToPosition should be defined' );

      const oldValue = valueProperty.value;
      const transform = trail.subtrailTo( this ).getTransform();
      const x = transform.inversePosition2( event.pointer.point ).x;
      const value = this.valueToPosition.inverse( x );
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
      this.dragListener.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSliderTrack();
    super.dispose();
  }
}

sun.register( 'SliderTrack', SliderTrack );
