// Copyright 2019, University of Colorado Boulder

//TODO sun#430 extend RectangularPushButton
/**
 * The button on a combo box box.  Displays the current selection on the button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  // constants
  const ALIGN_VALUES = [ 'left', 'center', 'right' ];
  const ARROW_DIRECTION_VALUES = [ 'up', 'down' ];

  class ComboBoxButton extends Node {

    /**
     * @param {Property} property
     * @param {ComboBoxItem[]} items
     * @param {Object} [options]
     */
    constructor( property, items, options ) {

      options = _.extend( {

        cursor: 'pointer',
        align: 'left', // see ALIGN_VALUES
        arrowHeight: null, // {number|null} if null, will be computed based on max item height
        arrowDirection: 'down', // see ARROW_DIRECTION_VALUES
        arrowFill: 'black',
        xMargin: 10, // margin on the left and right of the item
        yMargin: 10, // margin on the top and bottom of the item
        fill: 'white',
        stroke: 'black',
        lineWidth: 1,
        cornerRadius: 8,

        // phet-io
        tandem: Tandem.optional,

        // a11y
        tagName: 'button',
        labelTagName: 'span',
        containerTagName: 'div',
        a11yLabel: null

      }, options );

      assert && assert( ALIGN_VALUES.includes( options.align ),
             'invalid align: ' + options.align );
      assert && assert( ARROW_DIRECTION_VALUES.includes( options.arrowDirection ),
        'invalid arrowDirection: ' + options.arrowDirection );

      // Compute max item size
      const maxItemWidth = _.maxBy( items, item => item.node.width ).node.width;
      const maxItemHeight = _.maxBy( items, item => item.node.height ).node.height;

      // Compute arrow size
      const arrowHeight = options.arrowHeight || ( 0.7 * maxItemHeight ); // height of equilateral triangle
      const arrowWidth = 2 * arrowHeight * Math.sqrt( 3 ) / 3; // side of equilateral triangle

      // button background, behind the item and the arrow
      const backgroundWidth = maxItemWidth + ( 4 * options.xMargin ) + arrowWidth;
      const backgroundHeight = maxItemHeight + ( 2 * options.yMargin);
      const background = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, {
        cornerRadius: options.cornerRadius,
        fill: options.fill,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );

      // invisible horizontal strut behind item, to make alignment of item easier
      const itemStrut = new HStrut( maxItemWidth, {
        left: options.xMargin,
        centerY: background.centerY
      } );

      // vertical separator between item and arrow
      const separator = new Line( 0, 0, 0, backgroundHeight, {
        stroke: 'black',
        lineWidth: options.lineWidth,
        centerX: itemStrut.right + options.xMargin,
        centerY: background.centerY
      } );

      // arrow that points up or down, to indicate which way the list pops up
      let arrowShape = null;
      if ( options.arrowDirection === 'up' ) {
        arrowShape = new Shape()
          .moveTo( 0, arrowHeight )
          .lineTo( arrowWidth / 2, 0 )
          .lineTo( arrowWidth, arrowHeight )
          .close();
      }
      else {
        arrowShape = new Shape()
          .moveTo( 0, 0 )
          .lineTo( arrowWidth, 0 )
          .lineTo( arrowWidth / 2, arrowHeight )
          .close();
      }
      const arrow = new Path( arrowShape, {
        fill: options.arrowFill,
        left: separator.centerX + options.xMargin,
        centerY: background.centerY
      } );

      // Wrapper for the selected item's Node. Do not transform ComboBoxItem.node because it is shared with list!
      const itemNodeWrapper = new Node();

      assert && assert( !options.children, 'ComboBoxButton sets children' );
      options.children = [ background, itemStrut, itemNodeWrapper, separator, arrow ];
      super( options );

      // When property's value changes, show the corresponding item's Node on the button.
      const propertyObserver = value => {

        // remove the node for the previous item
        itemNodeWrapper.removeAllChildren();

        // find and add the node for the new item
        let node = null;
        for ( var i = 0; i < items.length && !node; i++ ) {
          if ( items[ i ].value === value ) {
            node = items[ i ].node;
          }
        }
        assert && assert( node, 'no item found for value: ' + value );
        itemNodeWrapper.addChild( node );

        // adjust alignment
        itemNodeWrapper.centerY = background.centerY;
        if ( options.align === 'left' ) {
          itemNodeWrapper.left = itemStrut.left;
        }
        else if ( options.align === 'right' ) {
          itemNodeWrapper.right = itemStrut.right;
        }
        else {
          itemNodeWrapper.centerX = itemStrut.centerX;
        }
      };
      property.link( propertyObserver );

      //TODO #314 missing visibility annotation
      this.labelContent = options.a11yLabel;

      //TODO #314 missing visibility annotation
      // the button is labelledby its own label, and then (second) by itself. Order matters!
      assert && assert( !options.ariaLabelledbyAssociations, 'ComboBoxButton sets ariaLabelledbyAssociations' );
      this.ariaLabelledbyAssociations = [
        {
          otherNode: this,
          otherElementName: AccessiblePeer.LABEL_SIBLING,
          thisElementName: AccessiblePeer.PRIMARY_SIBLING
        },
        {
          otherNode: this,
          otherElementName: AccessiblePeer.PRIMARY_SIBLING,
          thisElementName: AccessiblePeer.PRIMARY_SIBLING
        }
      ];

      // signify to AT that this button opens a menu
      this.setAccessibleAttribute( 'aria-haspopup', 'listbox' );

      //TODO #314 this should be private, set via options or a setter methods
      // @public - if assigned, it will be removed on disposal.
      this.a11yListener = null;

      // @private
      this.disposeComboBoxButton = () => {
        property.unlink( propertyObserver );
        this.a11yListener && this.removeInputListener( this.a11yListener );
      };
    }

    /**
     * @public
     * @override
     */
    dispose() {
      this.disposeComboBoxButton();
      super.dispose();
    }
  }

  return sun.register( 'ComboBoxButton', ComboBoxButton );
} );