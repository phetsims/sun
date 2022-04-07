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

import IProperty from '../../axon/js/IProperty.js';
import Range from '../../dot/js/Range.js';
import optionize from '../../phet-core/js/optionize.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import { IPaint, Node, Rectangle } from '../../scenery/js/imports.js';
import { default as SliderTrack, SliderTrackOptions } from './SliderTrack.js';
import sun from './sun.js';

type SelfOptions = {
  fillEnabled?: IPaint;
  fillDisabled?: IPaint;
  stroke?: IPaint;

  lineWidth?: number;
  cornerRadius?: number;
};

// We require size/enabledRangeProperty instead of leaving it optional for the supertype
export type DefaultSliderTrackOptions = SelfOptions & SliderTrackOptions & PickRequired<SliderTrackOptions, 'size' | 'enabledRangeProperty'>;

export default class DefaultSliderTrack extends SliderTrack {

  private readonly enabledTrack: Rectangle;
  private readonly disposeDefaultSliderTrack: () => void;

  constructor( valueProperty: IProperty<number>, range: Range, providedOptions?: DefaultSliderTrackOptions ) {

    const options = optionize<DefaultSliderTrackOptions, SelfOptions, SliderTrackOptions>( {
      fillEnabled: 'white',
      fillDisabled: 'gray',
      stroke: 'black',
      lineWidth: 1,
      cornerRadius: 0
    }, providedOptions );

    // Represents the disabled range of the slider, always visible and always the full range
    // of the slider so that when the enabled range changes we see the enabled sub-range on top of the
    // full range of the slider.
    const disabledTrack = new Rectangle( 0, 0, options.size.width, options.size.height, {
      fill: options.fillDisabled,
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      cornerRadius: options.cornerRadius,
      cursor: 'default',
      pickable: false
    } );

    // Will change size depending on the enabled range of the slider.  On top so that we can see
    // the enabled sub-range of the slider.
    const enabledTrack = new Rectangle( 0, 0, options.size.width, options.size.height, {
      fill: options.fillEnabled,
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      cornerRadius: options.cornerRadius
    } );

    const trackNode = new Node( {
      children: [ disabledTrack, enabledTrack ]
    } );
    super( trackNode, valueProperty, range, options );

    this.enabledTrack = enabledTrack;

    // when the enabled range changes gray out the unusable parts of the slider
    const enabledRangeObserver = ( enabledRange: Range ) => {
      const minViewCoordinate = this.valueToPosition.evaluate( enabledRange.min );
      const maxViewCoordinate = this.valueToPosition.evaluate( enabledRange.max );

      // update the geometry of the enabled track
      const enabledWidth = maxViewCoordinate - minViewCoordinate;
      this.enabledTrack.setRect( minViewCoordinate, 0, enabledWidth, this.size.height );
    };
    options.enabledRangeProperty.link( enabledRangeObserver ); // needs to be unlinked in dispose function

    this.disposeDefaultSliderTrack = () => options.enabledRangeProperty.unlink( enabledRangeObserver );
  }

  public override dispose(): void {
    this.disposeDefaultSliderTrack();
    super.dispose();
  }
}

sun.register( 'DefaultSliderTrack', DefaultSliderTrack );
