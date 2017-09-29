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
  var assertInstanceOfTypes = require( 'ifphetio!PHET_IO/assertions/assertInstanceOfTypes' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var TNode = require( 'SCENERY/nodes/TNode' );
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );

  /**
   * Wrapper type for phet/sun's PushButton class.
   * @param button
   * @param phetioID
   * @constructor
   */
  function TPushButtonModel( button, phetioID ) {
    TObject.call( this, button, phetioID );

    assertInstanceOfTypes( button, [
      phet.sun.PushButtonModel
    ] );
  }

  phetioInherit( TNode, 'TPushButtonModel', TPushButtonModel, {}, {
    documentation: 'Sends events for buttons',
    events: [ 'fired' ]
  } );

  sun.register( 'TPushButtonModel', TPushButtonModel );

  return TPushButtonModel;
} );