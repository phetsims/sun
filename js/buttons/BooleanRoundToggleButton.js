// Copyright 2013-2018, University of Colorado Boulder

/**
 * This toggle button uses a boolean property and a trueNode and falseNode to display its content.
 */
define( require => {
  'use strict';

  // modules
  const BooleanToggleNode = require( 'SUN/BooleanToggleNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const RoundToggleButton = require( 'SUN/buttons/RoundToggleButton' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Node} trueNode
   * @param {Node} falseNode
   * @param {Property.<boolean>} booleanProperty
   * @param {Object} [options]
   * @constructor
   */
  function BooleanRoundToggleButton( trueNode, falseNode, booleanProperty, options ) {

    options = _.extend( {
      tandem: Tandem.required
    }, options );

    assert && assert( !options.content, 'BooleanRoundToggleButton sets content' );
    options.content = new BooleanToggleNode( trueNode, falseNode, booleanProperty, {
      tandem: options.tandem.createTandem( 'toggleNode' )
    } );

    RoundToggleButton.call( this, false, true, booleanProperty, options );

    // @private
    this.disposeBooleanRoundToggleButton = function() {
      options.content.dispose();
    };
  }

  sun.register( 'BooleanRoundToggleButton', BooleanRoundToggleButton );

  return inherit( RoundToggleButton, BooleanRoundToggleButton, {

    /**
     * @public
     * @override
     */
    dispose: function() {
      this.disposeBooleanRoundToggleButton();
      RoundToggleButton.prototype.dispose.call( this );
    }
  } );
} );
