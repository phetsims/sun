// Copyright 2017, University of Colorado Boulder

/**
 * wrapper type for AccordionBox
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var TNode = require( 'SCENERY/nodes/TNode' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'ifphetio!PHET_IO/phetioNamespace' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/events/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's AccordionBox class.
   * @param accordionBox
   * @param phetioID
   * @constructor
   */
  function TAccordionBox( accordionBox, phetioID ) {
    assertInstanceOf( accordionBox, phet.sun.AccordionBox );
    TNode.call( this, accordionBox, phetioID );

    toEventOnEmit(
      accordionBox.startedCallbacksForCollapsedTitleBarDownEmitter,
      accordionBox.endedCallbacksForCollapsedTitleBarDownEmitter,
      'user',
      phetioID,
      TAccordionBox,
      'collapsed'
    );

    toEventOnEmit(
      accordionBox.startedCallbacksForExpandedTitleBarDownEmitter,
      accordionBox.endedCallbacksForExpandedTitleBarDownEmitter,
      'user',
      phetioID,
      TAccordionBox,
      'expanded'
    );
  }

  phetioInherit( TNode, 'TAccordionBox', TAccordionBox, {}, {
    documentation: 'A traditional accordionBox',
    events: [ 'expanded', 'collapsed' ]
  } );

  phetioNamespace.register( 'TAccordionBox', TAccordionBox );

  return TAccordionBox;
} );

