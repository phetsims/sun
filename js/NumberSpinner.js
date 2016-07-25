// Copyright 2014-2015, University of Colorado Boulder

/**
 * Spinner for numbers.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowButton = require( 'SUN/buttons/ArrowButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RPALFont = require( 'REACTANTS_PRODUCTS_AND_LEFTOVERS/common/view/RPALFont' );
  var sun = require( 'SUN/sun' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  /**
   * @param {Property.<number>} numberProperty value, must be an integer
   * @param {Range} range range of values, min and max must be integers
   * @param {Object} [options]
   * @constructor
   */
  function NumberSpinner( numberProperty, range, options ) {

    assert && assert( range.contains( numberProperty.get() ), 'value ' + numberProperty.get() + ' is out of range ' + range.toString() );

    options = _.extend( {
      decimalPlaces: 0,
      font: new RPALFont( 28 ),
      xMargin: 5,
      yMargin: 3,
      ySpacing: 5,
      cornerRadius: 5,
      touchXDilated: 20,
      touchYDilated: 10
    }, options );

    var valueOptions = {
      font: options.font,
      fill: 'black'
    };

    // compute max width
    var maxWidth = Math.max(
      new Text( Util.toFixed( range.max, options.decimalPlaces ), valueOptions ).width,
      new Text( Util.toFixed( range.min, options.decimalPlaces ), valueOptions ).width
    );

    // number
    var numberNode = new Text( numberProperty.get(), valueOptions );
    var backgroundNode = new Rectangle( 0, 0, maxWidth + ( 2 * options.xMargin ), numberNode.height + ( 2 * options.yMargin ),
      options.cornerRadius, options.cornerRadius, {
        fill: 'white',
        stroke: 'black',
        lineWidth: 0.5
      } );
    var valueParent = new Node( { children: [ backgroundNode, numberNode ] } );

    // buttons
    var upButton = new ArrowButton( 'up', function() { numberProperty.set( numberProperty.get() + 1 ); } );
    var downButton = new ArrowButton( 'down', function() { numberProperty.set( numberProperty.get() - 1 ); } );
    var buttonsParent = new LayoutBox( {
      children: [ upButton, downButton ],
      orientation: 'vertical',
      spacing: options.ySpacing
    } );
    buttonsParent.setScaleMagnitude( backgroundNode.height / buttonsParent.height );
    upButton.touchArea = upButton.localBounds
      .dilatedXY( options.touchXDilated, options.touchYDilated )
      .shiftedY( -options.touchYDilated );
    downButton.touchArea = downButton.localBounds
      .dilatedXY( options.touchXDilated, options.touchYDilated )
      .shiftedY( options.touchYDilated );

    // buttons to right of value
    options.children = [ valueParent, buttonsParent ];
    options.spacing = options.ySpacing;
    options.orientation = 'horizontal';
    LayoutBox.call( this, options );

    // @private When the value changes ...
    this.numberPropertyObserver = function( value ) {
      assert && assert( range.contains( value ) );

      // update the number and center it
      numberNode.text = Util.toFixed( value, options.decimalPlaces );
      numberNode.center = backgroundNode.center;

      // enable/disable arrow buttons
      upButton.enabled = ( value < range.max );
      downButton.enabled = ( value > range.min );
    };
    this.numberProperty = numberProperty; // @private
    this.numberProperty.link( this.numberPropertyObserver ); // must be unlinked in dispose
  }

  sun.register( 'NumberSpinner', NumberSpinner );

  return inherit( LayoutBox, NumberSpinner, {

    // @public Ensures that this node is eligible for GC.
    dispose: function() {
      this.numberProperty.unlink( this.numberPropertyObserver );
    }
  } );
} );
