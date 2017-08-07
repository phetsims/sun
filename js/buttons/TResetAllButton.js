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
   * @param resetAllButton
   * @param phetioID
   * @constructor
   */
  function TResetAllButton( resetAllButton, phetioID ) {
    assertInstanceOf( resetAllButton, phet.sceneryPhet.ResetAllButton );
    TPushButton.call( this, resetAllButton, phetioID );
  }

  phetioInherit( TPushButton, 'TResetAllButton', TResetAllButton, {}, {
    documentation: 'The round (typically orange) button that restores the simulation screen to its initial state',
    events: [ 'reset' ] // This is a manual override of TPushButton's 'fired' event. See https://github.com/phetsims/phet-io/issues/1069
  } );

  sun.register( 'TResetAllButton', TResetAllButton );

  return TResetAllButton;
} );

