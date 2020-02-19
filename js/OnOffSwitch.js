// Copyright 2014-2020, University of Colorado Boulder

/**
 * OnOffSwitch is a switch for toggling between true (on) and false (off).
 * The off position is on the left, the on position is on the right.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const merge = require( 'PHET_CORE/merge' );
  const sun = require( 'SUN/sun' );
  const ToggleSwitch = require( 'SUN/ToggleSwitch' );

  class OnOffSwitch extends ToggleSwitch {

    /**
     * @param {Property.<boolean>} property
     * @param {Object} [options]
     */
    constructor( property, options ) {

      options = merge( {
        trackFillLeft: 'white', // track fill when property.value === false
        trackFillRight: 'rgb( 0, 200, 0 )' // track fill when property.value === true
      }, options );

      super( property, false, true, options );
    }
  }

  return sun.register( 'OnOffSwitch', OnOffSwitch );
} );