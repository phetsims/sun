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
  var CheckBox = require( 'SUN/CheckBox' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var DemosView = require( 'SUN/demo/DemosView' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PageControl = require( 'SUN/PageControl' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // Creates a demo for Carousel
  var demoCarousel = function( layoutBounds ) {

    // create items
    var colors = [ 'red', 'blue', 'green', 'yellow', 'pink', 'white', 'orange', 'magenta', 'purple', 'pink' ];
    var vItems = [];
    var hItems = [];
    colors.forEach( function( color ) {
      vItems.push( new Rectangle( 0, 0, 60, 60, { fill: color, stroke: 'black' } ) );
      hItems.push( new Circle( 30, { fill: color, stroke: 'black' } ) );
    } );

    var vCarousel = new Carousel( vItems, {
      orientation: 'vertical',
      separatorsVisible: true
    } );

    var hCarousel = new Carousel( hItems, {
      orientation: 'horizontal',
      centerX: vCarousel.centerX,
      top: vCarousel.bottom + 50
    } );

    return new Node( {
      children: [ vCarousel, hCarousel ],
      center: layoutBounds.center
    } );
  };

  // Creates a demo for HSlider
  var demoHSlider = function( layoutBounds ) {

    var property = new Property( 0 );
    var range = new Range( 0, 100 );
    var tickLabelOptions = { font: new PhetFont( 16 ) };
    var slider = new HSlider( property, range, {
      trackSize: new Dimension2( 300, 5 ),
      center: layoutBounds.center
    } );

    // major ticks
    slider.addMajorTick( range.min, new Text( range.min, tickLabelOptions ) );
    slider.addMajorTick( range.getCenter(), new Text( range.getCenter(), tickLabelOptions ) );
    slider.addMajorTick( range.max, new Text( range.max, tickLabelOptions ) );

    // minor ticks
    slider.addMinorTick( range.min + 0.25 * range.getLength() );
    slider.addMinorTick( range.min + 0.75 * range.getLength() );

    // show/hide major ticks
    var majorTicksVisibleProperty = new Property( true );
    majorTicksVisibleProperty.link( function( visible ) {
      slider.majorTicksVisible = visible;
    } );
    var majorTicksCheckBox = CheckBox.createTextCheckBox( 'Major ticks visible', { font: new PhetFont( 20 ) }, majorTicksVisibleProperty, {
      left: slider.left,
      top: slider.bottom + 40
    } );

    // show/hide minor ticks
    var minorTicksVisibleProperty = new Property( true );
    minorTicksVisibleProperty.link( function( visible ) {
      slider.minorTicksVisible = visible;
    } );
    var minorTicksCheckBox = CheckBox.createTextCheckBox( 'Minor ticks visible', { font: new PhetFont( 20 ) }, minorTicksVisibleProperty, {
      left: slider.left,
      top: majorTicksCheckBox.bottom + 40
    } );

    return new Node( { children: [ slider, majorTicksCheckBox, minorTicksCheckBox ] } );
  };

  // Creates a demo for PageControl
  var demoPageControl = function( layoutBounds ) {

    // create items
    var colors = [ 'red', 'blue', 'green', 'yellow', 'pink', 'white', 'orange', 'magenta', 'purple', 'pink' ];
    var items = [];
    colors.forEach( function( color ) {
      items.push( new Rectangle( 0, 0, 100, 100, { fill: color, stroke: 'black' } ) );
    } );

    // carousel
    var carousel = new Carousel( items, {
      orientation: 'horizontal',
      itemsPerPage: 3
    } );

    // page control
    var pageControl = new PageControl( carousel.numberOfPages, carousel.pageNumberProperty, {
      orientation: 'horizontal',
      interactive: true,
      dotRadius: 10,
      dotSpacing: 18,
      currentPageFill: 'white',
      currentPageStroke: 'black',
      centerX: carousel.centerX,
      top: carousel.bottom + 10
    } );

    return new Node( {
      children: [ carousel, pageControl ],
      center: layoutBounds.center
    } );
  };

  function ComponentsView() {
    DemosView.call( this, 'component', [

      // To add a demo, create an entry here.
      // label is a {string} that will appear in the combo box.
      // getNode is a {function} that takes a {Bounds2} layoutBounds and returns a {Node}.
      { label: 'Carousel', getNode: demoCarousel },
      { label: 'HSlider', getNode: demoHSlider },
      { label: 'PageControl', getNode: demoPageControl }
    ] );
  }

  return inherit( DemosView, ComponentsView );
} );