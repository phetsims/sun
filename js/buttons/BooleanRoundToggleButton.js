// Copyright 2013-2017, University of Colorado Boulder

/**
 * This toggle button uses a boolean property and a trueNode and falseNode to display its content.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundToggleButton = require( 'SUN/buttons/RoundToggleButton' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var ToggleNode = require( 'SUN/ToggleNode' );

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

    //TODO ToggleNode links to booleanProperty, must be cleaned up in dispose, https://github.com/phetsims/sun/issues/121
    assert && assert( !options.content, 'options.content cannot be set' );
    options.content = new ToggleNode( trueNode, falseNode, booleanProperty, {
      tandem: options.tandem.createTandem( 'toggleNode' )
    } );

    RoundToggleButton.call( this, false, true, booleanProperty, options );
  }

  sun.register( 'BooleanRoundToggleButton', BooleanRoundToggleButton );

  return inherit( RoundToggleButton, BooleanRoundToggleButton );
} );
