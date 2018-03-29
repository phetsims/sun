// Copyright 2017, University of Colorado Boulder

/**
 * A simple node that could be something like a Dialog for testing the new Dialog system.
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var DragListener = require( 'SCENERY/listeners/DragListener' );
  var Property = require( 'AXON/Property' );
  var Vector2 =  require( 'DOT/Vector2' );

  // constants
  function SunDialog( options ) {

    options = _.extend( {
      content: null // content for the dialog
    }, options );

    Node.call( this, options );

    // placeholder for the dialog rectangle
    var dialogRectangle = new Rectangle( 0, 0, 200, 50, 5, 5, { fill: getRandomColor() } );
    this.addChild( dialogRectangle );

    // add the custom content
    if ( options.content ) {
      dialogRectangle.addChild( options.content );
      options.content.center = dialogRectangle.center;
    }

    var locationProperty = new Property( new Vector2( 0, 0 ) );
    this.addInputListener( new DragListener( {
      locationProperty: locationProperty
    } ) );

    var self = this;
    locationProperty.link( function( location ) {
      self.translation = location;
    } );
  }

  // get a random color to fill the dialog
  function getRandomColor() {
    var rR = Math.floor( Math.random() * 255 );
    var rG = Math.floor( Math.random() * 255 );
    var rB = Math.floor( Math.random() * 255 );
    var a = 0.75;

    return 'rgba(' + rR + ',' + rG + ',' + rB +',' + a + ')';
  }

  sun.register( 'SunDialog', SunDialog );

  return inherit( Node, SunDialog, {} );
} );
