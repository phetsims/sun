// Copyright 2016-2020, University of Colorado Boulder

/**
 * A default slider thumb, currently intended for use only in HSlider. It's a rectangle with a vertical white line down
 * the center.  The origin is at the top left (HSlider uses the thumb center for positioning).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../dot/js/Dimension2.js';
import Shape from '../../kite/js/Shape.js';
import merge from '../../phet-core/js/merge.js';
import PressListener from '../../scenery/js/listeners/PressListener.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

class SliderThumb extends Rectangle {
  /**
   * @param {Object} [options] see HSlider constructor
   */
  constructor( options ) {

    options = merge( {
      size: new Dimension2( 22, 45 ),
      fill: 'rgb(50,145,184)',
      fillHighlighted: 'rgb(71,207,255)',
      stroke: 'black',
      lineWidth: 1,
      centerLineStroke: 'white',
      tandem: Tandem.REQUIRED // Slider.js adds to this tandem to nest its dragListener under the thumb.
    }, options );

    // Set a default corner radius
    if ( options.cornerRadius === undefined ) {
      options.cornerRadius = 0.25 * options.size.width;
    }

    assert && assert( options.cachedPaints === undefined, 'SliderThumb sets cachedPaints' );
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
      tandem: Tandem.OPT_OUT
    } );
    pressListener.isHighlightedProperty.link( isHighlighted => {
      this.fill = isHighlighted ? options.fillHighlighted : options.fill;
    } );
    this.addInputListener( pressListener );
  }
}

sun.register( 'SliderThumb', SliderThumb );
export default SliderThumb;