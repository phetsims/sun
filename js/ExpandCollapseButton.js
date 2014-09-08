// Copyright 2002-2013, University of Colorado Boulder

//TODO reimplement as a subtype of something from sun.buttons
/**
 * Button for expanding/collapsing something.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {Property<Boolean>} expandedProperty
   * @param {Object} options
   * @constructor
   */
  function ExpandCollapseButton( expandedProperty, options ) {

    options = _.extend( {
      sideLength: 25  // length of one side of the square button
    }, options );

    var thisButton = this;
    Node.call( thisButton );

    // configure the button shape
    var cornerRadius = 0.1 * options.sideLength;
    var buttonShape = Shape.roundRectangle( 0, 0, options.sideLength, options.sideLength, cornerRadius, cornerRadius );

    // configure the +/- symbol on the button
    var symbolLength = 0.6 * options.sideLength;
    var symbolLineWidth = 0.15 * options.sideLength;
    var symbolOptions = {
      lineWidth: symbolLineWidth,
      stroke: 'white',
      centerX: options.sideLength / 2,
      centerY: options.sideLength / 2
    };

    // Expand '+' button
    var expandButton = new Path( buttonShape, { fill: 'rgb(0, 179, 0 )', stroke: 'black', lineWidth: 0.5 } );
    var plusSymbolShape = new Shape()
      .moveTo( symbolLength / 2, 0 )
      .lineTo( symbolLength / 2, symbolLength )
      .moveTo( 0, symbolLength / 2 )
      .lineTo( symbolLength, symbolLength / 2 );
    expandButton.addChild( new Path( plusSymbolShape, symbolOptions ) );

    // Collapse '-' button
    var collapseButton = new Path( buttonShape, { fill: 'rgb( 255, 85, 0 )', stroke: 'black', lineWidth: 0.5 } );
    var minusSymbolShape = new Shape()
      .moveTo( -symbolLength / 2, 0 )
      .lineTo( symbolLength / 2, 0 );
    collapseButton.addChild( new Path( minusSymbolShape, symbolOptions ) );

    // rendering order
    thisButton.addChild( expandButton );
    thisButton.addChild( collapseButton );

    // click to toggle
    thisButton.cursor = 'pointer';
    thisButton.addInputListener( new ButtonListener( {
      fire: function() {
        expandedProperty.set( !expandedProperty.get() );
      }
    } ) );

    // sync with property
    var expandedPropertyObserver = function( expanded ) {
      expandButton.visible = !expanded;
      collapseButton.visible = expanded;
    };
    expandedProperty.link( expandedPropertyObserver );

    // @public Unlinks from the property. Button in not functional after calling this.
    this.unlink = function() {
      expandedProperty.unlink( expandedPropertyObserver );
    };

    thisButton.mutate( options );
  }

  return inherit( Node, ExpandCollapseButton );
} );
