// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOfTypes = require( 'PHET_IO/assertions/assertInstanceOfTypes' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnEmit = require( 'PHET_IO/events/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's MomentaryButton class.
   * @param momentaryButton
   * @param phetioID
   * @constructor
   */
  function TMomentaryButton( momentaryButton, phetioID ) {

    // TODO: separate wrappers
    assertInstanceOfTypes( momentaryButton, [
      phet.sun.RectangularMomentaryButton,
      phet.sun.RoundMomentaryButton
    ] );
    TNode.call( this, momentaryButton, phetioID );
    var model = momentaryButton.buttonModel;
    toEventOnEmit( model.startedCallbacksForPressedEmitter, model.endedCallbacksForPressedEmitter, 'user', phetioID, TMomentaryButton, 'pressed' );
    toEventOnEmit( model.startedCallbacksForReleasedEmitter, model.endedCallbacksForReleasedEmitter, 'user', phetioID, TMomentaryButton, 'released' );
    toEventOnEmit( model.startedCallbacksForReleasedByDisableEmitter, model.endedCallbacksForReleasedByDisableEmitter, 'user', phetioID, TMomentaryButton, 'releasedDisabled' );
  }

  phetioInherit( TNode, 'TMomentaryButton', TMomentaryButton, {}, {
    documentation: 'Button that performs an action while it is being pressed, and stops the action when released',
    events: [ 'pressed', 'released', 'releasedDisabled' ]
  } );


  phetioNamespace.register( 'TMomentaryButton', TMomentaryButton );

  return TMomentaryButton;
} );

