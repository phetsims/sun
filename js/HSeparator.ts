// Copyright 2022, University of Colorado Boulder

/**
 * HSeparator is a horizontal separator, typically used to separate a panel into logical sections.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../phet-core/js/optionize.js';
import { Line, LineOptions } from '../../scenery/js/imports.js';
import sun from './sun.js';

type SelfOptions = {};
type HSeparatorOptions = SelfOptions & LineOptions;

export default class HSeparator extends Line {
  constructor( width: number, providedOptions?: HSeparatorOptions ) {
    assert && assert( isFinite( width ) && width >= 0, `invalid width=${width}` );

    const options = optionize<HSeparatorOptions, SelfOptions, LineOptions>()( {
      stroke: 'rgb( 100, 100, 100 )'
    }, providedOptions );

    super( 0, 0, width, 0, options );
  }
}

sun.register( 'HSeparator', HSeparator );