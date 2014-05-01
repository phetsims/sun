// Copyright 2002-2014, University of Colorado Boulder

/**
 * Toggle button that switches the value of a boolean property when pressed
 * and also switches the displayed icon.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularToggleButton = require( 'SUN/experimental/buttons/RectangularToggleButton' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  /**
   * @param trueNode
   * @param falseNode
   * @param booleanProperty
   * @param options - See Rectangular push button for a description of the available options
   * @constructor
   */
  function ToggleButton2( trueNode, falseNode, booleanProperty, options ) {
    RectangularToggleButton.call( this, false, true, booleanProperty, _.extend( { content: new ToggleNode( trueNode, falseNode, booleanProperty ) }, options ) );
  }

  return inherit( RectangularToggleButton, ToggleButton2 );
} );
