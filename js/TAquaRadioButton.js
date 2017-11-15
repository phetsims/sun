// Copyright 2017, University of Colorado Boulder

/**
 * PhET-iO Adapter for sun's AquaRadioButton
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
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var TRadioButton = require( 'SUN/TRadioButton' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   * Wrapper type for phet/sun's AquaRadioButton class.
   * @param {AquaRadioButton} radioButton
   * @param {string} phetioID
   * @constructor
   */
  function TAquaRadioButton( radioButton, phetioID ) {
    assert && assertInstanceOf( radioButton, phet.sun.AquaRadioButton );
    TRadioButton.call( this, radioButton, phetioID );
  }

  phetioInherit( TRadioButton, 'TAquaRadioButton', TAquaRadioButton, {
    setCircleButtonVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.instance.setCircleButtonVisible( visible );
      },
      documentation: 'Sets whether the circular part of the radio button will be displayed.'
    }
  }, {
    documentation: 'A radio button which looks like the Mac "Aqua" radio buttons'
  } );

  sun.register( 'TAquaRadioButton', TAquaRadioButton );

  return TAquaRadioButton;
} )
;