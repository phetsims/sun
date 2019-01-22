// Copyright 2019, University of Colorado Boulder

/**
 * Node for an item in a combo box list.  Can be highlighted by calling setHighlightVisible.
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
     * @param {number} width
     * @param {number} height
     * @param {Object} [options]
     */
    constructor( item, width, height, options ) {

      assert && assert( item instanceof ComboBoxItem );

      options = _.extend( {

        cursor: 'pointer',
        align: 'left',
        xMargin: 6,
        highlightFill: 'rgb( 245, 245, 245 )', // {Color|string}

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

      // Highlight rectangle
      const highlightRectangle = new Rectangle( 0, 0, width, height );

      // Wrapper for the item's Node. Do not transform ComboBoxItem.node because it is shared with ComboBoxButton!
      const itemNodeWrapper = new Node( {
        children: [ item.node ],
        centerY: height / 2
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

      // @private
      this.highlightRectangle = highlightRectangle;
      this.highlightFill = options.highlightFill;

      // focus highlight is fitted to this Node's bounds, so that it doesn't overlap items above/below in the list box
      this.focusHighlight = Shape.bounds( this.localBounds );
    }

    /**
     * Sets visibility of the highlight that appear's behind the item's node. (This is not the a11y focus highlight.)
     * @param {boolean} visible
     * @public
     */
    setHighlightVisible( visible ) {

      // Change fill instead of visibility so that we don't end up with vertical pointer gaps in the list
      this.highlightRectangle.fill = visible ? this.highlightFill : null;
    }
  }

  return sun.register( 'ComboBoxListItemNode', ComboBoxListItemNode );
} ); 