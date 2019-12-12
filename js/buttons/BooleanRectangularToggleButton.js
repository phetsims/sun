// Copyright 2013-2019, University of Colorado Boulder

/**
 * This toggle button uses a boolean property and a trueNode and falseNode to display its content.
 */
define( require => {
  'use strict';

  // modules
  const BooleanToggleNode = require( 'SUN/BooleanToggleNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const RectangularToggleButton = require( 'SUN/buttons/RectangularToggleButton' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Node} trueNode
   * @param {Node} falseNode
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function BooleanRectangularToggleButton( trueNode, falseNode, booleanProperty, options ) {

    options = merge( { tandem: Tandem.REQUIRED }, options );

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
