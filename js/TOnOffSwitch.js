// Copyright 2017, University of Colorado Boulder

/**
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
  var TNode = require( 'SCENERY/nodes/TNode' );

  /**
   * Wrapper type for phet/sun's OnOffSwitch class.
   * @param onOffSwitch
   * @param phetioID
   * @constructor
   */
  function TOnOffSwitch( onOffSwitch, phetioID ) {
    assert && assertInstanceOf( onOffSwitch, phet.sun.OnOffSwitch );
    TNode.call( this, onOffSwitch, phetioID );
  }

  phetioInherit( TNode, 'TOnOffSwitch', TOnOffSwitch, {}, {
    documentation: 'A traditional switch component',
    events: [ 'toggled' ]
  } );

  sun.register( 'TOnOffSwitch', TOnOffSwitch );

  return TOnOffSwitch;
} );

