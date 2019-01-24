// Copyright 2019, University of Colorado Boulder

/**
 * Node for an item in a combo box list.
 * Responsible for highlighting itself when the pointer is over it.
 * Typically instantiated by ComboBox, not by client code.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  class ComboBoxListItemNode extends Node {

    /**
     * @param {ComboBoxItem} item
     * @param {number} highlightWidth
     * @param {number} highlightHeight
     * @param {Object} [options]
     */
    constructor( item, highlightWidth, highlightHeight, options ) {

      assert && assert( item instanceof ComboBoxItem );

      options = _.extend( {

        cursor: 'pointer',
        align: 'left',
        xMargin: 6, // margin between the item and the highlight edge
        highlightFill: 'rgb( 245, 245, 245 )', // {Color|string} highlight behind the item
        highlightCornerRadius: 4, // {number} corner radius for the highlight

        // phet-io
        tandem: Tandem.required,

        // a11y
        tagName: 'li',
        focusable: true,
        ariaRole: 'option'

      }, options );

      // a11y: get innerContent from the item
      assert && assert( options.innerContent === undefined, 'ComboBoxListItemNode sets innerContent' );
      options.innerContent = item.a11yLabel;

      // Highlight that is shown when the pointer is over this item. This is not the a11y focus rectangle.
      const highlightRectangle = new Rectangle( 0, 0, highlightWidth, highlightHeight, {
        cornerRadius: options.highlightCornerRadius
      } );

      // Wrapper for the item's Node. Do not transform item.node because it is shared with ComboBoxButton!
      const itemNodeWrapper = new Node( {
        children: [ item.node ],
        centerY: highlightHeight / 2
      } );
      if ( options.align === 'left' ) {
        itemNodeWrapper.left = highlightRectangle.left + options.xMargin;
      }
      else if ( options.align === 'right' ) {
        itemNodeWrapper.right = highlightRectangle.right - options.xMargin;
      }
      else {
        itemNodeWrapper.centerX = highlightRectangle.centerX;
      }

      assert && assert( !options.children, 'ComboBoxListItemNode sets children' );
      options.children = [ highlightRectangle, itemNodeWrapper ];

      super( options );

      // @public (read-only)
      this.item = item;

      // a11y focus highlight is fitted to this Node's bounds, so that it doesn't overlap other items in the list box
      this.focusHighlight = Shape.bounds( this.localBounds );

      // Show highlight when pointer is over this item.
      // Change fill instead of visibility so that we don't end up with vertical pointer gaps in the list
      this.addInputListener( {
        enter() { highlightRectangle.fill = options.highlightFill; },

        exit() { highlightRectangle.fill = null; }
      } );
    }
  }

  return sun.register( 'ComboBoxListItemNode', ComboBoxListItemNode );
} ); 