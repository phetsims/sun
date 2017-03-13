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
  var sun = require( 'SUN/sun' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TPushButton = require( 'SUN/buttons/TPushButton' );

  /**
   * Wrapper type for phet/sun's ResetAllButton class.
   * @param instance
   * @param phetioID
   * @constructor
   */
  function TResetAllButton( instance, phetioID ) {
    assertInstanceOf( instance, phet.sceneryPhet.ResetAllButton );
    TPushButton.call( this, instance, phetioID );
  }

  phetioInherit( TPushButton, 'TResetAllButton', TResetAllButton, {}, {
    documentation: 'The round (typically orange) button that restores the simulation screen to its initial state',
    events: TPushButton.events
  } );

  sun.register( 'TResetAllButton', TResetAllButton );

  return TResetAllButton;
} );

