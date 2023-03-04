// Copyright 2016-2023, University of Colorado Boulder

/**
 * A default slider thumb, currently intended for use only in HSlider. It's a rectangle with a vertical white line down
 * the center.  The origin is at the top left (HSlider uses the thumb center for positioning).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../dot/js/Dimension2.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { TPaint, Path, PressListener, Rectangle, RectangleOptions } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

type SelfOptions = {
  size?: Dimension2;
  fillHighlighted?: TPaint;
  centerLineStroke?: TPaint;
};

type SliderThumbOptions = SelfOptions & StrictOmit<RectangleOptions, 'cachedPaints'>;

export default class SliderThumb extends Rectangle {

  public constructor( providedOptions: SliderThumbOptions ) {

    const options = optionize<SliderThumbOptions, SelfOptions, RectangleOptions>()( {

      // SelfOptions
      size: new Dimension2( 22, 45 ),
      fillHighlighted: 'rgb( 71, 207, 255 )',
      centerLineStroke: 'white',

      // RectangleOptions
      fill: 'rgb( 50, 145, 184 )',
      stroke: 'black',
      lineWidth: 1,
      tandem: Tandem.REQUIRED, // Slider.js adds to this tandem to nest its dragListener under the thumb.
      tandemNameSuffix: 'ThumbNode'
    }, providedOptions );

    // Set a default corner radius
    if ( options.cornerRadius === undefined ) {
      options.cornerRadius = 0.25 * options.size.width;
    }

    options.cachedPaints = [ options.fill, options.fillHighlighted ];

    super( 0, 0, options.size.width, options.size.height, options );

    // Paint area that is slightly larger than the slider thumb so SVG updates a large enough paintable region.
    // Related to https://github.com/phetsims/masses-and-springs/issues/334
    const paintLayer = Rectangle.bounds( this.bounds.dilated( 5 ), {
      fill: 'transparent',
      localBounds: this.bounds,
      pickable: false
    } );
    this.addChild( paintLayer );

    // vertical line down the center
    const centerLineYMargin = 3;
    this.addChild( new Path( Shape.lineSegment(
      options.size.width / 2, centerLineYMargin,
      options.size.width / 2, options.size.height - centerLineYMargin ), {
      stroke: options.centerLineStroke
    } ) );

    // highlight thumb on pointer over
    const pressListener = new PressListener( {
      attach: false,
      tandem: Tandem.OPT_OUT // Highlighting doesn't need instrumentation
    } );
    pressListener.isHighlightedProperty.link( isHighlighted => {
      this.fill = isHighlighted ? options.fillHighlighted : options.fill;
    } );
    this.addInputListener( pressListener );
  }
}

sun.register( 'SliderThumb', SliderThumb );