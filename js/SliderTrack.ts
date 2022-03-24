// Copyright 2016-2022, University of Colorado Boulder

/**
 * Shows a track on a slider.  Must be supplied a Node for rendering the track.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import IProperty from '../../axon/js/IProperty.js';
import IReadOnlyProperty from '../../axon/js/IReadOnlyProperty.js';
import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import LinearFunction from '../../dot/js/LinearFunction.js';
import Range from '../../dot/js/Range.js';
import ValueChangeSoundGenerator, { ValueChangeSoundGeneratorOptions } from '../../tambo/js/sound-generators/ValueChangeSoundGenerator.js';
import optionize from '../../phet-core/js/optionize.js';
import { DragListener, Node, NodeOptions, SceneryEvent, Trail } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import Slider from './Slider.js';

type SelfOptions = {
  size?: Dimension2;

  // called when a drag sequence starts
  startDrag?: ( e: SceneryEvent ) => void;

  // called at the beginning of a drag event, before any other drag work happens
  drag?: ( e: SceneryEvent ) => void;

  // called when a drag sequence ends
  endDrag?: () => void;

  // called before valueProperty is set
  constrainValue?: ( n: number ) => number;

  // Defaults to a constant range
  enabledRangeProperty?: IReadOnlyProperty<Range>;

  // This is used to generate sounds when clicking in the track.  If not provided, the default sound generator
  // will be created. If set to null, the slider will generate no sound.
  soundGenerator?: ValueChangeSoundGenerator | null;

  // Options for the default sound generator.  These should only be provided when using the default.
  valueChangeSoundGeneratorOptions?: ValueChangeSoundGeneratorOptions;
};

export type SliderTrackOptions = SelfOptions & NodeOptions;

export default class SliderTrack extends Node {

  readonly size: Dimension2;

  // maps the value along the range of the track to the position along the width of the track
  readonly valueToPosition: LinearFunction;

  // public so that clients can access Properties of the DragListener that tell us about its state
  // See https://github.com/phetsims/sun/issues/680
  readonly dragListener: DragListener;

  private disposeSliderTrack: () => void;

  constructor( trackNode: Node, valueProperty: IProperty<number>, range: Range, providedOptions?: SliderTrackOptions ) {
    super();

    const options = optionize<SliderTrackOptions, SelfOptions, NodeOptions, 'tandem'>( {
      size: new Dimension2( 100, 5 ),
      startDrag: _.noop, // called when a drag sequence starts
      drag: _.noop, // called at the beginning of a drag event, before any other drag work happens
      endDrag: _.noop, // called when a drag sequence ends
      constrainValue: _.identity, // called before valueProperty is set
      enabledRangeProperty: new Property( new Range( range.min, range.max ) ), // Defaults to a constant range
      soundGenerator: Slider.DEFAULT_SOUND,
      valueChangeSoundGeneratorOptions: {},

      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // If no sound generator was provided, create the default.
    if ( options.soundGenerator === Slider.DEFAULT_SOUND ) {
      options.soundGenerator = new ValueChangeSoundGenerator( range, options.valueChangeSoundGeneratorOptions || {} );
    }
    else if ( options.soundGenerator === null ) {
      options.soundGenerator = ValueChangeSoundGenerator.NO_SOUND;
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

    this.dragListener = new DragListener( {
      tandem: options.tandem.createTandem( 'dragListener' ),

      start: ( event, listener ) => {
        options.startDrag( event );
        handleTrackEvent( event, listener.pressedTrail );
      },

      drag: ( event, listener ) => {
        options.drag( event );

        // Reuse the same handleTrackEvent but make sure the startedCallbacks call is made before the value changes
        handleTrackEvent( event, listener.pressedTrail );
      },

      end: () => {
        options.endDrag();
      }
    } );
    trackNode.addInputListener( this.dragListener );

    this.mutate( options );

    // Called by dispose
    this.disposeSliderTrack = () => {
      this.dragListener.dispose();
    };
  }

  dispose() {
    this.disposeSliderTrack();
    super.dispose();
  }
}

sun.register( 'SliderTrack', SliderTrack );
