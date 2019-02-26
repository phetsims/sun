// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for SliderTrack
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var sun = require( 'SUN/sun' );

  /**
   * IO type for phet/sun's SliderTrack class.
   * @param {SliderTrack} sliderTrack
   * @param {string} phetioID
   * @constructor
   */
  function SliderTrackIO( sliderTrack, phetioID ) {
    NodeIO.call( this, sliderTrack, phetioID );
  }

  phetioInherit( NodeIO, 'SliderTrackIO', SliderTrackIO, {}, {
    documentation: 'The track for a knob of a traditional slider',
    validator: { isValidValue: v => v instanceof phet.sun.SliderTrack }
  } );

  sun.register( 'SliderTrackIO', SliderTrackIO );

  return SliderTrackIO;
} );