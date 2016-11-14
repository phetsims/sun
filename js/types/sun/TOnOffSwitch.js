// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );

  /**
   * Wrapper type for phet/sun's OnOffSwitch class.
   * @param onOffSwitch
   * @param phetioID
   * @constructor
   */
  function TOnOffSwitch( onOffSwitch, phetioID ) {
    TNode.call( this, onOffSwitch, phetioID );
    assertInstanceOf( onOffSwitch, phet.sun.OnOffSwitch );

    toEventOnStatic( onOffSwitch, 'CallbacksForToggled', 'user', phetioID, TOnOffSwitch, 'toggled', function( oldValue, newValue ) {
      return {
        oldValue: oldValue,
        newValue: newValue
      };
    } );
  }

  phetioInherit( TNode, 'TOnOffSwitch', TOnOffSwitch, {}, {
    documentation: 'A traditional switch component',
    events: [ 'toggled' ]
  } );

  phetioNamespace.register( 'TOnOffSwitch', TOnOffSwitch );

  return TOnOffSwitch;
} );

