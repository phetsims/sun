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

      // TODO sun#314 assert you may not be allowed to have accessibleContent on the item.node, since we set the innerContent on this LI

      options = _.extend( {

        cursor: 'pointer',
        align: 'left',
        xMargin: 6,
        highlightFill: 'rgb( 245, 245, 245 )',

        // phet-io
        tandem: Tandem.required,

        // a11y
        tagName: 'li',
        focusable: true,
        ariaRole: 'option',
        a11yLabel: null

      }, options );

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

      //TODO #314 why do we need to do this? isn't this handled by super(options) ?
      // Only set if defined, since it is an option, see ComboBoxItem
      if ( options.a11yLabel ) {
        this.a11yLabel = options.a11yLabel;
        this.innerContent = options.a11yLabel;
      }

      // @public (read-only)
      this.item = item;

      // @private
      this.highlightRectangle = highlightRectangle;
      this.highlightFill = options.highlightFill;

      // the focus highlight wraps around the entire item rectangle
      itemNodeWrapper.focusHighlight = Shape.bounds( itemNodeWrapper.parentToLocalBounds( this.localBounds ) );
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