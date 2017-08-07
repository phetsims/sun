// Copyright 2016, University of Colorado Boulder

/**
 * PhET-iO Adapter for sun's AquaRadioButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TVoid = require( 'ifphetio!PHET_IO/types/TVoid' );
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var sun = require( 'SUN/sun' );
  var TRadioButton = require( 'SUN/TRadioButton' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * Wrapper type for phet/sun's AquaRadioButton class.
   * @param {AquaRadioButton} radioButton
   * @param {string} phetioID
   * @constructor
   */
  function TAquaRadioButton( radioButton, phetioID ) {

    if ( Tandem.validationEnabled() ) {
      assert && assert( !!radioButton.phetioValueType, 'phetioValueType must be defined' );
    }

    assertInstanceOf( radioButton, phet.sun.AquaRadioButton );
    TRadioButton.call( this, radioButton, phetioID );
  }

  phetioInherit( TRadioButton, 'TAquaRadioButton', TAquaRadioButton, {
    setCircleButtonVisible: {
      returnType: TVoid,
      parameterTypes: [ TBoolean ],
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