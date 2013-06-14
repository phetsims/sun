//Render a simple button
//TODO: PushButton.js is not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ButtonModel = require( 'SUN/ButtonModel' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var PanelNode = require( 'SUN/PanelNode' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  /**
   * @param {Node} content
   * @param {function} callback
   * @param {object} options
   * @constructor
   */
  function PushButton( content, booleanProperty, options ) {

    var pressed = new PanelNode( content, {fill: 'yellow'} );
    var unpressed = new PanelNode( content );

    ToggleNode.call( this, unpressed, pressed, booleanProperty );

    this.cursor = 'pointer';
    if ( options ) {
      this.mutate( options );
    }

    this.addInputListener( new ButtonListener( {
      fire: function() {
        booleanProperty.set( true );
      }
    } ) )
  }

  inherit( ToggleNode, PushButton );

  return PushButton;
} );