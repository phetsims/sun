// Copyright 2022, University of Colorado Boulder

/**
 * VSeparator is a vertical separator, typically used to separate a panel into logical sections.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../phet-core/js/optionize.js';
import { Line, LineOptions } from '../../scenery/js/imports.js';
import sun from './sun.js';

export type VSeparatorOptions = LineOptions;

class VSeparator extends Line {

  /**
   * @param {number} height
   * @param providedOptions
   */
  constructor( height: number, providedOptions?: VSeparatorOptions ) {
    assert && assert( isFinite( height ) && height >= 0, `invalid height=${height}` );

    const options = optionize<VSeparatorOptions, {}, LineOptions>( {
      stroke: 'rgb( 100, 100, 100 )'
    }, providedOptions );

    super( 0, 0, 0, height, options );
  }
}

sun.register( 'VSeparator', VSeparator );
export default VSeparator;