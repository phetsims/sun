// Copyright 2019, University of Colorado Boulder

/**
 * The button on a combo box box.  Displays the current selection on the button.
 * Typically instantiated by ComboBox, not by client code.
 * 
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const Shape = require( 'KITE/Shape' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const VSeparator = require( 'SUN/VSeparator' );

  // constants
  const ALIGN_VALUES = [ 'left', 'center', 'right' ];
  const ARROW_DIRECTION_VALUES = [ 'up', 'down' ];

  class ComboBoxButton extends RectangularPushButton {

    /**
     * @param {Property} property
     * @param {ComboBoxItem[]} items
     * @param {Object} [options]
     */
    constructor( property, items, options ) {

      options = _.extend( {

        align: 'left', // see ALIGN_VALUES
        arrowHeight: null, // {number|null} if null, will be computed based on max item height
        arrowDirection: 'down', // see ARROW_DIRECTION_VALUES
        arrowFill: 'black',

        // RectangularPushButton options
        cursor: 'pointer',
        baseColor: 'white',
        buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy,
        xMargin: 12,
        yMargin: 6,
        stroke: 'black',
        lineWidth: 1,

        // phet-io
        tandem: Tandem.optional,

        //TODO sun#314 evaluate whether these are still needed now that ComboBoxButton extends RectangularPushButton
        // a11y
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

      // invisible horizontal strut behind item, to make alignment of item easier
      const itemStrut = new HStrut( maxItemWidth );

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
        left: itemStrut.right + ( 2 * options.xMargin ),
        centerY: itemStrut.centerY
      } );

      // Wrapper for the selected item's Node. Do not transform ComboBoxItem.node because it is shared with list!
      const itemNodeWrapper = new Node();

      assert && assert( !options.content, 'ComboBoxButton sets content' );
      options.content = new Node( {
        children: [ itemStrut, itemNodeWrapper, arrow ]
      } );

      super( options );

      // We want the vertical separator between the item and arrow to extend past the margins, for the full height
      // of the button.  So instead of adding the separator as part of the content, we add it as a decoration.
      const separator = new VSeparator( this.height, {
        stroke: 'black',
        lineWidth: options.lineWidth,
        centerX: itemStrut.width + ( 2 * options.xMargin ),
        centerY: this.centerY
      } );
      this.addChild( separator );

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
        itemNodeWrapper.centerY = itemStrut.centerY;
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

      this.labelContent = options.a11yLabel;

      //TODO sun#314 expand on this comment
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

      // @private
      this.disposeComboBoxButton = () => {
        property.unlink( propertyObserver );
      };

      // @private for use via PhET-iO, see https://github.com/phetsims/sun/issues/451
      // This is NOT reset when the Reset All button is pressed.
      this.displayOnlyProperty = new BooleanProperty( false, {
        tandem: options.tandem.createTandem( 'displayOnlyProperty' ),
        phetioDocumentation: 'disables interaction with the ComboBox and makes it appear like value display'
      } );
      this.displayOnlyProperty.link( displayOnly => {
        arrow.visible = !displayOnly;
        separator.visible = !displayOnly;
        this.pickable = !displayOnly;
      } );
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