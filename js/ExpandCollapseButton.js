// Copyright 2013-2015, University of Colorado Boulder

//TODO see sun#29, reimplement as a subtype of something from sun.buttons
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
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Property.<boolean>} expandedProperty
   * @param {Object} [options]
   * @constructor
   */
  function ExpandCollapseButton( expandedProperty, options ) {

    options = _.extend( {
      sideLength: 25,  // length of one side of the square button
      tandem: Tandem.tandemRequired()
    }, options );

    Node.call( this );

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
      centerY: options.sideLength / 2,
      pickable: false
    };

    // Expand '+' button
    var expandButton = new Path( buttonShape, {
      fill: 'rgb(0, 179, 0 )',
      stroke: 'black',
      lineWidth: 0.5,
      tandem: options.tandem.createTandem( 'expandButton' )
    } );
    var plusSymbolShape = new Shape()
      .moveTo( symbolLength / 2, 0 )
      .lineTo( symbolLength / 2, symbolLength )
      .moveTo( 0, symbolLength / 2 )
      .lineTo( symbolLength, symbolLength / 2 );
    expandButton.addChild( new Path(
      plusSymbolShape,
      _.extend( { tandem: options.tandem.createTandem( 'plusSymbol' ) }, symbolOptions )
    ) );

    // Collapse '-' button
    var collapseButton = new Path( buttonShape, {
      fill: 'rgb( 255, 85, 0 )',
      stroke: 'black',
      lineWidth: 0.5,
      tandem: options.tandem.createTandem( 'collapseButton' )
    } );
    var minusSymbolShape = new Shape()
      .moveTo( -symbolLength / 2, 0 )
      .lineTo( symbolLength / 2, 0 );
    collapseButton.addChild( new Path(
      minusSymbolShape,
      _.extend( { tandem: options.tandem.createTandem( 'minusSymbol' ) }, symbolOptions )
    ) );

    // rendering order
    this.addChild( expandButton );
    this.addChild( collapseButton );

    // click to toggle
    this.cursor = 'pointer';
    this.addInputListener( new ButtonListener( {
      fire: function() {
        expandedProperty.set( !expandedProperty.get() );
      },
      tandem: options.tandem.createTandem( 'buttonListener' )
    } ) );

    // @private
    this.expandedPropertyObserver = function( expanded ) {
      expandButton.visible = !expanded;
      collapseButton.visible = expanded;
    };
    this.expandedProperty = expandedProperty; // @private
    this.expandedProperty.link( this.expandedPropertyObserver ); // must be unlinked in dispose

    this.mutate( options );
  }

  sun.register( 'ExpandCollapseButton', ExpandCollapseButton );

  return inherit( Node, ExpandCollapseButton, {

    // @public - Ensures that this node is eligible for GC.
    dispose: function() {
      this.expandedProperty.unlink( this.expandedPropertyObserver );
      Node.prototype.dispose.call( this );
    }
  } );
} );
