// Copyright 2022, University of Colorado Boulder

/**
 * HSeparatorDeprecated is a horizontal separator, typically used to separate a panel into logical sections.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import { Line, LineOptions } from '../../scenery/js/imports.js';
import sun from './sun.js';

type SelfOptions = EmptySelfOptions;

type HSeparatorDeprecatedOptions = SelfOptions & LineOptions;

/**
 * @deprecated please use HSeparator
 */
export default class HSeparatorDeprecated extends Line {

  public constructor( width: number, providedOptions?: HSeparatorDeprecatedOptions ) {
    assert && assert( isFinite( width ) && width >= 0, `invalid width=${width}` );

    const options = optionize<HSeparatorDeprecatedOptions, SelfOptions, LineOptions>()( {
      stroke: 'rgb( 100, 100, 100 )'
    }, providedOptions );

    super( 0, 0, width, 0, options );
  }
}

sun.register( 'HSeparatorDeprecated', HSeparatorDeprecated );