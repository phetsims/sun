// Copyright 2019-2021, University of Colorado Boulder

/**
 * Node for an item in a combo box list.
 * Responsible for highlighting itself when the pointer is over it.
 * Typically instantiated by ComboBox, not by client code.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Shape from '../../kite/js/Shape.js';
import merge from '../../phet-core/js/merge.js';
import IndexedNodeIO from '../../scenery/js/nodes/IndexedNodeIO.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../tandem/js/Tandem.js';
import ComboBoxItem from './ComboBoxItem.js';
import sun from './sun.js';

class ComboBoxListItemNode extends Node {

  /**
   * @param {ComboBoxItem} item
   * @param {number} highlightWidth
   * @param {number} highlightHeight
   * @param {Object} [options]
   */
  constructor( item, highlightWidth, highlightHeight, options ) {

    assert && assert( item instanceof ComboBoxItem );

    options = merge( {

      cursor: 'pointer',
      align: 'left',
      xMargin: 6, // margin between the item and the highlight edge
      highlightFill: 'rgb( 245, 245, 245 )', // {Color|string} highlight behind the item
      highlightCornerRadius: 4, // {number} corner radius for the highlight

      // pdom
      tagName: 'li',
      focusable: true,
      ariaRole: 'option',

      // the `li` with ariaRole `option` does not get click events on iOS VoiceOver, so position
      // elements so they receive pointer events
      positionInPDOM: true,

      // phet-io
      tandem: Tandem.REQUIRED,

      // Together, these options make it possible to reorder the combo box items in studio, and save a customized
      // simulation with the new order.
      phetioType: IndexedNodeIO,
      phetioState: true,
      visiblePropertyOptions: { phetioFeatured: true }
    }, options );

    // pdom: get innerContent from the item
    assert && assert( options.innerContent === undefined, 'ComboBoxListItemNode sets innerContent' );
    options.innerContent = item.a11yLabel;

    // Highlight that is shown when the pointer is over this item. This is not the a11y focus rectangle.
    const highlightRectangle = new Rectangle( 0, 0, highlightWidth, highlightHeight, {
      cornerRadius: options.highlightCornerRadius
    } );

    // Wrapper for the item's Node. Do not transform item.node because it is shared with ComboBoxButton!
    const itemNodeWrapper = new Node( {
      children: [ item.node ],
      maxWidth: highlightWidth,
      maxHeight: highlightHeight
    } );

    // Assume that item.node may change (as in ComboBoxDisplay) and adjust layout dynamically.
    // See https://github.com/phetsims/scenery-phet/issues/482
    const updateItemLayout = () => {
      if ( options.align === 'left' ) {
        itemNodeWrapper.left = highlightRectangle.left + options.xMargin;
      }
      else if ( options.align === 'right' ) {
        itemNodeWrapper.right = highlightRectangle.right - options.xMargin;
      }
      else {
        itemNodeWrapper.centerX = highlightRectangle.centerX;
      }
      itemNodeWrapper.centerY = highlightRectangle.centerY;
    };
    itemNodeWrapper.boundsProperty.lazyLink( updateItemLayout );
    updateItemLayout();

    assert && assert( !options.children, 'ComboBoxListItemNode sets children' );
    options.children = [ highlightRectangle, itemNodeWrapper ];

    super( options );

    // @public (read-only)
    this.item = item;

    // pdom focus highlight is fitted to this Node's bounds, so that it doesn't overlap other items in the list box
    this.focusHighlight = Shape.bounds( this.localBounds );

    // Show highlight when pointer is over this item.
    // Change fill instead of visibility so that we don't end up with vertical pointer gaps in the list
    this.addInputListener( {
      enter() { highlightRectangle.fill = options.highlightFill; },
      exit() { highlightRectangle.fill = null; }
    } );
  }
}

sun.register( 'ComboBoxListItemNode', ComboBoxListItemNode );
export default ComboBoxListItemNode;