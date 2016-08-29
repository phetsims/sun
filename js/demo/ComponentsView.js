// Copyright 2015, University of Colorado Boulder

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
  var NumberSpinner = require( 'SUN/NumberSpinner' );
  var OnOffSwitch = require( 'SUN/OnOffSwitch' );
  var PageControl = require( 'SUN/PageControl' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var sun = require( 'SUN/sun' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  function ComponentsView() {
    DemosView.call( this, 'component', [

      /**
       * To add a demo, add an object literal here. Each object has these properties:
       *
       * {string} label - label in the combo box
       * {function(Bounds2): Node} getNode - creates the scene graph for the demo
       */
      { label: 'Carousel', getNode: demoCarousel },
      { label: 'HSlider', getNode: demoHSlider },
      { label: 'OnOffSwitch', getNode: demoOnOffSwitch },
      { label: 'PageControl', getNode: demoPageControl },
      { label: 'NumberSpinner', getNode: demoNumberSpinner }
    ] );
  }

  sun.register( 'ComponentsView', ComponentsView );

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

    // vertical carousel
    var vCarousel = new Carousel( vItems, {
      orientation: 'vertical',
      separatorsVisible: true,
      buttonTouchAreaXDilation: 5,
      buttonTouchAreaYDilation: 15,
      buttonMouseAreaXDilation: 2,
      buttonMouseAreaYDilation: 7
    } );

    // horizontal carousel
    var hCarousel = new Carousel( hItems, {
      orientation: 'horizontal',
      buttonTouchAreaXDilation: 15,
      buttonTouchAreaYDilation: 5,
      buttonMouseAreaXDilation: 7,
      buttonMouseAreaYDilation: 2,
      centerX: vCarousel.centerX,
      top: vCarousel.bottom + 50
    } );

    // button that scrolls the horizontal carousel to a specific item
    var itemIndex = 4;
    var hScrollToItemButton = new RectangularPushButton( {
      content: new Text( 'scroll to item ' + itemIndex, { font: new PhetFont( 20 ) } ),
      listener: function() {
        hCarousel.scrollToItem( hItems[ itemIndex ] );
      }
    } );

    // button that sets the horizontal carousel to a specific page number
    var pageNumber = 0;
    var hScrollToPageButton = new RectangularPushButton( {
      content: new Text( 'scroll to page ' + pageNumber, { font: new PhetFont( 20 ) } ),
      listener: function() {
        hCarousel.pageNumberProperty.set( pageNumber );
      }
    } );

    // group the buttons
    var buttonGroup = new VBox( {
      children: [ hScrollToItemButton, hScrollToPageButton ],
      align: 'left',
      spacing: 7,
      left: hCarousel.right + 30,
      centerY: hCarousel.centerY
    } );

    return new Node( {
      children: [ vCarousel, hCarousel, buttonGroup ],
      center: layoutBounds.center
    } );
  };

  // Creates a demo for HSlider
  var demoHSlider = function( layoutBounds ) {

    var property = new Property( 0 );
    var range = new RangeWithValue( 0, 100 );
    var tickLabelOptions = { font: new PhetFont( 16 ) };
    var slider = new HSlider( property, range, {
      trackSize: new Dimension2( 300, 5 ),
      center: layoutBounds.center,
      enabledProperty: new Property( true )
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

    // enable/disable slider
    var enabledProperty = new Property( true );
    enabledProperty.link( function( enabled ) {
      slider.enabled = enabled;
    } );
    var enabledCheckBox = CheckBox.createTextCheckBox( 'Enable slider', { font: new PhetFont( 20 ) }, enabledProperty, {
      left: slider.left,
      top: minorTicksCheckBox.bottom + 40
    } );

    // restrict enabled range of slider
    var restrictedRangeProperty = new Property( false );
    var enabledRangeProperty = new Property( { min: 0, max: 100 } );
    restrictedRangeProperty.link( function( restrictedRange ) {
      enabledRangeProperty.value = restrictedRange ? { min: 25, max: 75 } : { min: 0, max: 100 };
    } );
    enabledRangeProperty.link( function( enabledRange ) {
      slider.enabledRange = enabledRange;
    } );
    var enabledRangeCheckBox = CheckBox.createTextCheckBox( 'Enable Range [25, 75]', { font: new PhetFont( 20 ) }, restrictedRangeProperty, {
      left: slider.left,
      top: enabledCheckBox.bottom + 40
    } );
    return new Node( { children: [ slider, majorTicksCheckBox, minorTicksCheckBox, enabledCheckBox, enabledRangeCheckBox ] } );
  };

  // Creates a demo for OnOffSwitch
  var demoOnOffSwitch = function( layoutBounds ) {
    return new OnOffSwitch( new Property( true ), {
      size: new Dimension2( 80, 30 ),
      thumbTouchAreaXDilation: 10,
      thumbTouchAreaYDilation: 10,
      thumbMouseAreaXDilation: 5,
      thumbMouseAreaYDilation: 5,
      center: layoutBounds.center
    } );
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
      dotTouchAreaDilation: 8,
      dotMouseAreaDilation: 4,
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

  // Creates a demo for NumberSpinner
  var demoNumberSpinner = function( layoutBounds ) {

    var valueProperty = new Property( 0 );
    var valueRange = new Range( -5, 5 );
    var enabledProperty = new Property( true );

    // options for all spinners
    var spinnerOptions = {
      enabledProperty: enabledProperty,
      touchAreaXDilation: 20,
      touchAreaYDilation: 10,
      mouseAreaXDilation: 10,
      mouseAreaYDilation: 5,
      decimalPlaces: 1,
      deltaValue: 0.1,
      backgroundMinWidth: 100,
      xMargin: 10
    };

    // Demonstrate each value of options.arrowsPosition
    var spinnerLeftRight = new NumberSpinner( valueProperty, valueRange, _.extend( {}, spinnerOptions, {
      arrowsPosition: 'leftRight',
      valuePattern: '{0} bottles of beer on the wall'
    } ) );
    var spinnerTopBottom = new NumberSpinner( valueProperty, valueRange, _.extend( {}, spinnerOptions, {
      arrowsPosition: 'topBottom',
      arrowsScale: 0.65
    } ) );
    var spinnerBothRight = new NumberSpinner( valueProperty, valueRange, _.extend( {}, spinnerOptions, {
      arrowsPosition: 'bothRight',
      yMargin: 10,
      valueAlign: 'right'
    } ) );
    var spinnerBothBottom = new NumberSpinner( valueProperty, valueRange, _.extend( {}, spinnerOptions, {
      arrowsPosition: 'bothBottom',
      backgroundFill: 'pink',
      backgroundStroke: 'red',
      backgroundLineWidth: 3,
      arrowButtonFill: 'lightblue',
      arrowButtonStroke: 'blue',
      arrowButtonLineWidth: 0.2,
      valueAlign: 'left'
    } ) );

    var enabledCheckBox = new CheckBox( new Text( 'enabled', new PhetFont( 20 ) ), enabledProperty );

    return new VBox( {
      children: [ spinnerLeftRight, spinnerTopBottom, spinnerBothRight, spinnerBothBottom, enabledCheckBox ],
      spacing: 40,
      center: layoutBounds.center
    } );
  };

  return inherit( DemosView, ComponentsView );
} );