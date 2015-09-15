// Copyright 2002-2015, University of Colorado Boulder

/**
 * Demonstration of misc sun UI components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid
 * @author Chris Malley
 */
define( function( require ) {
  'use strict';

  // modules
  var Carousel = require( 'SUN/Carousel' );
  var DemosView = require( 'SUN/demo/DemosView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // Creates a demo for Carousel
  var demoCarousel = function( layoutBounds ) {

    // create items
    var colors = [ 'red', 'blue', 'green', 'yellow', 'pink', 'white', 'orange', 'magenta', 'purple', 'pink' ];
    var vItems = [];
    var hItems = [];
    colors.forEach( function( color ) {
      vItems.push( new Rectangle( 0, 0, 60, 60, { fill: color, stroke: 'black' } ) );
      hItems.push( new Rectangle( 0, 0, 60, 60, { fill: color, stroke: 'black' } ) );
    } );

    var vCarousel = new Carousel( vItems, {
      orientation: 'vertical',
      separatorsVisible: true
    } );

    var hCarousel = new Carousel( hItems, {
      orientation: 'horizontal',
      pageControlVisible: true,
      centerX: vCarousel.centerX,
      top: vCarousel.bottom + 50
    } );

    return new Node( {
      children: [ vCarousel, hCarousel ],
      center: layoutBounds.center
    } );
  };

  function ComponentsView() {
    DemosView.call( this, 'component', [

      // To add a demo, create an entry here.
      // label is a {string} that will appear in the combo box.
      // getNode is a {function} that takes a {Bounds2} layoutBounds and returns a {Node}.
      { label: 'Carousel', getNode: demoCarousel }
    ] );
  }

  return inherit( DemosView, ComponentsView );
} );