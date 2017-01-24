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
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Node} trueNode
   * @param {Node} falseNode
   * @param booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function BooleanRectangularToggleButton( trueNode, falseNode, booleanProperty, options ) {

    options = _.extend( { tandem: Tandem.tandemRequired() }, options );

    //TODO ToggleNode links to booleanProperty, must be cleaned up in dispose
    assert && assert( !options.content, 'options.content cannot be set' );
    options.content = new ToggleNode( trueNode, falseNode, booleanProperty, {
      tandem: options.tandem.createTandem( 'toggleNode' )
    } );

    RectangularToggleButton.call( this, false, true, booleanProperty, options );
  }

  sun.register( 'BooleanRectangularToggleButton', BooleanRectangularToggleButton );

  return inherit( RectangularToggleButton, BooleanRectangularToggleButton );
} );
