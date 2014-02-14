// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base type for buttons that provides a set of properties that clients can
 * use to changes the appearance of the buttons.
 */
define( function( require ) {
  'use strict';

  // Imports
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );

  /**
   * @param node
   * @param callback
   * @param options
   * @constructor
   */
  function AbstractButton( node, callback, options ) {

    var thisButton = this;
    Node.call( this );
    thisButton.addChild( node );

    // Properties that can be monitored by clients to trigger changes in the
    // button's appearance.
    thisButton.over = new Property( false );
    thisButton.down = new Property( false );
    thisButton.enabled = new Property( true );

    // Hook up the listener that will set the property states.
    node.addInputListener( new ButtonListener(
      {
        up: function( event, oldState ) {
          thisButton.down.value = false;
          console.log( 'up' );
        },

        over: function( event, oldState ) {
          thisButton.over.value = true;
          console.log( 'over' );
        },

        down: function( event, oldState ) {
          thisButton.down.value = true;
          console.log( 'down' );
        },

        out: function( event, oldState ) {
          thisButton.over.value = false;
          console.log( 'out' );
        },

        fire: function( event ) {
          callback();
        }
      }
    ) );

    this.mutate( options );
  }

  return inherit( Node, AbstractButton,
    {
      setEnabled: function( enabled ) {
        this.enabled.value = enabled;
      }
    } );
} );