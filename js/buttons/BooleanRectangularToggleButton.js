// Copyright 2013-2018, University of Colorado Boulder

/**
 * This toggle button uses a boolean property and a trueNode and falseNode to display its content.
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanToggleNode = require( 'SUN/BooleanToggleNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularToggleButton = require( 'SUN/buttons/RectangularToggleButton' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Node} trueNode
   * @param {Node} falseNode
   * @param booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function BooleanRectangularToggleButton( trueNode, falseNode, booleanProperty, options ) {

    options = _.extend( { tandem: Tandem.required }, options );

    assert && assert( !options.content, 'options.content cannot be set' );
    options.content = new BooleanToggleNode( trueNode, falseNode, booleanProperty );

    RectangularToggleButton.call( this, false, true, booleanProperty, options );

    // @private {function} - internally used disposal function
    this.disposeBooleanRectangularToggleButton = function() {
      options.content.dispose();
    };
  }

  sun.register( 'BooleanRectangularToggleButton', BooleanRectangularToggleButton );

  return inherit( RectangularToggleButton, BooleanRectangularToggleButton, {
    /**
     * @public
     */
    dispose: function() {
      this.disposeBooleanRectangularToggleButton();
      RectangularToggleButton.prototype.dispose.call( this );
    }
  } );
} );
