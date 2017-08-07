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
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var TNode = require( 'SCENERY/nodes/TNode' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's RoundMomentaryButton class.
   * @param momentaryButton
   * @param phetioID
   * @constructor
   */
  function TRoundMomentaryButton( momentaryButton, phetioID ) {
    assertInstanceOf( momentaryButton, phet.sun.RoundMomentaryButton );
    TNode.call( this, momentaryButton, phetioID );
    var model = momentaryButton.buttonModel;
    toEventOnEmit( model.startedCallbacksForPressedEmitter, model.endedCallbacksForPressedEmitter, 'user', phetioID, this.constructor, 'pressed' );
    toEventOnEmit( model.startedCallbacksForReleasedEmitter, model.endedCallbacksForReleasedEmitter, 'user', phetioID, this.constructor, 'released' );
    toEventOnEmit( model.startedCallbacksForReleasedByDisableEmitter, model.endedCallbacksForReleasedByDisableEmitter, 'user', phetioID, this.constructor, 'releasedDisabled' );
  }

  phetioInherit( TNode, 'TRoundMomentaryButton', TRoundMomentaryButton, {}, {
    documentation: 'Button that performs an action while it is being pressed, and stops the action when released',
    events: [ 'pressed', 'released', 'releasedDisabled' ]
  } );


  sun.register( 'TRoundMomentaryButton', TRoundMomentaryButton );

  return TRoundMomentaryButton;
} );