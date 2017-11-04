// Copyright 2017, University of Colorado Boulder

/**
 * wrapper type for AccordionBox
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var TNode = require( 'SCENERY/nodes/TNode' );
  var sun = require( 'SUN/sun' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * Wrapper type for phet/sun's AccordionBox class.
   * @param accordionBox
   * @param phetioID
   * @constructor
   */
  function TAccordionBox( accordionBox, phetioID ) {
    assert && assertInstanceOf( accordionBox, phet.sun.AccordionBox );
    TNode.call( this, accordionBox, phetioID );
  }

  phetioInherit( TNode, 'TAccordionBox', TAccordionBox, {}, {
    documentation: 'A traditional accordionBox',
    events: [ 'expanded', 'collapsed' ]
  } );

  sun.register( 'TAccordionBox', TAccordionBox );

  return TAccordionBox;
} );

