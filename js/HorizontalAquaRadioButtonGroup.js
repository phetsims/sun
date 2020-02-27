// Copyright 2020, University of Colorado Boulder

/**
 * HorizontalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import AquaRadioButtonGroup from './AquaRadioButtonGroup.js';
import sun from './sun.js';

class HorizontalAquaRadioButtonGroup extends AquaRadioButtonGroup {

  /**
   * @param {Property} property
   * @param {Object[]} items - see AquaRadioButtonGroup
   * @param {Object} [options]
   */
  constructor( property, items, options ) {

    assert && assert( !options || options.orientation === undefined, 'HorizontalAquaRadioButtonGroup sets orientation' );

    super( property, items, merge( {
      orientation: 'horizontal'
    }, options ) );
  }
}

sun.register( 'HorizontalAquaRadioButtonGroup', HorizontalAquaRadioButtonGroup );
export default HorizontalAquaRadioButtonGroup;