// Copyright 2013-2021, University of Colorado Boulder

/**
 * VerticalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import AquaRadioButtonGroup from './AquaRadioButtonGroup.js';
import sun from './sun.js';

/** @template T */
class VerticalAquaRadioButtonGroup extends AquaRadioButtonGroup {

  /**
   * @param {Property<T>} property
   * @param { {node:Node,value:T,tandemName?:string,labelContent?:string}[]} items - see AquaRadioButtonGroup
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