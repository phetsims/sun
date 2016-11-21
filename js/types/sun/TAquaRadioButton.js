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
  var assertInstanceOfTypes = require( 'PHET_IO/assertions/assertInstanceOfTypes' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TVoid = require( 'PHET_IO/types/TVoid' );
  var TBoolean = require( 'PHET_IO/types/TBoolean' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TRadioButton = require( 'PHET_IO/types/sun/TRadioButton' );

  /**
   * Wrapper type for phet/sun's AquaRadioButton class.

   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc.
   * @returns {*}
   * @constructor
   */
  function TAquaRadioButton( phetioValueType ) {
    assert && assert( !!phetioValueType, 'phetioValueType must be defined' );
    var TAquaRadioButton = function TAquaRadioButtonImpl( radioButton, phetioID ) {
      assertInstanceOfTypes( radioButton, [ phet.sun.AquaRadioButton ] );
      TRadioButton( phetioValueType ).call( this, radioButton, phetioID );
    };
    return phetioInherit( TRadioButton( phetioValueType ), 'TAquaRadioButton', TAquaRadioButton, {
      setCircleButtonVisible: {
        returnType: TVoid,
        parameterTypes: [ TBoolean ],
        implementation: function( visible ) {
          this.instance.setCircleButtonVisible( visible );
        },
        documentation: 'Sets whether the circular part of the radio button will be displayed.'
      }
    }, {
      documentation: 'A radio button which looks like the Mac "Aqua" radio buttons',
      events: TRadioButton( phetioValueType ).events // TODO: Is this automatically inherited from the parent?
    } );
  }

  phetioNamespace.register( 'TAquaRadioButton', TAquaRadioButton );

  return TAquaRadioButton;
} );