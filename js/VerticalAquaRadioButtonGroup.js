// Copyright 2013-2020, University of Colorado Boulder

/**
 * VerticalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import AquaRadioButtonGroup from './AquaRadioButtonGroup.js';
import sun from './sun.js';

class VerticalAquaRadioButtonGroup extends AquaRadioButtonGroup {

  /**
   * @param {Property} property
   * @param {Object[]} items - see AquaRadioButtonGroup
   * @param {Object} [options]
   */
  constructor( property, items, options ) {

    assert && assert( !options || options.orientation === undefined, 'VerticalAquaRadioButtonGroup sets orientation' );

    super( property, items, merge( {
      orientation: 'vertical'
    }, options ) );
  }
}

sun.register( 'VerticalAquaRadioButtonGroup', VerticalAquaRadioButtonGroup );
export default VerticalAquaRadioButtonGroup;