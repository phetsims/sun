// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for RoundPushButton|RectangularPushButton
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
  var FunctionIO = require( 'ifphetio!PHET_IO/types/FunctionIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   * @param {RoundPushButton|RectangularPushButton} button
   * @param {string} phetioID
   * @constructor
   */
  function PushButtonIO( button, phetioID ) {
    NodeIO.call( this, button, phetioID );

    assert && assertInstanceOf( button, phet.sun.RoundPushButton, phet.sun.RectangularPushButton );
  }

  phetioInherit( NodeIO, 'PushButtonIO', PushButtonIO, {
    addListener: {
      returnType: VoidIO,
      parameterTypes: [ FunctionIO( VoidIO, [] ) ],
      implementation: function( listener ) {
        this.instance.addListener( listener );
      },
      documentation: 'Adds a listener that is called back when the button is pressed.'
    },
    fire: {
      returnType: VoidIO,
      parameterTypes: [],
      implementation: function() {
        this.instance.buttonModel.fire();
      },
      documentation: 'Performs the action associated with the button'
    }
  }, {
    documentation: 'A pressable button in the simulation',
    events: [ 'fired' ]
  } );

  sun.register( 'PushButtonIO', PushButtonIO );

  return PushButtonIO;
} );