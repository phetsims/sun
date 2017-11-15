// Copyright 2017, University of Colorado Boulder

/**
 * Wraps PushButtonModel instances and sends PhET-iO events as if they were from the parent button.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );

  /**
   * Wrapper type for phet/sun's PushButton class.
   * @param button
   * @param phetioID
   * @constructor
   */
  function PushButtonModelIO( button, phetioID ) {
    ObjectIO.call( this, button, phetioID );
    assert && assertInstanceOf( button, phet.sun.PushButtonModel );
  }

  phetioInherit( NodeIO, 'PushButtonModelIO', PushButtonModelIO, {}, {
    documentation: 'Sends events for buttons',
    events: [ 'fired' ]
  } );

  sun.register( 'PushButtonModelIO', PushButtonModelIO );

  return PushButtonModelIO;
} );