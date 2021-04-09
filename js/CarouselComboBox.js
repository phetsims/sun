// Copyright 2021, University of Colorado Boulder

/**
 * CarouselComboBox behaves like a combo box, but its listbox is a carousel. This allows you to scroll through a
 * long list of items, a feature that ComboBoxListBox does not support. ComboBoxItem, ComboBoxButton, and
 * Carousel are reused.
 *
 * THINK TWICE BEFORE USING THIS IN A SIM!
 * CarouselComboBox was created as a quick way to address situations where ComboBox's listbox gets too long,
 * for example https://github.com/phetsims/sun/issues/673. This tends to happen in internal 'demo' applications
 * (sun, scenery-phet,... ) that have long lists of demos. And as a design best-practice, PhET tends to avoid
 * longs lists of things in sims. So if you find yourself reaching for CarouselComboBox, consider whether a
 * different UI component might provide a better UX.
 *
 * Possible future work:
 * - Modify ComboBox so that it can use different types of popups (ComboBoxListBox, Carousel,...), or
 * - Make CarouselComboBox pop up the Carousel in front of everything else
 * - a11y support in CarouselComboBox
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../axon/js/Multilink.js';
import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import dotRandom from '../../dot/js/dotRandom.js';
import merge from '../../phet-core/js/merge.js';
import AssertUtils from '../../phetcommon/js/AssertUtils.js';
import PressListener from '../../scenery/js/listeners/PressListener.js';
import AlignBox from '../../scenery/js/nodes/AlignBox.js';
import AlignGroup from '../../scenery/js/nodes/AlignGroup.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import Color from '../../scenery/js/util/Color.js';
import Tandem from '../../tandem/js/Tandem.js';
import Carousel from './Carousel.js';
import ComboBoxButton from './ComboBoxButton.js';
import ComboBoxItem from './ComboBoxItem.js';
import PageControl from './PageControl.js';
import sun from './sun.js';

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

      // Options passed to CarouselItemNode
      itemNodeOptions: {
        align: 'left', // {string} alignment of item nodes on backgrounds, 'left'|'center'|'right'
        overColor: Color.grayColor( 245 ), // {ColorDef} background color of the item that the pointer is over
        selectedColor: 'yellow', // {ColorDef} background color of the selected item
        itemXMargin: 6, // {number} x margin for backgrounds on the items in the carousel
        itemYMargin: 2 // {number} y margin for backgrounds on the items in the carousel
      },

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

    // Make items in the carousel have the same width and height.
    const alignGroup = new AlignGroup();

    // Create items for the carousel, whose API for 'items' is different than ComboBox.
    const carouselItemNodes = _.map( comboBoxItems,
      comboBoxItem => new CarouselItemNode( property, comboBoxItem, alignGroup, options.itemNodeOptions )
    );
    assert && assert( carouselItemNodes.length === comboBoxItems.length, 'expected a carouselItem for each comboBoxItem' );

    const hBoxChildren = [];

    // Create the carousel.
    const carousel = new Carousel( carouselItemNodes, options.carouselOptions );
    hBoxChildren.push( carousel );

    // page control
    let pageControl;
    if ( carousel.numberOfPages > 1 ) {
      pageControl = new PageControl( carousel.numberOfPages, carousel.pageNumberProperty, options.pageControlOptions );
      hBoxChildren.push( pageControl );
    }

    // Page control to the left of carousel
    const carouselAndPageControl = new HBox( {
      spacing: 4,
      children: hBoxChildren
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
          if ( !trail.containsNode( button ) && !trail.containsNode( carousel ) && ( !pageControl || !trail.containsNode( pageControl ) ) ) {
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

      // Dispose of subcomponents
      button.dispose();
      pageControl.dispose();
      carousel.dispose();
      carouselItemNodes.forEach( node => node.dispose() );
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

/**
 * CarouselItemNode is an item this UI component's carousel. Carousel and ComboBox have different APIs for 'items'.
 * This class adapts a ComboBoxItem by making the Node have uniform dimensions, and putting a background behind the
 * Node. The background changes color when the item is selected or the pointer is over the item.
 */
class CarouselItemNode extends Node {

  /**
   * @param {Property.<*>} property
   * @param {ComboBoxItem} comboBoxItem
   * @param {AlignGroup} alignGroup - used to make all item Nodes have uniform dimensions
   * @param {Object} [options]
   */
  constructor( property, comboBoxItem, alignGroup, options ) {

    options = merge( {
      align: 'left', // {string} alignment of node on background, 'left'|'center'|'right'
      xMargin: 6, // {number} x margin for backgrounds on the items in the carousel
      yMargin: 2, // {number} y margin for backgrounds on the items in the carousel
      overColor: Color.grayColor( 245 ), // {ColorDef} background color of the item that the pointer is over
      selectedColor: 'yellow', // {ColorDef} background color of the selected item
      tandem: Tandem.OPTIONAL
    }, options );

    const uniformNode = new AlignBox( comboBoxItem.node, {
      xAlign: options.align,
      group: alignGroup
    } );

    const backgroundNode = new Rectangle( 0, 0, 1, 1 );

    // Size backgroundNode to fit uniformNode. Note that uniformNode's bounds may change when additional Nodes are
    // added to alignGroup.
    uniformNode.boundsProperty.link( bounds => {
      backgroundNode.setRectBounds( bounds.dilatedXY( options.xMargin, options.yMargin ) );
    } );

    assert && assert( !options.children, 'CarouselItemNode sets children' );
    options.children = [ backgroundNode, uniformNode ];

    super( options );

    // Press on an item to select its associated value.
    const pressListener = new PressListener( {
      press: () => {
        property.value = comboBoxItem.value;
      },
      tandem: options.tandem.createTandem( 'pressListener' )
    } );
    this.addInputListener( pressListener );

    // Selecting an item sets its background to the selected color.
    // Pointer over an item sets its background to the highlighted color.
    // Must be disposed because we do not own property.
    const multilink = new Multilink(
      [ property, pressListener.isOverProperty ],
      ( propertyValue, isOver ) => {
        if ( propertyValue === comboBoxItem.value ) {
          backgroundNode.fill = options.selectedColor;
        }
        else if ( isOver ) {
          backgroundNode.fill = options.overColor;
        }
        else {
          backgroundNode.fill = 'transparent';
        }
      } );

    // @private
    this.disposeCarouselItemNode = () => {
      multilink.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeCarouselItemNode();
    super.dispose();
  }
}

sun.register( 'CarouselComboBox', CarouselComboBox );
export default CarouselComboBox;