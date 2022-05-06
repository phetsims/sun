// Copyright 2022, University of Colorado Boulder

/**
 * Demos for the recommended layout patterns
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import optionize from '../../../phet-core/js/optionize.js';
import Constructor from '../../../phet-core/js/types/Constructor.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { AlignBox, FlowBox, Node, Rectangle, Text, VDivider } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Checkbox from '../Checkbox.js';
import Panel from '../Panel.js';
import sun from '../sun.js';
import sunQueryParameters from '../sunQueryParameters.js';
import DemosScreenView, { DemosScreenViewOptions } from './DemosScreenView.js';

class LayoutScreenView extends DemosScreenView {

  constructor( providedOptions: DemosScreenViewOptions ) {

    const options = optionize<DemosScreenViewOptions, {}, DemosScreenViewOptions>()( {
      selectedDemoLabel: sunQueryParameters.layout,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( [

      /**
       * To add a demo, add an object literal here. Each object has these properties:
       *
       * {string} label - label in the combo box
       * {function(Bounds2): Node} createNode - creates the scene graph for the demo
       */
      { label: 'Width of multiple panels', createNode: demoMultiplePanels, tandemName: 'multiplePanels' },
      { label: 'Separators', createNode: demoSeparators, tandemName: 'separators' }
    ], options );
  }
}

const MARGIN = 10;
const COPY_FONT = new PhetFont( 12 );
const SECTION_FONT = new PhetFont( { size: 14, weight: 'bold' } );

const overrideDispose = <T extends Constructor<Node>>( node: InstanceType<T>, Type: T, callback: () => void ) => {
  node.dispose = function( this: InstanceType<T> ) {
    callback();

    Type.prototype.dispose.call( this );
  };

  return node;
};

const onElapsed = ( callback: ( elapsedTime: number ) => void ): ( () => void ) => {
  let elapsedTime = 0;

  const step = ( dt: number ) => {
    elapsedTime += dt;
    callback( elapsedTime );
  };

  callback( elapsedTime );

  stepTimer.addListener( step );

  return () => stepTimer.removeListener( step );
};

const createCheckbox = ( str: string, checked = false ): Node => {
  return new Checkbox( new Text( str, {
    font: COPY_FONT
  } ), new BooleanProperty( checked, { tandem: Tandem.OPT_OUT } ), {
    boxWidth: 14
  } );
};

const createHorizontalResizer = ( height: number, minWidth: number, maxWidth: number ): Node => {
  const result = new Rectangle( {
    fill: 'green',
    rectHeight: height
  } );

  return overrideDispose( result, Rectangle, onElapsed( ( elapsedTime: number ) => {
    result.rectWidth = ( minWidth + maxWidth ) / 2 + Math.cos( elapsedTime ) * ( maxWidth - minWidth ) / 2;
  } ) );
};

const createDisappearing = ( width: number, height: number ): Node => {
  const result = new Rectangle( {
    fill: 'green',
    rectWidth: width,
    rectHeight: height
  } );

  return overrideDispose( result, Rectangle, onElapsed( ( elapsedTime: number ) => {
    result.visible = Math.floor( elapsedTime ) % 2 === 0;
  } ) );
};

function demoMultiplePanels( layoutBounds: Bounds2 ): Node {
  const resizer = createHorizontalResizer( 15, 30, 200 );

  const panelA = new Panel( new FlowBox( {
    orientation: 'vertical',
    align: 'left',
    spacing: 5,
    children: [
      new Text( 'Checkboxes', { font: SECTION_FONT } ),
      createCheckbox( 'First Checkbox' ),
      createCheckbox( 'Second Checkbox' )
    ]
  } ) );

  const panelB = new Panel( new FlowBox( {
    orientation: 'vertical',
    align: 'left',
    spacing: 5,
    children: [
      new Text( 'Resizing', { font: SECTION_FONT } ),
      resizer
    ]
  } ) );

  const panelsNode = new FlowBox( {
    orientation: 'vertical',

    // This sets the default alignment to stretch (NOTE: this could also be provided in panelA/panelB's layoutOptions)
    align: 'stretch',

    spacing: MARGIN,
    children: [
      panelA,
      panelB
    ]
  } );

  const alignBox = new AlignBox( panelsNode, { alignBounds: layoutBounds, margin: MARGIN, xAlign: 'right', yAlign: 'top' } );

  return overrideDispose( alignBox, AlignBox, () => resizer.dispose() );
}

function demoSeparators( layoutBounds: Bounds2 ): Node {
  const disappearing = createDisappearing( 150, 100 );

  const panel = new Panel( new FlowBox( {
    orientation: 'vertical',
    align: 'left',
    spacing: 5,
    children: [
      new VDivider(),
      new Text( 'Disappearing Node?:', { font: SECTION_FONT } ),
      new VDivider(),
      disappearing,
      new VDivider()
    ]
  } ) );

  const alignBox = new AlignBox( panel, { alignBounds: layoutBounds, margin: MARGIN, xAlign: 'right', yAlign: 'top' } );

  return overrideDispose( alignBox, AlignBox, () => disappearing.dispose() );
}

sun.register( 'LayoutScreenView', LayoutScreenView );
export default LayoutScreenView;