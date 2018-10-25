// Copyright 2018, University of Colorado Boulder

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
  var sun = require( 'SUN/sun' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );

  /**
   * IO type for phet/sun's SliderTrack class.
   * @param {SliderTrack} sliderTrack
   * @param {string} phetioID
   * @constructor
   */
  function SliderTrackIO( sliderTrack, phetioID ) {
    assert && assertInstanceOf( sliderTrack, phet.sun.SliderTrack );
    NodeIO.call( this, sliderTrack, phetioID );
  }

  phetioInherit( NodeIO, 'SliderTrackIO', SliderTrackIO, {}, {
    documentation: 'The track for a knob of a traditional slider'
  } );

  sun.register( 'SliderTrackIO', SliderTrackIO );

  return SliderTrackIO;
} );