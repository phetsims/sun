// Copyright 2019-2022, University of Colorado Boulder

/**
 * DefaultSliderTrack is composed of two rectangles, one for the enabled section of the track and one for the disabled
 * section.  The enabled track rectangle sits on top of the disabled track so that the enabled range can be any
 * desired sub range of the full slider range.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Multilink from '../../axon/js/Multilink.js';
import TProperty from '../../axon/js/TProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Range from '../../dot/js/Range.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import { TPaint, Node, Rectangle } from '../../scenery/js/imports.js';
import { default as SliderTrack, SliderTrackOptions } from './SliderTrack.js';
import sun from './sun.js';

type SelfOptions = {
  fillEnabled?: TPaint;
  fillDisabled?: TPaint;
  stroke?: TPaint;

  lineWidth?: number;
  cornerRadius?: number;
};

// We require size/enabledRangeProperty instead of leaving it optional for the supertype
export type DefaultSliderTrackOptions = SelfOptions & SliderTrackOptions & PickRequired<SliderTrackOptions, 'size' | 'enabledRangeProperty'>;

export default class DefaultSliderTrack extends SliderTrack {

  private readonly disposeDefaultSliderTrack: () => void;

  public constructor( valueProperty: TProperty<number>, range: Range | TReadOnlyProperty<Range>, providedOptions?: DefaultSliderTrackOptions ) {

    const options = optionize<DefaultSliderTrackOptions, SelfOptions, SliderTrackOptions>()( {
      fillEnabled: 'white',
      fillDisabled: 'gray',
      stroke: 'black',
      lineWidth: 1,
      cornerRadius: 0
    }, providedOptions );

    // Represents the disabled range of the slider, always visible and always the full range
    // of the slider so that when the enabled range changes we see the enabled sub-range on top of the
    // full range of the slider.
    const disabledTrack = new Rectangle( {
      fill: options.fillDisabled,
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      cornerRadius: options.cornerRadius,
      cursor: 'default',
      pickable: false
    } );

    // Will change size depending on the enabled range of the slider.  On top so that we can see
    // the enabled sub-range of the slider.
    const enabledTrack = new Rectangle( {
      fill: options.fillEnabled,
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      cornerRadius: options.cornerRadius
    } );

    const trackNode = new Node( {
      children: [ disabledTrack, enabledTrack ]
    } );
    super( valueProperty, trackNode, range, combineOptions<SliderTrackOptions>( {

      // Historically, our stroke will overflow
      leftVisualOverflow: options.stroke !== null ? options.lineWidth / 2 : 0,
      rightVisualOverflow: options.stroke !== null ? options.lineWidth / 2 : 0
    }, options ) );

    // when the enabled range changes gray out the unusable parts of the slider
    const updateMultilink = Multilink.multilink( [
      options.enabledRangeProperty,
      this.valueToPositionProperty,
      this.sizeProperty
    ], ( enabledRange, valueToPosition, size ) => {
      const enabledMinX = valueToPosition.evaluate( enabledRange.min );
      const enabledMaxX = valueToPosition.evaluate( enabledRange.max );

      disabledTrack.setRect( 0, 0, size.width, size.height );
      enabledTrack.setRect( enabledMinX, 0, enabledMaxX - enabledMinX, size.height );
    } );

    this.disposeDefaultSliderTrack = () => {
      updateMultilink.dispose();
    };
  }

  public override dispose(): void {
    this.disposeDefaultSliderTrack();
    super.dispose();
  }
}

sun.register( 'DefaultSliderTrack', DefaultSliderTrack );
