// Copyright 2013-2015, University of Colorado Boulder

/**
 * This toggle button uses a boolean property and a trueNode and falseNode to display its content.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundToggleButton = require( 'SUN/buttons/RoundToggleButton' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  /**
   * @param trueNode
   * @param falseNode
   * @param booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function BooleanRoundToggleButton( trueNode, falseNode, booleanProperty, options ) {
    RoundToggleButton.call( this, false, true, booleanProperty, _.extend( { content: new ToggleNode( trueNode, falseNode, booleanProperty ) }, options ) );
  }

  return inherit( RoundToggleButton, BooleanRoundToggleButton );
} );
