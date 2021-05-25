// Copyright 2015-2021, University of Colorado Boulder

/**
 * Base type for ScreenViews that use a carousel to select a demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CarouselComboBox from '../CarouselComboBox.js';
import ComboBoxItem from '../ComboBoxItem.js';
import sun from '../sun.js';

// constants
const ITEM_FONT = new PhetFont( 14 );

/**
 * @typedef Demo - specification for a 'demo', the demonstration of some component or functionality
 * @property {string} label - label in the carousel
 * @property {function(layoutBounds:Bounds2): Node} createNode - creates the Node for the demo
 * @property {Node|null} node - the Node for the demo, created by DemosScreenView
 */

class DemosScreenView extends ScreenView {

  /**
   * @param {Demo[]} demos
   * @param {Object} [options]
   */
  constructor( demos, options ) {

    options = merge( {

      // {string|null} label field of the {Demo} to be selected initially, defaults to the first demo after sorting
      selectedDemoLabel: null,

      // {boolean} see https://github.com/phetsims/sun/issues/386
      // true = caches Nodes for all demos that have been selected
      // false = keeps only the Node for the selected demo in memory
      cacheDemos: false,

      tandem: Tandem.OPTIONAL
    }, options );

    super( options );

    const demosParent = new Node();
    const layoutBounds = this.layoutBounds;

    // Support PhET-iO API instrumentation and API tracking
    if ( Tandem.PHET_IO_ENABLED ) {
      options.cacheDemos = true;

      demos.forEach( demo => {
        demo.node = demo.createNode( layoutBounds, {
          tandem: options.tandem.createTandem( `demo${demo.label}` )
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

    // The initial demo that is selected
    let selectedDemo = demos[ 0 ];
    if ( options.selectedDemoLabel ) {
      selectedDemo = _.find( demos, demo => {
        return ( demo.label === options.selectedDemoLabel );
      } );
      if ( !selectedDemo ) {
        throw new Error( `demo not found: ${options.selectedDemoLabel}` );
      }
    }

    // {Property.<Demo>} the demo that is currently selected
    const selectedDemoProperty = new Property( selectedDemo );

    const selectADemoLabel = new Text( 'Select a Demo:', {
      font: new PhetFont( 16 )
    } );
    this.addChild( selectADemoLabel );

    // {ComboBoxItem[]}
    const items = _.map( demos, demo => new ComboBoxItem( new Text( demo.label, { font: ITEM_FONT } ), demo ) );

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
        if ( options.cacheDemos ) {

          // make the old demo invisible
          oldDemo.node.visible = false;
        }
        else {

          // delete the old demo
          demosParent.removeChild( oldDemo.node );
          oldDemo.node.dispose();
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
          tandem: options.tandem.createTandem( `demo${demo.label}` )
        } );
        demosParent.addChild( demo.node );
      }
    } );
  }
}

sun.register( 'DemosScreenView', DemosScreenView );
export default DemosScreenView;