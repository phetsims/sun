// Copyright 2002-2014, University of Colorado Boulder

/**
 * This toggle button uses a boolean property and a trueNode and falseNode to display its content.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularToggleButton = require( 'SUN/buttons/RectangularToggleButton' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  /**
   * @param trueNode
   * @param falseNode
   * @param booleanProperty
   * @param options
   * @constructor
   */
  function BooleanRectangularToggleButton( trueNode, falseNode, booleanProperty, options ) {
    RectangularToggleButton.call( this, false, true, booleanProperty, _.extend( { content: new ToggleNode( trueNode, falseNode, booleanProperty ) }, options ) );
  }

  return inherit( RectangularToggleButton, BooleanRectangularToggleButton );
} );
