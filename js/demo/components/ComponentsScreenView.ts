// Copyright 2015-2022, University of Colorado Boulder

/**
 * Demonstration of misc sun UI components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import EmptyObjectType from '../../../../phet-core/js/types/EmptyObjectType.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, AlignGroup, HBox, Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../AccordionBox.js';
import RectangularPushButton from '../../buttons/RectangularPushButton.js';
import Carousel from '../../Carousel.js';
import Checkbox from '../../Checkbox.js';
import ComboBox, { ComboBoxItem } from '../../ComboBox.js';
import NumberSpinner, { NumberSpinnerOptions } from '../../NumberSpinner.js';
import OnOffSwitch from '../../OnOffSwitch.js';
import PageControl from '../../PageControl.js';
import Panel from '../../Panel.js';
import sun from '../../sun.js';
import sunQueryParameters from '../../sunQueryParameters.js';
import ToggleSwitch from '../../ToggleSwitch.js';
import DemosScreenView, { DemosScreenViewOptions } from '../DemosScreenView.js';
import NumberPicker from '../../NumberPicker.js';
import demoABSwitch from './demoABSwitch.js';
import demoCarousel from './demoCarousel.js';
import demoCheckbox from './demoCheckbox.js';
import { demoHSlider, demoVSlider } from './demoSlider.js';

type SelfOptions = EmptyObjectType;
type ButtonsScreenViewOptions = SelfOptions & PickRequired<DemosScreenViewOptions, 'tandem'>;

export default class ComponentsScreenView extends DemosScreenView {

  public constructor( providedOptions: ButtonsScreenViewOptions ) {

    const options = optionize<ButtonsScreenViewOptions, SelfOptions, DemosScreenViewOptions>()( {
      selectedDemoLabel: sunQueryParameters.component
    }, providedOptions );

    super( [

      /**
       * To add a demo, add an object literal here. Each object has these properties:
       *
       * {string} label - label in the combo box
       * {function(Bounds2): Node} createNode - creates the scene graph for the demo
       */
      { label: 'ABSwitch', createNode: demoABSwitch },
      { label: 'Carousel', createNode: demoCarousel },
      { label: 'Checkbox', createNode: demoCheckbox },
      { label: 'ComboBox', createNode: demoComboBox },
      { label: 'HSlider', createNode: demoHSlider },
      { label: 'VSlider', createNode: demoVSlider },
      { label: 'OnOffSwitch', createNode: demoOnOffSwitch },
      { label: 'PageControl', createNode: demoPageControl },
      { label: 'NumberSpinner', createNode: demoNumberSpinner },
      { label: 'NumberPicker', createNode: demoNumberPicker },
      { label: 'AlignGroup', createNode: demoAlignGroup },
      { label: 'AccordionBox', createNode: demoAccordionBox },
      { label: 'ToggleSwitch', createNode: demoToggleSwitch }
    ], options );
  }
}

function demoComboBox( layoutBounds: Bounds2 ): Node {

  const values = [ 'one', 'two', 'three', 'four', 'five', 'six' ];
  const items: ComboBoxItem<string>[] = [];
  values.forEach( value => {
    items.push( {
      value: value,
      node: new Text( value, { font: new PhetFont( { size: 20 } ) } )
    } );
  } );

  const selectedItemProperty = new Property( values[ 0 ] );

  const listParent = new Node();

  const enabledProperty = new BooleanProperty( true );

  const comboBox = new ComboBox( selectedItemProperty, items, listParent, {
    highlightFill: 'yellow',
    listPosition: 'above',
    enabledProperty: enabledProperty
  } );

  const enabledCheckbox = new Checkbox( enabledProperty, new Text( 'enabled', { font: new PhetFont( 20 ) } ) );

  const uiComponents = new VBox( {
    children: [ comboBox, enabledCheckbox ],
    spacing: 40,
    center: layoutBounds.center
  } );

  return new Node( { children: [ uiComponents, listParent ] } );
}

function demoToggleSwitch( layoutBounds: Bounds2 ): Node {
  return new ToggleSwitch( new StringProperty( 'left' ), 'left', 'right', {
    center: layoutBounds.center
  } );
}

function demoOnOffSwitch( layoutBounds: Bounds2 ): Node {
  return new OnOffSwitch( new BooleanProperty( true ), {
    center: layoutBounds.center
  } );
}

function demoPageControl( layoutBounds: Bounds2 ): Node {

  // create items
  const colors = [ 'red', 'blue', 'green', 'yellow', 'pink', 'white', 'orange', 'magenta', 'purple', 'pink' ];
  const items: Node[] = [];
  colors.forEach( color => {
    items.push( new Rectangle( 0, 0, 100, 100, { fill: color, stroke: 'black' } ) );
  } );

  // carousel
  const carousel = new Carousel( items, {
    orientation: 'horizontal',
    itemsPerPage: 3
  } );

  // page control
  const pageControl = new PageControl( carousel.pageNumberProperty, carousel.numberOfPages, {
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
}

function demoNumberSpinner( layoutBounds: Bounds2 ): Node {

  const valueProperty = new Property( 0 );
  const valueRangeProperty = new Property( new Range( -5, 5 ) );
  const enabledProperty = new Property( true );

  // options for all spinners
  const spinnerOptions: NumberSpinnerOptions = {
    enabledProperty: enabledProperty,
    deltaValue: 0.1,
    touchAreaXDilation: 20,
    touchAreaYDilation: 10,
    mouseAreaXDilation: 10,
    mouseAreaYDilation: 5,
    numberDisplayOptions: {
      decimalPlaces: 1,
      align: 'center',
      xMargin: 10,
      yMargin: 3,
      minBackgroundWidth: 100,
      textOptions: {
        font: new PhetFont( 28 )
      }
    }
  };

  // Demonstrate each value of options.arrowsPosition
  const spinnerLeftRight = new NumberSpinner( valueProperty, valueRangeProperty,
    combineOptions<NumberSpinnerOptions>( {}, spinnerOptions, {
      arrowsPosition: 'leftRight',
      numberDisplayOptions: {
        valuePattern: '{{value}} bottles of beer on the wall'
      }
    } ) );

  const spinnerTopBottom = new NumberSpinner( valueProperty, valueRangeProperty,
    combineOptions<NumberSpinnerOptions>( {}, spinnerOptions, {
      arrowsPosition: 'topBottom',
      arrowsScale: 0.65
    } ) );

  const spinnerBothRight = new NumberSpinner( valueProperty, valueRangeProperty,
    combineOptions<NumberSpinnerOptions>( {}, spinnerOptions, {
      arrowsPosition: 'bothRight',
      numberDisplayOptions: {
        yMargin: 10,
        align: 'right'
      }
    } ) );

  const spinnerBothBottom = new NumberSpinner( valueProperty, valueRangeProperty,
    combineOptions<NumberSpinnerOptions>( {}, spinnerOptions, {
      arrowsPosition: 'bothBottom',
      numberDisplayOptions: {
        backgroundFill: 'pink',
        backgroundStroke: 'red',
        backgroundLineWidth: 3,
        align: 'left'
      },
      arrowButtonFill: 'lightblue',
      arrowButtonStroke: 'blue',
      arrowButtonLineWidth: 0.2
    } ) );

  const enabledCheckbox = new Checkbox( enabledProperty, new Text( 'enabled', { font: new PhetFont( 20 ) } ) );

  return new VBox( {
    children: [ spinnerTopBottom, spinnerBothRight, spinnerBothBottom, spinnerLeftRight, enabledCheckbox ],
    spacing: 40,
    center: layoutBounds.center
  } );
}

function demoNumberPicker( layoutBounds: Bounds2 ): Node {

  const enabledProperty = new BooleanProperty( true );

  const numberPicker = new NumberPicker( new Property( 0 ), new Property( new Range( -10, 10 ) ), {
    font: new PhetFont( 40 ),
    enabledProperty: enabledProperty
  } );

  const enabledCheckbox = new Checkbox( enabledProperty, new Text( 'enabled', { font: new PhetFont( 20 ) } ) );

  return new VBox( {
    spacing: 40,
    children: [ numberPicker, enabledCheckbox ],
    center: layoutBounds.center
  } );
}

function demoAlignGroup( layoutBounds: Bounds2 ): Node {

  function highlightWrap( node: Node ): Node {
    const rect = Rectangle.bounds( node.bounds, { fill: 'rgba(0,0,0,0.25)' } );
    node.boundsProperty.lazyLink( () => {
      rect.setRectBounds( node.bounds );
    } );
    return new Node( {
      children: [
        rect,
        node
      ]
    } );
  }

  // Scheduling randomness in stepTimer on startup leads to a different number of calls in the upstream and downstream
  // sim in the playback wrapper.  This workaround uses Math.random() to avoid a mismatch in the number of dotRandom calls.
  const stepRand = () => {
    return Math.random(); // eslint-disable-line bad-sim-text
  };
  const iconGroup = new AlignGroup();
  const iconRow = new HBox( {
    spacing: 10,
    children: _.range( 1, 10 ).map( () => {
      const randomRect = new Rectangle( 0, 0, dotRandom.nextDouble() * 60 + 10, dotRandom.nextDouble() * 60 + 10, {
        fill: 'black'
      } );
      stepTimer.addListener( () => {
        if ( stepRand() < 0.02 ) {
          randomRect.rectWidth = stepRand() * 60 + 10;
          randomRect.rectHeight = stepRand() * 60 + 10;
        }
      } );
      return new AlignBox( randomRect, {
        group: iconGroup,
        margin: 5
      } );
    } ).map( highlightWrap )
  } );

  const panelGroup = new AlignGroup( { matchVertical: false } );

  function randomText(): Text {
    const text = new Text( 'Test', { fontSize: 20 } );
    stepTimer.addListener( () => {
      if ( stepRand() < 0.03 ) {
        let string = '';
        while ( stepRand() < 0.94 && string.length < 20 ) {
          string += ( `${stepRand()}` ).slice( -1 );
        }
        text.text = string;
      }
    } );
    return text;
  }

  const panelRow = new VBox( {
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
}

function demoAccordionBox( layoutBounds: Bounds2 ): Node {
  const randomRect = new Rectangle( 0, 0, 100, 50, { fill: 'red' } );

  const resizeButton = new RectangularPushButton( {
    content: new Text( 'Resize', { font: new PhetFont( 20 ) } ),
    listener: () => {
      randomRect.rectWidth = 50 + dotRandom.nextDouble() * 150;
      randomRect.rectHeight = 50 + dotRandom.nextDouble() * 150;
      box.center = layoutBounds.center;
    }
  } );

  const box = new AccordionBox( new VBox( {
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
}

sun.register( 'ComponentsScreenView', ComponentsScreenView );