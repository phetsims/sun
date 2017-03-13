// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  /**
   * Wrapper type for phet/sun's HSliderTrack class.
   * @param sliderTrack
   * @param phetioID
   * @constructor
   */
  function THSliderTrack( sliderTrack, phetioID ) {
    TNode.call( this, sliderTrack, phetioID );
    assertInstanceOf( sliderTrack, phet.sun.HSliderTrack );
  }

  phetioInherit( TNode, 'THSliderTrack', THSliderTrack, {}, {
    documentation: 'The track for a knob of a traditional slider'
  } );

  sun.register( 'THSliderTrack', THSliderTrack );

  return THSliderTrack;
} );