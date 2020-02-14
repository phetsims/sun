// Copyright 2013-2020, University of Colorado Boulder

/**
 * VerticalAquaRadioButtonGroup is a convenience class for creating a vertical AquaRadioButtonGroup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AquaRadioButtonGroup = require( 'SUN/AquaRadioButtonGroup' );
  const merge = require( 'PHET_CORE/merge' );
  const sun = require( 'SUN/sun' );

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

  return sun.register( 'VerticalAquaRadioButtonGroup', VerticalAquaRadioButtonGroup );
} );