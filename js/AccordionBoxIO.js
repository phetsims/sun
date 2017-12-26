// Copyright 2017, University of Colorado Boulder

/**
 * wrapper type for AccordionBox
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var sun = require( 'SUN/sun' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * Wrapper type for phet/sun's AccordionBox class.
   * @param {AccordionBox} accordionBox
   * @param {string} phetioID
   * @constructor
   */
  function AccordionBoxIO( accordionBox, phetioID ) {
    assert && assertInstanceOf( accordionBox, phet.sun.AccordionBox );
    NodeIO.call( this, accordionBox, phetioID );
  }

  phetioInherit( NodeIO, 'AccordionBoxIO', AccordionBoxIO, {}, {
    documentation: 'A traditional accordionBox',
    events: [ 'expanded', 'collapsed' ]
  } );

  sun.register( 'AccordionBoxIO', AccordionBoxIO );

  return AccordionBoxIO;
} );

