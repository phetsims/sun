// Copyright 2013, University of Colorado

/**
 * Collapsible box that hides/shows contents when closed/open.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Imports
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var CONTROL_BUTTON_INSET = 4; // Can make this an option if desired.
  var DEFAULT_CONTROL_BUTTON_DIMENSION = 20; // Can make this an option if desired.
  var CONTENT_INSET = 5; // Can make this an option if desired.

  /**
   * @param {Node} contentNode that will be vertically centered to the right of the button
   * @param {object} options
   * @constructor
   */
  function AccordionBox( contentNode, options ) {

    options = _.extend( { // defaults
                          stroke: 'black', // color used to stroke the outer edge of the button
                          lineWidth: 1,
                          fill: 'rgb( 238, 238, 238 )', // default background color
                          font: "20px Tahoma"
                        }, options );

    var thisNode = this;
    Node.call( this, options );

    if ( options.openNode === undefined ) {
      options.openNode = new Rectangle( CONTROL_BUTTON_INSET,
                                        CONTROL_BUTTON_INSET,
                                        DEFAULT_CONTROL_BUTTON_DIMENSION,
                                        DEFAULT_CONTROL_BUTTON_DIMENSION,
                                        3,
                                        3,
                                        {stroke: 'black', lineWidth: 1, fill: 'green'} );
    }
    if ( options.closeNode === undefined ) {
      options.closeNode = new Rectangle( CONTROL_BUTTON_INSET,
                                         CONTROL_BUTTON_INSET,
                                         DEFAULT_CONTROL_BUTTON_DIMENSION,
                                         DEFAULT_CONTROL_BUTTON_DIMENSION,
                                         3,
                                         3,
                                         {stroke: 'black', lineWidth: 1, fill: 'red'} );
    }

    var panelWidth = contentNode.width + 2 * CONTENT_INSET;
    var closedHeight = CONTROL_BUTTON_INSET * 2 + options.closeNode.height;
    var openHeight = CONTROL_BUTTON_INSET * 2 + options.closeNode.width + 2 * CONTENT_INSET + contentNode.height;

//    var box = new Rectangle( 0, 0, panelWidth, openHeight, 4, 4 );
    var container = new Rectangle( 0, 0, panelWidth, openHeight, 3, 3,
                                   {
                                     stroke: options.stroke,
                                     lineWidth: options.lineWidth,
                                     fill: options.fill
                                   } );
    container.addChild( options.openNode );
    contentNode.center = new Vector2( panelWidth / 2, openHeight - CONTENT_INSET - contentNode.height / 2 );
    container.addChild( contentNode );
    this.addChild( container );
  }

  inherit( Node, AccordionBox );

  return AccordionBox;
} );