// Copyright 2015-2025, University of Colorado Boulder

/**
 * DemosScreenView is the base class for ScreenViews that use a carousel to select a demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import type Bounds2 from '../../../dot/js/Bounds2.js';
import ScreenView, { type ScreenViewOptions } from '../../../joist/js/ScreenView.js';
import optionize from '../../../phet-core/js/optionize.js';
import type PickOptional from '../../../phet-core/js/types/PickOptional.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Node, { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CarouselComboBox from '../CarouselComboBox.js';
import sun from '../sun.js';
import sunQueryParameters from '../sunQueryParameters.js';

// constants
const COMBO_BOX_ITEM_FONT = new PhetFont( 14 );

export type SunDemoOptions = NodeOptions;

type DemoItemName = string;

export type DemoItemData = {

  // string used to label the demo in ComboBox
  label: DemoItemName;

  // creates the Node for the demo
  createNode: ( layoutBounds: Bounds2, options: SunDemoOptions ) => Node;

  node?: Node | null | undefined;

  tandemName?: string;
};

type SelfOptions = {

  // label field of the DemoItemData to be selected initially, defaults to the first demo after sorting
  selectedDemoLabel?: DemoItemName | null;

  // See https://github.com/phetsims/sun/issues/386
  // true = caches Nodes for all demos that have been selected
  // false = keeps only the Node for the selected demo in memory
  cacheDemos?: boolean;
};

export type DemosScreenViewOptions = SelfOptions & StrictOmit<ScreenViewOptions, 'tandem'> &
  PickOptional<ScreenViewOptions, 'tandem'>;

class DemosScreenView extends ScreenView {

  public constructor( demos: DemoItemData[], providedOptions?: DemosScreenViewOptions ) {

    const options = optionize<DemosScreenViewOptions, SelfOptions, ScreenViewOptions>()( {

      // DemosScreenViewOptions
      selectedDemoLabel: sunQueryParameters.component,
      cacheDemos: false,

      // ScreenViewOptions
      tandem: Tandem.OPTIONAL
    }, providedOptions );

    super( options );

    const demosParent = new Node();
    const layoutBounds = this.layoutBounds;

    // Support PhET-iO API instrumentation and API tracking
    if ( Tandem.PHET_IO_ENABLED ) {
      options.cacheDemos = true;

      demos.forEach( demo => {
        demo.node = demo.createNode( layoutBounds, {
          tandem: options.tandem.createTandem( `demo${demo.tandemName ? demo.tandemName : demo.label}` )
        } );
        demo.node.visible = false;
        demosParent.addChild( demo.node );
      } );
    }

    // All demos will be children of this node, to maintain rendering order with combo box list
    this.addChild( demosParent );

    // Sort the demos by label, so that they appear in the combo box in alphabetical order
    demos = _.sortBy( demos, demo => {
      return demo.label;
    } );

    // The initial demo that is selected, allow grace for query parameter support
    const selectedDemo = options.selectedDemoLabel ?
                         _.find( demos, demo => demo.label === options.selectedDemoLabel ) || demos[ 0 ] :
                         demos[ 0 ];

    // {Property.<Demo>} the demo that is currently selected
    const selectedDemoProperty = new Property( selectedDemo );

    const selectADemoLabel = new Text( 'Select a Demo:', {
      font: new PhetFont( 16 )
    } );
    this.addChild( selectADemoLabel );

    // {ComboBoxItem[]}
    const items = demos.map( demo => {
      return {
        value: demo,
        createNode: () => new Text( demo.label, { font: COMBO_BOX_ITEM_FONT } )
      };
    } );

    const carouselComboBox = new CarouselComboBox( selectedDemoProperty, items, {
      tandem: options.tandem.createTandem( 'carouselComboBox' )
    } );
    this.addChild( carouselComboBox );

    // Layout, with button vertically centered on label.
    selectADemoLabel.left = this.layoutBounds.left + 20;
    carouselComboBox.left = selectADemoLabel.right + 10;
    carouselComboBox.top = this.layoutBounds.top + 20;
    selectADemoLabel.centerY = carouselComboBox.visibleBounds.centerY;

    // Make the selected demo visible
    selectedDemoProperty.link( ( demo, oldDemo ) => {

      // clean up the previously selected demo
      if ( oldDemo ) {

        const oldDemoNode = oldDemo.node!;

        if ( options.cacheDemos ) {

          // make the old demo invisible
          oldDemoNode.visible = false;
        }
        else {

          // Delete the old demo.  Note that this will ONLY call the dispose function on the component being demoed if
          // that component is the only thing provided as a demo node, or if the demo node is subclassed and provides
          // its own dispose function.  If the demo node is a VBox or something of that nature, the dispose function of
          // the demoed component(s) will not be invoked.  See https://github.com/phetsims/sun/issues/386.
          demosParent.removeChild( oldDemoNode );
          oldDemoNode.dispose();
          oldDemo.node = null;
        }
      }

      if ( demo.node ) {

        // If the selected demo has an associated node, make it visible.
        demo.node.visible = true;
      }
      else {

        // If the selected demo doesn't doesn't have an associated node, create it.
        demo.node = demo.createNode( layoutBounds, {
          tandem: options.tandem.createTandem( `demo${demo.tandemName ? demo.tandemName : demo.label}` )
        } );
        demosParent.addChild( demo.node );
      }
    } );
  }
}

sun.register( 'DemosScreenView', DemosScreenView );
export default DemosScreenView;