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
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );

  /**
   * Wrapper type for phet/sun's PushButton class.
   * @param pushButtonModel
   * @param phetioID
   * @constructor
   */
  function PushButtonModelIO( pushButtonModel, phetioID ) {
    ObjectIO.call( this, pushButtonModel, phetioID );
    assert && assertInstanceOf( pushButtonModel, phet.sun.PushButtonModel );
  }

  phetioInherit( NodeIO, 'PushButtonModelIO', PushButtonModelIO, {}, {
    documentation: 'Sends events for buttons',
    events: [ 'fired' ]
  } );

  sun.register( 'PushButtonModelIO', PushButtonModelIO );

  return PushButtonModelIO;
} );