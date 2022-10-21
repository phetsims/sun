// Copyright 2022, University of Colorado Boulder

/**
 * VSeparatorDeprecated is a vertical separator, typically used to separate a panel into logical sections.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import { Line, LineOptions } from '../../scenery/js/imports.js';
import sun from './sun.js';

type SelfOptions = EmptySelfOptions;

type VSeparatorDeprecatedOptions = SelfOptions & LineOptions;

/**
 * @deprecated please use VSeparator
 */
export default class VSeparatorDeprecated extends Line {

  public constructor( height: number, providedOptions?: VSeparatorDeprecatedOptions ) {
    assert && assert( isFinite( height ) && height >= 0, `invalid height=${height}` );

    const options = optionize<VSeparatorDeprecatedOptions, SelfOptions, LineOptions>()( {
      stroke: 'rgb( 100, 100, 100 )'
    }, providedOptions );

    super( 0, 0, 0, height, options );
  }
}

sun.register( 'VSeparatorDeprecated', VSeparatorDeprecated );