// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for AccordionBox
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var sun = require( 'SUN/sun' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * IO type for phet/sun's AccordionBox class.
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

