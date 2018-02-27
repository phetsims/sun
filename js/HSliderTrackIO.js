// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for HSliderTrack
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var sun = require( 'SUN/sun' );
  
  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  
  /**
   * IO type for phet/sun's HSliderTrack class.
   * @param {HSliderTrack} hSliderTrack
   * @param {string} phetioID
   * @constructor
   */
  function HSliderTrackIO( hSliderTrack, phetioID ) {
    assert && assertInstanceOf( hSliderTrack, phet.sun.HSliderTrack );
    NodeIO.call( this, hSliderTrack, phetioID );
  }

  phetioInherit( NodeIO, 'HSliderTrackIO', HSliderTrackIO, {}, {
    documentation: 'The track for a knob of a traditional slider'
  } );

  sun.register( 'HSliderTrackIO', HSliderTrackIO );

  return HSliderTrackIO;
} );