// Copyright 2002-2013, University of Colorado Boulder

/**
 * Base class for radio buttons.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {

  // imports
  var ButtonListener = require( "SCENERY/input/ButtonListener" );
  var inherit = require( "PHET_CORE/inherit" );
  var Node = require( "SCENERY/nodes/Node" );
  var Path = require( "SCENERY/nodes/Path" );
  var Shape = require( "KITE/Shape" );

  function RadioButton( property, value, selectedNode, deselectedNode, options ) {

    options = _.extend( {
      cursor: 'pointer'
    }, options );

    var thisNode = this;
    Node.call( thisNode, options );

    var background = new Path( { shape: Shape.bounds( selectedNode.bounds.union( deselectedNode.bounds ) ) } );

    thisNode.addChild( background );
    thisNode.addChild( selectedNode );
    thisNode.addChild( deselectedNode );

    // sync control with model
    property.link( function( newValue ) {
      selectedNode.visible = ( newValue === value );
      deselectedNode.visible = !selectedNode.visible;
    } );

    // set property value on fire
    thisNode.addInputListener( new ButtonListener( {
      fire: function() {
        property.set( value );
      }
    } ) );
  }

  inherit( Node, RadioButton );

  return RadioButton;
} );
