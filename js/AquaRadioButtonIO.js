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
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var RadioButtonIO = require( 'SUN/RadioButtonIO' );
  var sun = require( 'SUN/sun' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   * Wrapper type for phet/sun's AquaRadioButton class.
   * @param {AquaRadioButton} radioButton
   * @param {string} phetioID
   * @constructor
   */
  function AquaRadioButtonIO( radioButton, phetioID ) {
    assert && assertInstanceOf( radioButton, phet.sun.AquaRadioButton );
    RadioButtonIO.call( this, radioButton, phetioID );
  }

  phetioInherit( RadioButtonIO, 'AquaRadioButtonIO', AquaRadioButtonIO, {
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

  sun.register( 'AquaRadioButtonIO', AquaRadioButtonIO );

  return AquaRadioButtonIO;
} )
;