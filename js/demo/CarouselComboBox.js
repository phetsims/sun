// Copyright 2021, University of Colorado Boulder

/**
 * CarouselComboBox behaves like a combo box, but its listbox is a carousel. This allows you to scroll through a
 * long list of items, a feature that ComboBoxListBox does not support. ComboBoxItem, ComboBoxButton, and
 * Carousel are reused.
 *
 * NOTE! This was created as a quick way to address situations where ComboBox's listbox gets too long, for example
 * https://github.com/phetsims/sun/issues/673. This tends to happen in internal 'demo' applications
 * (sun, scenery-phet,... ) that have long lists of demos. And as a design best-practice, we tend to avoid
 * longs lists of things in sims. So that's why CarouselComboBox currently lives in sun/demo/.
 * It was written to be fairly general, so should be relatively easy to relocate if it's needed for wider use.
 *
 * Possible future work:
 * - Modify ComboBox so that it can use different types of popups (ComboBoxListBox, Carousel,...), or
 * - Make CarouselComboBox pop up the Carousel in front of everything else
 * - a11y support in CarouselComboBox
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../axon/js/Multilink.js';
import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import merge from '../../../phet-core/js/merge.js';
import AssertUtils from '../../../phetcommon/js/AssertUtils.js';
import PressListener from '../../../scenery/js/listeners/PressListener.js';
import AlignBox from '../../../scenery/js/nodes/AlignBox.js';
import AlignGroup from '../../../scenery/js/nodes/AlignGroup.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Color from '../../../scenery/js/util/Color.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Carousel from '../Carousel.js';
import ComboBoxButton from '../ComboBoxButton.js';
import ComboBoxItem from '../ComboBoxItem.js';
import PageControl from '../PageControl.js';
import sun from '../sun.js';

class CarouselComboBox extends Node {

  /**
   * @param {Property.<*>} property - the Property that is set when an item is selected
   * @param {ComboBoxItem[]} comboBoxItems - the items that appear in the carousel
   * @param {Object} [options]
   */
  constructor( property, comboBoxItems, options ) {

    assert && assert( property instanceof Property, 'invalid property' );
    assert && AssertUtils.assertArrayOf( comboBoxItems, ComboBoxItem );

    options = merge( {

      // Options specific to CarouselComboBox
      align: 'left', // {string} alignment of items in the carousel, 'left'|'right'|'center'
      overColor: Color.grayColor( 245 ), // {ColorDef} background color of the item that the pointer is over
      selectedColor: 'yellow', // {ColorDef} background color of the selected item
      itemXMargin: 6, // {number} x margin for backgrounds on the items in the carousel
      itemYMargin: 2, // {number} y margin for backgrounds on the items in the carousel

      // Options passed to Carousel
      carouselOptions: {
        arrowSize: new Dimension2( 20, 4 ),

        // Like ComboBox, 'vertical' is the only orientation supported (verified below).
        orientation: 'vertical',

        // Spacing and margins will be built into the backgrounds that are add to the item Nodes,
        // so set them to zero for the carousel.
        spacing: 0,
        margin: 0,

        // {number} If there are fewer items than this in the carousel, the actual number of items will be used.
        itemsPerPage: 15
      },

      pageControlOptions: {
        interactive: true
      },

      // Options passed to ComboBoxButton
      buttonOptions: {
        arrowDirection: 'down', // 'up' is not currently supported (verified below)
        baseColor: 'rgb( 218, 236, 255 )',
        xMargin: 6, // You'll typically want this to be the same as itemXMargin, but we're not going to force you :)
        yMargin: 4
      },

      // phet-io
      tandem: Tandem.OPTIONAL
    }, options );

    // Validate options
    assert && assert( options.carouselOptions.orientation === 'vertical', 'orientation must be vertical' );
    assert && assert( options.buttonOptions.arrowDirection === 'down', 'arrowDirection must be down' );

    // Check for options that are not settable by the client
    assert && assert( !options.children, 'CarouselComboBox sets children' );
    assert && assert( !options.buttonOptions.content, 'CarouselComboBox sets buttonOptions.content' );
    assert && assert( !options.buttonOptions.listener, 'CarouselComboBox sets buttonOptions.listener' );

    // Don't create pages that are longer than the number of items
    options.carouselOptions.itemsPerPage = Math.min( options.carouselOptions.itemsPerPage, comboBoxItems.length );

    // Orientations must be the same.
    assert && assert( !options.pageControlOptions.orientation, 'use carouselOptions.orientation' );
    options.pageControlOptions.orientation = options.carouselOptions.orientation;

    // Create tandems for subcomponents, if they were not provided
    options.carouselOptions.tandem = options.carouselOptions.tandem || options.tandem.createTandem( 'carousel' );
    options.buttonOptions.tandem = options.buttonOptions.tandem || options.tandem.createTandem( 'button' );

    // Make all Nodes for the comboBoxItems have the same width and height, left justified.
    const alignGroup = new AlignGroup();
    const itemNodes = _.map( comboBoxItems, item => {
      const node = new AlignBox( item.node, {
        group: alignGroup,
        xAlign: options.align
      } );
      node.itemValue = item.value; // attach the item's value to the Node, we'll need it later
      return node;
    } );

    // Size of the background that we'll put behind all item Nodes. Since we made all of the Nodes have the same
    // dimensions using AlignBox above, we can simply inspect the first Node.
    const backgroundSize = new Dimension2(
      itemNodes[ 0 ].width + 2 * options.itemXMargin,
      itemNodes[ 0 ].height + 2 * options.itemYMargin
    );

    // Create items for the carousel, whose API for 'items' is different than ComboBox. The Node for each item is a
    // label on a background. The background changes color when the item is selected or the pointer is over the item.
    const carouselItemNodes = [];
    const multilinks = [];
    for ( let i = 0; i < itemNodes.length; i++ ) {

      const itemNode = itemNodes[ i ];

      const backgroundNode = new Rectangle( 0, 0, backgroundSize.width, backgroundSize.height, {
        // Actual alignment of an item on the background is determined by AlignBox xAlign, above.
        center: itemNode.center
      } );

      const carouselItemNode = new Node( {
        children: [ backgroundNode, itemNode ]
      } );

      // Press on an item to select its associated value.
      const pressListener = new PressListener( {
        press: () => {
          property.value = itemNode.itemValue;
        }
      } );
      carouselItemNode.addInputListener( pressListener );

      // Selecting an item sets its background to the selected color.
      // Pointer over an item sets its background to the highlighted color.
      // Must be disposed because we do not own property.
      const multilink = new Multilink(
        [ property, pressListener.isOverProperty ],
        ( propertyValue, isOver ) => {
          if ( propertyValue === itemNode.itemValue ) {
            backgroundNode.fill = options.selectedColor;
          }
          else if ( isOver ) {
            backgroundNode.fill = options.overColor;
          }
          else {
            backgroundNode.fill = 'transparent';
          }
        } );
      multilinks.push( multilink );

      carouselItemNodes.push( carouselItemNode );
    }
    assert && assert( carouselItemNodes.length === comboBoxItems.length, 'expected a carouselItem for each comboBoxItem' );

    // Create the carousel.
    const carousel = new Carousel( carouselItemNodes, options.carouselOptions );

    // page control
    const pageControl = new PageControl( carousel.numberOfPages, carousel.pageNumberProperty, options.pageControlOptions );

    // Page control to the left of carousel
    const carouselAndPageControl = new HBox( {
      spacing: 4,
      children: [ carousel, pageControl ]
    } );

    // Pressing this button pops the carousel up and down
    const button = new ComboBoxButton( property, comboBoxItems, merge( {}, {
      listener: () => {
        carouselAndPageControl.visible = !carouselAndPageControl.visible;
      }
    }, options.buttonOptions ) );

    // Put the button above the carousel, left aligned.
    const vBox = new VBox( {
      spacing: 0,
      align: 'left',
      children: [ button, carouselAndPageControl ]
    } );

    // Wrap everything with Node, to hide VBox's API.
    options.children = [ vBox ];

    super( options );

    // If the Property changes, hide the carousel. unlink is needed on disposed.
    const propertyListener = () => { carouselAndPageControl.visible = false; };
    property.link( propertyListener );

    // Clicking outside this UI component will hide the carousel and page control.
    // NOTE: adapted from ComboBox.
    const clickToDismissListener = {
      down: event => {
        assert && assert( carousel.visible, 'this listener should be registered only when carousel is visible' );

        // If fuzzing is enabled, exercise this listener some percentage of the time, so that this listener is tested.
        // The rest of the time, ignore this listener, so that the carousel remains popped up, and we test making
        // choices from the carousel. See https://github.com/phetsims/sun/issues/677
        if ( !phet.chipper.isFuzzEnabled() || dotRandom.nextDouble() < 0.25 ) {
          const trail = event.trail;
          if ( !trail.containsNode( button ) && !trail.containsNode( carousel ) && !trail.containsNode( pageControl ) ) {
            carouselAndPageControl.visible = false;
          }
        }
      }
    };

    // Add clickToDismissListener only when the carousel & page control are visible. unlink is not needed.
    // NOTE: adapted from ComboBox.
    let display = null; // {Display}
    carouselAndPageControl.visibleProperty.link( visible => {
      if ( visible ) {
        assert && assert( !display, 'unexpected display' );
        display = this.getUniqueTrail().rootNode().getRootedDisplays()[ 0 ];
        display.addInputListener( clickToDismissListener );
      }
      else {
        if ( display && display.hasInputListener( clickToDismissListener ) ) {
          display.removeInputListener( clickToDismissListener );
          display = null;
        }
      }
    } );

    // @private
    this.disposeCarouselComboBox = () => {

      // Deregister observers
      property.unlink( propertyListener );
      multilinks.forEach( multilink => multilink.dispose() );

      // Dispose of subcomponents
      carousel.dispose();
      pageControl.dispose();
      button.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeCarouselComboBox();
    super.dispose();
  }
}

sun.register( 'CarouselComboBox', CarouselComboBox );
export default CarouselComboBox;