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

  /**
   * Wrapper type for phet/sun's AquaRadioButton class.

   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc. If loaded by phet (not phet-io)
   *                                    it will be the function returned by the 'ifphetio!' plugin.
   * @returns {*}
   * @constructor
   */
  function TAquaRadioButton( phetioValueType ) {

    var TAquaRadioButtonImpl = function TAquaRadioButtonImpl( radioButton, phetioID ) {
      assert && assert( !!phetioValueType, 'phetioValueType must be defined' );
      assertInstanceOf( radioButton, phet.sun.AquaRadioButton );
      TRadioButton( phetioValueType ).call( this, radioButton, phetioID );
    };
    return phetioInherit( TRadioButton( phetioValueType ), 'TAquaRadioButton', TAquaRadioButtonImpl, {
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
      events: TRadioButton( phetioValueType ).events
    } );
  }

  sun.register( 'TAquaRadioButton', TAquaRadioButton );

  return TAquaRadioButton;
} );