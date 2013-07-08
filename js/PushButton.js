// Copyright 2002-2013, University of Colorado Boulder

//Render a simple button
//TODO: PushButton.js is not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ButtonModel = require( 'SUN/ButtonModel' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Panel = require( 'SUN/Panel' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  /**
   * @param {Node} content
   * @param {function} callback
   * @param {object} options
   * @constructor
   */
  function PushButton( content, booleanProperty, options ) {

    options = _.extend( {}, options ); //TODO add default options

    var pressed = new Panel( content );
    var upButton = new Panel( content );
    upButton.x = -2;
    upButton.y = -2;
    var unpressed = new Node( {children: [new Rectangle( upButton.x + 4, upButton.y + 4, upButton.width, upButton.height, 10, 10, {fill: 'black'} ),
      upButton]} );

    ToggleNode.call( this, pressed, unpressed, booleanProperty );

    this.cursor = 'pointer';
    this.mutate( options );

    this.addInputListener( new ButtonListener( {
      fire: function() {
        booleanProperty.set( true );
      }
    } ) );
  }

  inherit( ToggleNode, PushButton );

  return PushButton;
} );