// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );

  function THSliderTrack( sliderTrack, phetioID ) {
    TNode.call( this, sliderTrack, phetioID );
    assertInstanceOf( sliderTrack, phet.sun.HSliderTrack );
  }

  phetioInherit( TNode, 'THSliderTrack', THSliderTrack, {}, {
    documentation: 'The track for a knob of a traditional slider'
  } );

  phetioNamespace.register( 'THSliderTrack', THSliderTrack );

  return THSliderTrack;
} );