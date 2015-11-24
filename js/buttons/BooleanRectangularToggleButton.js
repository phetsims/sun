// Copyright 2013-2015, University of Colorado Boulder

/**
 * This toggle button uses a boolean property and a trueNode and falseNode to display its content.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularToggleButton = require( 'SUN/buttons/RectangularToggleButton' );
  var sun = require( 'SUN/sun' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  /**
   * @param {Node} trueNode
   * @param {Node} falseNode
   * @param booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function BooleanRectangularToggleButton( trueNode, falseNode, booleanProperty, options ) {
    RectangularToggleButton.call( this, false, true, booleanProperty, _.extend( { content: new ToggleNode( trueNode, falseNode, booleanProperty ) }, options ) );
  }

  sun.register( 'BooleanRectangularToggleButton', BooleanRectangularToggleButton );

  return inherit( RectangularToggleButton, BooleanRectangularToggleButton );
} );
