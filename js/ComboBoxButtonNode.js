// Copyright 2019, University of Colorado Boulder

//TODO sun#430 this should extend RectangularPushButton
/**
 * The button on a combo box box. This was originally an inner class of ComboBox (ComboBox.ButtonNode),
 * but was promoted to its own source file when it grew more complex due to PhET-iO and a11y instrumentation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  // constants
  const ARROW_DIRECTION_VALUES = [ 'up', 'down' ];

  //TODO sun#422 use nested options for ComboBoxButtonNode
  const DEFAULT_OPTIONS = {

    // used by ComboBox and ComboBoxButtonNode
    arrowDirection: 'down', // {string} direction that the arrow points

    // used exclusively by ComboBoxButtonNode
    buttonFill: 'white',
    buttonStroke: 'black',
    buttonLineWidth: 1,
    buttonCornerRadius: 8,
    buttonXMargin: 10,
    buttonYMargin: 4,

    // a11y - used exclusively by ComboBoxButtonNode
    a11yButtonLabel: '' // {string} accessible label for the button that opens this combobox
  };

  class ComboBoxButtonNode extends Node {

    /**
     * @param {Node} itemNode
     * @param {Object} [options]
     */
    constructor( itemNode, options ) {

      options = _.extend( {}, DEFAULT_OPTIONS, {

        // phet-io
        tandem: Tandem.optional, // ComboBoxButtonNode is not currently instrumented

        // a11y
        tagName: 'button',
        labelTagName: 'span',
        containerTagName: 'div'

      }, options );

      assert && assert( ARROW_DIRECTION_VALUES.includes( options.arrowDirection ),
        'invalid arrowDirection: ' + options.arrowDirection );

      super();

      // @private
      this.buttonXMargin = options.buttonXMargin;
      this.buttonYMargin = options.buttonYMargin;

      //TODO #314 missing visibility annotation
      this.labelContent = options.a11yButtonLabel;

      //TODO #314 missing visibility annotation
      // the button is labelledby its own label, and then (second) by itself. Order matters!
      assert && assert( !options.ariaLabelledbyAssociations, 'ComboBoxButtonNode sets ariaLabelledbyAssociations' );
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

      //TODO #314 this should be private, and its value should be passed set via options or a setter methods
      // @public - if assigned, it will be removed on disposal.
      this.a11yListener = null;

      // up or down arrow
      const arrow = new Path( null, {
        fill: 'black'
      } );
      const arrowWidth = 0.5 * itemNode.height;
      const arrowHeight = arrowWidth * Math.sqrt( 3 ) / 2; // height of equilateral triangle
      if ( options.arrowDirection === 'up' ) {
        arrow.shape = new Shape().moveTo( 0, arrowHeight ).lineTo( arrowWidth / 2, 0 ).lineTo( arrowWidth, arrowHeight ).close(); // up arrow
      }
      else {
        arrow.shape = new Shape().moveTo( 0, 0 ).lineTo( arrowWidth, 0 ).lineTo( arrowWidth / 2, arrowHeight ).close(); // down arrow
      }

      // button background
      const backgroundWidth = itemNode.width + ( 4 * this.buttonXMargin ) + arrow.width;
      const backgroundHeight = itemNode.height + ( 2 * this.buttonYMargin );

      // @private
      this.background = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, {
        cornerRadius: options.buttonCornerRadius,
        fill: options.buttonFill,
        stroke: options.buttonStroke,
        lineWidth: options.buttonLineWidth
      } );

      // vertical separator to left of arrow
      const separator = new Line( 0, 0, 0, backgroundHeight, {
        stroke: 'black',
        lineWidth: options.buttonLineWidth
      } );

      // @private parent for the selected ComboBoxItemNode
      this.itemNodeParent = new Node();

      // rendering order
      this.addChild( this.background );
      this.addChild( arrow );
      this.addChild( separator );
      this.addChild( this.itemNodeParent );

      this.setItemNode( itemNode );

      // layout
      separator.left = this.itemNodeParent.right + this.buttonXMargin;
      separator.top = this.background.top;
      arrow.left = separator.right + this.buttonXMargin;
      arrow.centerY = this.background.centerY;

      // @private
      this.disposeComboBoxButtonNode = () => {
        this.a11yListener && this.removeInputListener( this.a11yListener );
      };

      this.mutate( options );
    }

    /**
     * Sets the item that is displayed on the button.
     * @param {ComboBoxItemNode} itemNode
     */
    setItemNode( itemNode ){

      // Remove the previous itemNode
      assert && assert( this.itemNodeParent.getChildrenCount() <= 1,
        'itemNodeParent should never have more than 1 child' );
      this.itemNodeParent.removeAllChildren();

      // Add the new itemNode and adjust layout. Do not transform itemNode, because it's shared with the list.
      this.itemNodeParent.addChild( itemNode );
      this.itemNodeParent.left = this.background.left + this.buttonXMargin;
      this.itemNodeParent.top = this.background.top + this.buttonYMargin;

      // TODO sun#314 is there a better way to do this?
      itemNode.a11yShowItem( false );

      // Only set if defined, since it is an option, see ComboBox.createItem
      if ( itemNode.a11yLabel ) {
        this.innerContent = itemNode.a11yLabel;
      }
    }

    /**
     * @public
     * @override
     */
    dispose() {
      this.disposeComboBoxButtonNode();
      super.dispose();
    }
  }

  //TODO sun#430 make this go away, use nested options.buttonOptions in ComboBox?
  ComboBoxButtonNode.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

  return sun.register( 'ComboBoxButtonNode', ComboBoxButtonNode );
} );