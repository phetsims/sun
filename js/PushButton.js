// Copyright 2002-2013, University of Colorado Boulder

//Render a simple button
//TODO: PushButton.js is not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var RadioButton = require( 'SUN/RadioButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {Node} content
   * @param {function} callback
   * @param {object} options
   * @constructor
   */
  function PushButton( booleanProperty, value, content, options ) {

    options = _.extend( {}, options ); //TODO add default options

    var pressed = new Panel( content );
    var upButton = new Panel( content );
    upButton.x = -2;
    upButton.y = -2;
    var unpressed = new Node( {children: [new Rectangle( upButton.x + 4, upButton.y + 4, upButton.width, upButton.height, 10, 10, {fill: 'black'} ),
      upButton]} );

    RadioButton.call( this, booleanProperty, value, pressed, unpressed );
  }

  inherit( RadioButton, PushButton );

  return PushButton;
} );