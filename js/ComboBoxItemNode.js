// Copyright 2019, University of Colorado Boulder

/**
 * Node for an item in a combo box. Typically instantiated by ComboBox, not by client code. This was originally
 * an inner class of ComboBox, but was promoted to its own source file when it grew more complex due to
 * PhET-iO and a11y instrumentation.
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

  class ComboBoxItemNode extends Rectangle {

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
        align: 'left',
        xMargin: 6,

        // phet-io
        tandem: Tandem.optional,

        // a11y
        tagName: 'li',
        ariaRole: 'option'
      }, options );

      // Holds our item.node, and positions it in the correct location. We don't want to mutate the item's node itself.
      const itemWrapper = new Node( {
        children: [ item.node ],
        pickable: false,
        centerY: height / 2
      } );
      if ( options.align === 'left' ) {
        itemWrapper.left = options.xMargin;
      }
      else if ( options.align === 'right' ) {
        itemWrapper.right = width - options.xMargin;
      }
      else {
        // center
        itemWrapper.centerX = width / 2;
      }

      assert && assert( !options.children, 'ComboBoxItemNode sets children' );
      options.children = [ itemWrapper ];

      super( 0, 0, width, height, options );

      //TODO #314 this should be @public (read-only)
      // @public - to keep track of it
      this.a11yLabel = null;

      // Only set if defined, since it is an option, see ComboBox.createItem
      if ( item.a11yLabel ) {
        this.a11yLabel = item.a11yLabel;
        this.innerContent = item.a11yLabel; //TODO #314 is this correct? if so, document why.
      }

      //TODO #314 this is marked private, but is assigned above, it should be set via options or a setter method
      // @private {null|function} - listener called when button clicked with AT
      this.a11yClickListener = null;

      // @public (read-only)
      this.item = item;

      // @private
      this.itemWrapper = itemWrapper;

      // the highlight wraps around the entire item rectangle
      this.itemWrapper.focusHighlight = Shape.bounds( this.itemWrapper.parentToLocalBounds( this.localBounds ) );
    }

    //TODO sun#314 doc/rename to toggleVisibility
    /**
     * @param {boolean} visible
     */
    a11yShowItem( visible ) {
      this.itemWrapper.tagName = visible ? 'button' : null;
      this.tagName = visible ? 'li' : null;
    }

    //TODO #314 ComboBoxItemNode instances are now shared between the list and button. How does that affect focus? Should focus be set on the ComboBoxItemNode's wrapper in the list?
    /**
     * Focus the item in the list
     * @public
     */
    a11yFocusButton() {
      this.focusable = true;
      this.focus();
    }

    /**
     * Disposes the item.
     * @public
     * @override
     */
    dispose() {

      // the item in the button will not have a listener
      this.a11yClickListener && this.removeInputListener( this.a11yClickListener );
      this.itemWrapper.dispose();
      super.dispose();
    }
  }

  return sun.register( 'ComboBoxItemNode', ComboBoxItemNode );
} ); 