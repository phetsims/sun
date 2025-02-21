// Copyright 2021-2025, University of Colorado Boulder

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
import type TProperty from '../../axon/js/TProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import dotRandom from '../../dot/js/dotRandom.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import type Display from '../../scenery/js/display/Display.js';
import type SceneryEvent from '../../scenery/js/input/SceneryEvent.js';
import AlignGroup from '../../scenery/js/layout/constraints/AlignGroup.js';
import AlignBox from '../../scenery/js/layout/nodes/AlignBox.js';
import HBox from '../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../scenery/js/layout/nodes/VBox.js';
import WidthSizable, { type WidthSizableOptions } from '../../scenery/js/layout/WidthSizable.js';
import PressListener from '../../scenery/js/listeners/PressListener.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Color from '../../scenery/js/util/Color.js';
import type TColor from '../../scenery/js/util/TColor.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../tambo/js/TSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import Carousel, { type CarouselOptions } from './Carousel.js';
import { type ComboBoxItem } from './ComboBox.js';
import ComboBoxButton, { type ComboBoxButtonOptions } from './ComboBoxButton.js';
import { getGroupItemNodes } from './GroupItemOptions.js';
import PageControl, { type PageControlOptions } from './PageControl.js';
import sun from './sun.js';

type SelfOptions = {

  // Nested options passed to subcomponents
  itemNodeOptions?: CarouselItemNodeOptions;
  carouselOptions?: CarouselOptions;
  pageControlOptions?: StrictOmit<PageControlOptions, 'orientation'>;
  buttonOptions?: StrictOmit<ComboBoxButtonOptions, 'content' | 'listener'>;

  // Sound generators for when the combo box is opened and closed.
  openedSoundPlayer?: TSoundPlayer;
  closedSoundPlayer?: TSoundPlayer;
};

type ParentOptions = NodeOptions & WidthSizableOptions;
export type CarouselComboBoxOptions = SelfOptions & StrictOmit<ParentOptions, 'children'>;

export default class CarouselComboBox<T> extends WidthSizable( Node ) {

  private readonly disposeCarouselComboBox: () => void;

  /**
   * @param property - the Property that is set when an item is selected
   * @param comboBoxItems - the items that appear in the carousel
   * @param providedOptions
   */
  public constructor( property: TProperty<T>, comboBoxItems: ComboBoxItem<T>[], providedOptions?: CarouselComboBoxOptions ) {

    const options = optionize<CarouselComboBoxOptions, SelfOptions, ParentOptions>()( {

      itemNodeOptions: {
        align: 'left', // {string} alignment of item nodes on backgrounds, 'left'|'center'|'right'
        overColor: Color.grayColor( 245 ), // {ColorDef} background color of the item that the pointer is over
        selectedColor: 'yellow', // {ColorDef} background color of the selected item
        xMargin: 6, // {number} x margin for backgrounds on the items in the carousel
        yMargin: 2 // {number} y margin for backgrounds on the items in the carousel
      },

      carouselOptions: {
        buttonOptions: {
          arrowSize: new Dimension2( 20, 4 )
        },

        // Like ComboBox, 'vertical' is the only orientation supported (verified below).
        orientation: 'vertical',

        // Spacing and margins will be built into the backgrounds that are add to the item Nodes,
        // so set them to zero for the carousel.
        spacing: 0,
        margin: 0,

        // {number} If there are fewer items than this in the carousel, the actual number of items will be used.
        itemsPerPage: 15,
        phetioVisiblePropertyInstrumented: false,
        phetioEnabledPropertyInstrumented: false
      },

      pageControlOptions: {
        interactive: true
      },

      buttonOptions: {
        arrowDirection: 'down', // 'up' is not currently supported (verified below)
        baseColor: 'rgb( 218, 236, 255 )',
        xMargin: 6, // You'll typically want this to be the same as itemNodeOptions.xMargin, but we're not going to force you :)
        yMargin: 4
      },

      // sound generation
      openedSoundPlayer: sharedSoundPlayers.get( 'generalOpen' ),
      closedSoundPlayer: sharedSoundPlayers.get( 'generalClose' ),

      // phet-io
      tandem: Tandem.OPTIONAL
    }, providedOptions );

    // Validate options
    assert && assert( options.carouselOptions.orientation === 'vertical', 'orientation must be vertical' );
    assert && assert( options.buttonOptions.arrowDirection === 'down', 'arrowDirection must be down' );

    // Don't create pages that are longer than the number of items
    options.carouselOptions.itemsPerPage = Math.min( options.carouselOptions.itemsPerPage!, comboBoxItems.length );

    // Create tandems for subcomponents, if they were not provided
    options.carouselOptions.tandem = options.carouselOptions.tandem || options.tandem.createTandem( 'carousel' );
    options.buttonOptions.tandem = options.buttonOptions.tandem || options.tandem.createTandem( 'button' );

    super();

    // Make items in the carousel have the same width and height.
    const alignGroup = new AlignGroup();

    const contentNodes = getGroupItemNodes( comboBoxItems, options.tandem.createTandem( 'items' ) );

    // Create items for the carousel, whose API for 'items' is different than ComboBox.
    const carouselItemNodes = _.map( comboBoxItems,
      ( comboBoxItem, i ) => {
        return { createNode: () => new CarouselItemNode( property, comboBoxItem, contentNodes[ i ], alignGroup, options.itemNodeOptions ) };
      }
    );
    assert && assert( carouselItemNodes.length === comboBoxItems.length, 'expected a carouselItem for each comboBoxItem' );

    const hBoxChildren = [];

    // Create the carousel.
    const carousel = new Carousel( carouselItemNodes, options.carouselOptions );
    hBoxChildren.push( carousel );

    // page control
    let pageControl: PageControl | null = null;
    if ( carousel.numberOfPagesProperty.value > 1 ) {
      pageControl = new PageControl( carousel.pageNumberProperty, carousel.numberOfPagesProperty, combineOptions<PageControlOptions>( {
        orientation: options.carouselOptions.orientation
      }, options.pageControlOptions ) );
      hBoxChildren.push( pageControl );
    }

    // pageControl to the left of carousel
    const carouselAndPageControl = new HBox( {
      spacing: 4,
      children: hBoxChildren
    } );

    // Pressing this button pops the carousel up and down
    const button = new ComboBoxButton( property, comboBoxItems, contentNodes, combineOptions<ComboBoxButtonOptions>( {
      listener: () => {
        carouselAndPageControl.visible = !carouselAndPageControl.visible;
      },
      widthSizable: options.widthSizable,
      localPreferredWidthProperty: this.localPreferredWidthProperty,
      localMinimumWidthProperty: this.localMinimumWidthProperty
    }, options.buttonOptions ) );

    // Put the button above the carousel, left aligned.
    const vBox = new VBox( {
      spacing: 0,
      align: 'left',
      children: [ button, carouselAndPageControl ]
    } );

    // Wrap everything with Node, to hide VBox's API.
    options.children = [ vBox ];

    this.mutate( options );

    // If the Property changes, hide the carousel. unlink is needed on disposed.
    const propertyListener = () => { carouselAndPageControl.visible = false; };
    property.link( propertyListener );

    // Add sound generation for when the carousel is shown and hidden.
    // NOTE: This is much simpler than the sound gen in ComboBox, which plays different sounds based on the selection.
    carouselAndPageControl.visibleProperty.lazyLink( visible => {
      visible ? options.openedSoundPlayer.play() : options.closedSoundPlayer.play();
    } );

    // Clicking outside this UI component will hide the carousel and page control.
    // NOTE: adapted from ComboBox.
    const clickToDismissListener = {
      down: ( event: SceneryEvent ) => {
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
    let display: Display | null = null;
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

    this.disposeCarouselComboBox = () => {

      // Deregister observers
      property.unlink( propertyListener );

      // Dispose of subcomponents
      button.dispose();
      pageControl && pageControl.dispose();
      carousel.dispose();
      contentNodes.forEach( node => node.dispose() );
    };
  }

  public override dispose(): void {
    this.disposeCarouselComboBox();
    super.dispose();
  }
}

type CarouselItemNodeSelfOptions = {
  align?: 'left' | 'right' | 'center'; // alignment of node on background
  xMargin?: number; // x margin for backgrounds on the items in the carousel
  yMargin?: number; // y margin for backgrounds on the items in the carousel
  overColor?: TColor; // background color of the item that the pointer is over
  selectedColor?: TColor; // background color of the selected item
};

type CarouselItemNodeOptions = CarouselItemNodeSelfOptions & StrictOmit<NodeOptions, 'children'>;

/**
 * CarouselItemNode is an item this UI component's carousel. Carousel and ComboBox have different APIs for 'items'.
 * This class adapts a ComboBoxItem by making the Node have uniform dimensions, and putting a background behind the
 * Node. The background changes color when the item is selected or the pointer is over the item.
 */
class CarouselItemNode<T> extends Node {

  private readonly disposeCarouselItemNode: () => void;

  public constructor( property: TProperty<T>, comboBoxItem: ComboBoxItem<T>, node: Node, alignGroup: AlignGroup, providedOptions?: CarouselItemNodeOptions ) {

    const options = optionize<CarouselItemNodeOptions, CarouselItemNodeSelfOptions, NodeOptions>()( {

      // CarouselItemNodeSelfOptions
      align: 'left',
      xMargin: 6,
      yMargin: 2,
      overColor: Color.grayColor( 245 ),
      selectedColor: 'yellow',

      // NodeOptions
      tandem: Tandem.OPTIONAL
    }, providedOptions );

    const uniformNode = new AlignBox( node, {
      xAlign: options.align,
      group: alignGroup
    } );

    const backgroundNode = new Rectangle( 0, 0, 1, 1 );

    // Size backgroundNode to fit uniformNode. Note that uniformNode's bounds may change when additional Nodes are
    // added to alignGroup.
    uniformNode.boundsProperty.link( bounds => {
      backgroundNode.setRectBounds( bounds.dilatedXY( options.xMargin, options.yMargin ) );
    } );

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

    this.disposeCarouselItemNode = () => {
      multilink.dispose();
    };
  }

  public override dispose(): void {
    this.disposeCarouselItemNode();
    super.dispose();
  }
}

sun.register( 'CarouselComboBox', CarouselComboBox );