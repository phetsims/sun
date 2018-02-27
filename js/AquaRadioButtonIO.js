// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type AquaRadioButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var RadioButtonIO = require( 'SUN/RadioButtonIO' );
  var sun = require( 'SUN/sun' );
  
  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );
  
  /**
   * IO type for phet/sun's AquaRadioButton class.
   * @param {AquaRadioButton} aquaRadioButton
   * @param {string} phetioID
   * @constructor
   */
  function AquaRadioButtonIO( aquaRadioButton, phetioID ) {
    assert && assertInstanceOf( aquaRadioButton, phet.sun.AquaRadioButton );
    RadioButtonIO.call( this, aquaRadioButton, phetioID );
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