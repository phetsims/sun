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
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var sun = require( 'SUN/sun' );

  /**
   * IO type for phet/sun's AccordionBox class.
   * @param {AccordionBox} accordionBox
   * @param {string} phetioID
   * @constructor
   */
  function AccordionBoxIO( accordionBox, phetioID ) {
    NodeIO.call( this, accordionBox, phetioID );
  }

  phetioInherit( NodeIO, 'AccordionBoxIO', AccordionBoxIO, {}, {
    documentation: 'A traditional accordionBox',
    events: [ 'expanded', 'collapsed' ],
    validator: { isValidValue: v => v instanceof phet.sun.AccordionBox }
  } );

  sun.register( 'AccordionBoxIO', AccordionBoxIO );

  return AccordionBoxIO;
} );

