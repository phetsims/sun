// Copyright 2015, University of Colorado Boulder

/**
 * Demonstration of misc sun UI components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccordionBox = require( 'SUN/AccordionBox' );
  var Carousel = require( 'SUN/Carousel' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var ComboBox = require( 'SUN/ComboBox' );
  var DemosScreenView = require( 'SUN/demo/DemosScreenView' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberSpinner = require( 'SUN/NumberSpinner' );
  var OnOffSwitch = require( 'SUN/OnOffSwitch' );
  var PageControl = require( 'SUN/PageControl' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Timer = require( 'PHET_CORE/Timer' );
  var sun = require( 'SUN/sun' );
  var sunQueryParameters = require( 'SUN/sunQueryParameters' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var AlignBox = require( 'SCENERY/nodes/AlignBox' );
  var AlignGroup = require( 'SCENERY/nodes/AlignGroup' );

  /**
   * @constructor
   */
  function ComponentsScreenView() {
    DemosScreenView.call( this, [

      /**
       * To add a demo, add an object literal here. Each object has these properties:
       *
       * {string} label - label in the combo box
       * {function(Bounds2): Node} getNode - creates the scene graph for the demo
       */
      { label: 'Carousel', getNode: demoCarousel },
      { label: 'ComboBox', getNode: demoComboBox },
      { label: 'HSlider', getNode: demoHSlider },
      { label: 'OnOffSwitch', getNode: demoOnOffSwitch },
      { label: 'PageControl', getNode: demoPageControl },
      { label: 'NumberSpinner', getNode: demoNumberSpinner },
      { label: 'AlignGroup', getNode: demoAlignGroup },
      { label: 'AccordionBox', getNode: demoAccordionBox }
    ], {
      selectedDemoLabel: sunQueryParameters.component
    } );
  }

  sun.register( 'ComponentsScreenView', ComponentsScreenView );

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

  // Creates a demo of ComboBox
  var demoComboBox = function( layoutBounds ) {

    var labels = [ 'one', 'two', 'three', 'four', 'five', 'six' ];
    var items = [];
    labels.forEach( function( label ) {
      items.push( ComboBox.createItem( new Text( label, { font: new PhetFont( { size: 20 } ) } ), label ) );
    } );

    var selectedItemProperty = new Property( labels[ 0 ] );

    var listParent = new Node();

    var comboBox = new ComboBox( items, selectedItemProperty, listParent, {
      listPosition: 'above'
    } );

    var enabledCheckBox = new CheckBox( new Text( 'enabled', { font: new PhetFont( 20 ) } ), comboBox.enabledProperty );

    var uiComponents = new VBox( {
      children: [ comboBox, enabledCheckBox ],
      spacing: 40,
      center: layoutBounds.center
    } );

    return new Node( { children: [ uiComponents, listParent ] } );
  };

  // Creates a demo for HSlider
  var demoHSlider = function( layoutBounds ) {

    var property = new Property( 0 );
    var range = new RangeWithValue( 0, 100 );
    var tickLabelOptions = { font: new PhetFont( 16 ) };
    var slider = new HSlider( property, range, {
      trackSize: new Dimension2( 300, 5 ),
      thumbTouchAreaXDilation: 15,
      thumbTouchAreaYDilation: 15,
      thumbMouseAreaXDilation: 5,
      thumbMouseAreaYDilation: 5,
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
    var valueRangeProperty = new Property( new Range( -5, 5 ) );
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
    var spinnerLeftRight = new NumberSpinner( valueProperty, valueRangeProperty, _.extend( {}, spinnerOptions, {
      arrowsPosition: 'leftRight',
      valuePattern: '{0} bottles of beer on the wall'
    } ) );
    var spinnerTopBottom = new NumberSpinner( valueProperty, valueRangeProperty, _.extend( {}, spinnerOptions, {
      arrowsPosition: 'topBottom',
      arrowsScale: 0.65
    } ) );
    var spinnerBothRight = new NumberSpinner( valueProperty, valueRangeProperty, _.extend( {}, spinnerOptions, {
      arrowsPosition: 'bothRight',
      yMargin: 10,
      valueAlign: 'right'
    } ) );
    var spinnerBothBottom = new NumberSpinner( valueProperty, valueRangeProperty, _.extend( {}, spinnerOptions, {
      arrowsPosition: 'bothBottom',
      backgroundFill: 'pink',
      backgroundStroke: 'red',
      backgroundLineWidth: 3,
      arrowButtonFill: 'lightblue',
      arrowButtonStroke: 'blue',
      arrowButtonLineWidth: 0.2,
      valueAlign: 'left'
    } ) );

    var enabledCheckBox = new CheckBox( new Text( 'enabled', { font: new PhetFont( 20 ) } ), enabledProperty );

    return new VBox( {
      children: [ spinnerLeftRight, spinnerTopBottom, spinnerBothRight, spinnerBothBottom, enabledCheckBox ],
      spacing: 40,
      center: layoutBounds.center
    } );
  };

  var demoAlignGroup = function( layoutBounds ) {
    function highlightWrap( node ) {
      var rect = Rectangle.bounds( node.bounds, { fill: 'rgba(0,0,0,0.25)' } );
      node.on( 'bounds', function() {
        rect.setRectBounds( node.bounds );
      } );
      return new Node( {
        children: [
          rect,
          node
        ]
      } );
    }

    var iconGroup = new AlignGroup();
    var iconRow = new HBox( {
      spacing: 10,
      children: _.range( 1, 10 ).map( function() {
        var randomRect = new Rectangle( 0, 0, Math.random() * 60 + 10, Math.random() * 60 + 10, {
          fill: 'black'
        } );
        Timer.addStepListener( function() {
          if ( Math.random() < 0.02 ) {
            randomRect.rectWidth = Math.random() * 60 + 10;
            randomRect.rectHeight = Math.random() * 60 + 10;
          }
        } );
        return new AlignBox( randomRect, {
          group: iconGroup,
          margin: 5
        } );
      } ).map( highlightWrap )
    } );

    var panelGroup = new AlignGroup( { matchVertical: false } );
    function randomText() {
      var text = new Text( 'Test', { fontSize: 20 } );
      Timer.addStepListener( function() {
        if ( Math.random() < 0.03 ) {
          var string = '';
          while ( Math.random() < 0.94 && string.length < 20 ) {
            string += ( Math.random() + '' ).slice( -1 );
          }
          text.text = string;
        }
      } );
      return text;
    }
    var panelRow = new VBox( {
      spacing: 10,
      children: [
        new Panel( new AlignBox( randomText(), { group: panelGroup } ) ),
        new Panel( new AlignBox( new VBox( {
          spacing: 3,
          children: [
            randomText(),
            randomText()
          ]
        } ), { group: panelGroup } ) )
      ]
    } );

    return new VBox( {
      spacing: 20,
      children: [ iconRow, panelRow ],
      center: layoutBounds.center
    } );
  };

  var demoAccordionBox = function( layoutBounds ) {
    var randomRect = new Rectangle( 0, 0, 100, 50, { fill: 'red' } );

    var resizeButton = new RectangularPushButton( {
      content: new Text( 'Resize', { font: new PhetFont( 20 ) } ),
      listener: function() {
        randomRect.rectWidth = 50 + phet.joist.random.nextDouble() * 150;
        randomRect.rectHeight = 50 + phet.joist.random.nextDouble() * 150;
        box.center = layoutBounds.center;
      }
    } );

    var box = new AccordionBox( new VBox( {
      spacing: 10,
      children: [
        resizeButton,
        randomRect
      ]
    } ), {
      resize: true,
      center: layoutBounds.center
    } );

    return box;
  };

  return inherit( DemosScreenView, ComponentsScreenView );
} );