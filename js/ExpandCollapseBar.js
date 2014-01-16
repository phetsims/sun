// Copyright 2002-2014, University of Colorado Boulder

/**
 * Horizontal bar placed above something that can be expanded/collapsed.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var ExpandCollapseButton = require( 'SUN/ExpandCollapseButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {Node} titleNode
   * @param {Property<Boolean>} expandedProperty
   * @param {*} options
   * @constructor
   */
  function ExpandCollapseBar( titleNode, expandedProperty, options ) {

    options = _.extend( {
      buttonLength: 15,
      minWidth: 1, // minimum width of the bar
      minHeight: 1, // minimum height of the bar
      cornerRadius: 6,
      xMargin: 10,
      yMargin: 8,
      xSpacing: 10,
      barFill: 'white',
      barStroke: 'black',
      barLineWidth: 1
    }, options );

    var thisNode = this;
    Node.call( thisNode );

    // expand/collapse button
    var button = new ExpandCollapseButton( options.buttonLength, expandedProperty );
    button.touchArea = Shape.bounds( button.localBounds.dilatedXY( 10, 10 ) );

    // bar
    var barWidth = Math.max( options.minWidth, titleNode.width + button.width + options.xSpacing + ( 2 * options.xMargin ) );
    var barHeight = Math.max( options.minHeight, Math.max( titleNode.height, button.height ) + ( 2 * options.yMargin ) );
    var barNode = new Rectangle( 0, 0, barWidth, barHeight, options.cornerRadius, options.cornerRadius, {
      fill: options.barFill,
      stroke: options.barStroke,
      lineWidth: options.barLineWidth
    } );

    // rendering order
    thisNode.addChild( barNode );
    thisNode.addChild( titleNode );
    thisNode.addChild( button );

    // layout
    titleNode.left = barNode.left + options.xMargin;
    titleNode.centerY = barNode.centerY;
    button.right = barNode.right - options.xMargin;
    button.centerY = barNode.centerY;
  }

  return inherit( Node, ExpandCollapseBar );
} );
