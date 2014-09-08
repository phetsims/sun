// Copyright 2002-2013, University of Colorado Boulder

/**
 * Scenery-based combo box. Composed of a button and a list of items.
 * The list of items is displayed when the button is pressed, and dismissed an item is selected
 * or the user clicks outside the list.  The list can be displayed either above or below the button.
 * <p>
 * An item in the combo box had 2 properties: {Node} node, {*} value.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * The button that is clicked to show the list of items.
   * @param {Node} itemNode
   * @param {Object} options object with optional properties
   * @constructor
   */
  function ButtonNode( itemNode, options ) {
    var thisNode = this;
    Node.call( this );

    // up or down arrow
    var arrow = new Path( null, { fill: 'black' } );
    var arrowWidth = 0.5 * itemNode.height;
    var arrowHeight = arrowWidth * Math.sqrt( 3 ) / 2; // height of equilateral triangle
    if ( options.listPosition === 'above' ) {
      arrow.shape = new Shape().moveTo( 0, arrowHeight ).lineTo( arrowWidth / 2, 0 ).lineTo( arrowWidth, arrowHeight ).close(); // up arrow
    }
    else {
      arrow.shape = new Shape().moveTo( 0, 0 ).lineTo( arrowWidth, 0 ).lineTo( arrowWidth / 2, arrowHeight ).close(); // down arrow
    }

    // button background
    var width = itemNode.width + ( 4 * options.buttonXMargin ) + arrow.width;
    var height = itemNode.height + ( 2 * options.buttonYMargin );
    var background = new Rectangle( 0, 0, width, height, options.buttonCornerRadius, options.buttonCornerRadius,
      { fill: options.buttonFill, stroke: options.buttonStroke, lineWidth: options.buttonLineWidth } );

    // vertical separator to left of arrow
    var separator = new Line( 0, 0, 0, height, { stroke: 'black', lineWidth: options.buttonLineWidth } );

    // itemNode's parent
    var itemNodeParent = new Node();

    // rendering order
    thisNode.addChild( background );
    thisNode.addChild( arrow );
    thisNode.addChild( separator );
    thisNode.addChild( itemNodeParent );

    thisNode.setItemNode = function( itemNode ) {
      itemNodeParent.removeAllChildren();
      itemNodeParent.addChild( itemNode );
      itemNode.left = options.buttonXMargin;
      itemNode.top = options.buttonYMargin;
    };
    thisNode.setItemNode( itemNode );

    // layout
    separator.left = itemNode.right + options.buttonXMargin;
    separator.top = background.top;
    arrow.left = separator.right + options.buttonXMargin;
    arrow.centerY = background.centerY;
  }

  inherit( Node, ButtonNode );

  /**
   * A wrapper around the combo box item, adds margins, etc.
   * @param item
   * @param {Number} width
   * @param {Number} height
   * @param {Number} xMargin
   * @constructor
   */
  function ItemNode( item, width, height, xMargin ) {
    var thisNode = this;
    Rectangle.call( this, 0, 0, width, height );
    this.item = item;
    thisNode.addChild( item.node );
    item.node.pickable = false; // hits will occur on the rectangle
    item.node.x = xMargin;
    item.node.centerY = height / 2;
  }

  inherit( Rectangle, ItemNode );

  /**
   * @param {Array} items
   * @param {*} property
   * @param {Node} listParent node that will be used as the list's parent, use this to ensuring that the list is in front of everything else
   * @param {Object} options object with optional properties
   */
  function ComboBox( items, property, listParent, options ) {

    var thisNode = this;

    options = _.extend( {
        labelNode: null, // optional label, placed to the left of the combo box
        labelXSpacing: 10, // horizontal space between label and combo box
        // button
        buttonFill: 'white',
        buttonStroke: 'black',
        buttonLineWidth: 1,
        buttonCornerRadius: 8,
        buttonXMargin: 10,
        buttonYMargin: 4,
        // list
        listPosition: 'below', // where the list is positioned relative to the button, either 'below' or 'above'
        listYMargin: 4,
        listFill: 'white',
        listStroke: 'black',
        listLineWidth: 1,
        listCornerRadius: 5,
        // items
        itemXMargin: 6,
        itemYMargin: 6,
        itemHighlightFill: 'rgb(245,245,245)',
        itemHighlightStroke: null,
        itemHighlightLineWidth: 1
      },
      options );

    Node.call( thisNode );

    // optional label
    if ( options.labelNode !== null ) {
      thisNode.addChild( options.labelNode );
    }

    // determine uniform dimensions for button and list items
    var itemWidth = 0, itemHeight = 0;
    for ( var i = 0; i < items.length; i++ ) {
      var item = items[i];
      if ( item.node.width > itemWidth ) { itemWidth = item.node.width; }
      if ( item.node.height > itemHeight ) { itemHeight = item.node.height; }
    }
    itemWidth += ( 2 * options.itemXMargin );
    itemHeight += ( 2 * options.itemYMargin );

    // button, will be set to correct value when property observer is registered
    var buttonNode = new ButtonNode( new ItemNode( items[0], itemWidth, itemHeight, options.itemXMargin ), options );
    thisNode.addChild( buttonNode );

    // list
    var listWidth = itemWidth + ( 2 * options.buttonXMargin );
    var listHeight = ( items.length * itemHeight ) + ( 2 * options.listYMargin );
    var listNode = new Rectangle( 0, 0, listWidth, listHeight, options.listCornerRadius, options.listCornerRadius,
      { fill: options.listFill, stroke: options.listStroke, lineWidth: options.listLineWidth, visible: false } );
    listParent.addChild( listNode );

    //TODO move these to ItemNode
    // how to highlight an item in the list
    var highlightItem = function( itemNode ) {
      itemNode.fill = options.itemHighlightFill;
      itemNode.stroke = options.itemHighlightStroke;
    };
    var unhighlightItem = function( itemNode ) {
      itemNode.fill = null;
      itemNode.stroke = null;
    };

    // listener that we'll attach to each item in the list
    var itemListener = {
      enter: function( event ) {
        highlightItem( event.currentTarget );
      },
      exit: function( event ) {
        unhighlightItem( event.currentTarget );
      },
      down: function( event ) {
        event.abort(); // prevent click-to-dismiss on the list
      },
      up: function( event ) {
        unhighlightItem( event.currentTarget );
        listNode.visible = false; // close the list, do this before changing property value, in case it's expensive
        thisNode.getUniqueTrail().rootNode().removeInputListener( clickToDismissListener ); // remove the click-to-dismiss listener
        event.abort(); // prevent nodes (eg, controls) behind the list from receiving the event
        property.value = event.currentTarget.item.value; // set the property
      }
    };

    // populate list with items
    for ( var j = 0; j < items.length; j++ ) {
      // add item to list
      var itemNode = new ItemNode( items[j], itemWidth, itemHeight, options.itemXMargin );
      listNode.addChild( itemNode );
      itemNode.left = options.buttonXMargin;
      itemNode.top = options.listYMargin + ( j * itemHeight );

      // item interactivity
      itemNode.cursor = 'pointer';
      itemNode.addInputListener( itemListener );
    }

    //TODO handle scale and rotation
    // Handles the coordinate transform required to make the list pop up near the button.
    var moveList = function() {
      var pButtonGlobal, pButtonLocal;
      if ( options.listPosition === 'above' ) {
        pButtonGlobal = thisNode.localToGlobalPoint( new Vector2( buttonNode.left, buttonNode.top ) );
        pButtonLocal = listParent.globalToLocalPoint( pButtonGlobal );
        listNode.left = pButtonLocal.x;
        listNode.bottom = pButtonLocal.y;
      }
      else {
        pButtonGlobal = thisNode.localToGlobalPoint( new Vector2( buttonNode.left, buttonNode.bottom ) );
        pButtonLocal = listParent.globalToLocalPoint( pButtonGlobal );
        listNode.left = pButtonLocal.x;
        listNode.top = pButtonLocal.y;
      }
    };

    /**
     * Because clickToDismissListener is added to the scene, it receives the 'down' event that
     * buttonNode received to register the listener. This is because scenery propagates events
     * up the event trail, and the scene is further up the trail than the button.  This flag
     * is used to ignore the first 'down' event, which is the one that the button received.
     * If we don't do this, then we never see the list because it is immediately popped down.
     * This behavior is may change, and is being discussed in scenery#58.
     */
    var enableClickToDismissListener;
    var sceneNode; // store the node that clickToDismissListener is added to, because the scene may change, see sun#14

    // listener for 'click outside to dismiss'
    var clickToDismissListener = {
      down: function() {
        if ( enableClickToDismissListener ) {
          sceneNode.removeInputListener( clickToDismissListener );
          listNode.visible = false;
        }
        else {
          enableClickToDismissListener = true;
        }
      }
    };

    // button interactivity
    buttonNode.cursor = 'pointer';
    buttonNode.addInputListener(
      {
        down: function() {
          if ( !listNode.visible ) {
            moveList();
            listNode.visible = true;
            enableClickToDismissListener = false;
            sceneNode = thisNode.getUniqueTrail().rootNode();
            sceneNode.addInputListener( clickToDismissListener );
          }
        }
      } );

    // layout
    if ( options.labelNode ) {
      buttonNode.left = options.labelNode.right + options.labelXSpacing;
      buttonNode.centerY = options.labelNode.centerY;
    }

    // when property changes, update button
    property.link( function( value ) {
      // TODO brute force search, better way?
      var item = null;
      for ( var i = 0; i < items.length; i++ ) {
        if ( items[i].value === value ) {
          item = items[i];
        }
      }
      assert && assert( item !== null );
      buttonNode.setItemNode( new ItemNode( item, itemWidth, itemHeight, options.itemXMargin ) );
    } );

    this.mutate( options );
  }

  inherit( Node, ComboBox );

  /**
   * Creates a combo box item.
   * This exists primarily to document the structure of an item.
   * @param {Node} node
   * @param {*} value
   * @returns {{node: *, value: *}}
   */
  ComboBox.createItem = function( node, value ) {
    return { node: node, value: value };
  };

  return ComboBox;
} );
