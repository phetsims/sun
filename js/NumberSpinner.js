// Copyright 2014-2016, University of Colorado Boulder

//TODO Further generalization of this component is in progress, see https://github.com/phetsims/sun/issues/85
/**
 * Spinner for numbers.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Andrea Lin
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowButton = require( 'SUN/buttons/ArrowButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
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

      // {string} where to place the arrow buttons, 'leftRight'|'topBottom'|'bothRight'|'bothBottom'
      arrowsPosition: 'bothRight',

      // {number|null} arrows are by default scaled to fit dimensions of value background. This scales relative to that scale.
      arrowsScale: null,

      decimalPlaces: 0,
      font: new PhetFont( 28 ),
      xMargin: 5,
      yMargin: 3,
      xSpacing: 5,
      ySpacing: 3,
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
    numberNode.center = backgroundNode.center;
    var valueParent = new Node( { children: [ backgroundNode, numberNode ] } );

    // buttons
    var incrementDirection = ( options.arrowsPosition === 'topBottom' || options.arrowsPosition === 'bothRight' ) ? 'up' : 'right';
    var incrementButton = new ArrowButton( incrementDirection, function() { numberProperty.set( numberProperty.get() + 1 ); } );
    var decrementDirection = ( options.arrowsPosition === 'topBottom' || options.arrowsPosition === 'bothRight' ) ? 'down' : 'left';
    var decrementButton = new ArrowButton( decrementDirection, function() { numberProperty.set( numberProperty.get() - 1 ); } );

    // pointer area
    incrementButton.touchArea = incrementButton.localBounds
      .dilatedXY( options.touchXDilated, options.touchYDilated )
      .shiftedY( -options.touchYDilated );
    decrementButton.touchArea = decrementButton.localBounds
      .dilatedXY( options.touchXDilated, options.touchYDilated )
      .shiftedY( options.touchYDilated );

    // arrow button scaling
    var arrowsScale;
    if ( !arrowsScale ) {
      if ( options.arrowsPosition === 'leftRight' ) {
        arrowsScale = valueParent.height / incrementButton.height;
      }
      else if ( options.arrowsPosition === 'topBottom' ) {
        arrowsScale = valueParent.width / incrementButton.width;
      }
      else if ( options.arrowsPosition === 'bothRight' ) {
        arrowsScale = ( ( valueParent.height / 2 ) - ( options.ySpacing / 2 ) ) / incrementButton.height;
      }
      else if ( options.arrowsPosition === 'bothBottom' ) {
        arrowsScale = ( ( valueParent.width / 2 ) - ( options.xSpacing / 2 ) ) / incrementButton.width;
      }
      else {
        throw new Error( 'invalid options.arrowsPosition: ' + options.arrowsPosition );
      }
    }
    if ( options.arrowsScale ) {
      arrowsScale = arrowsScale * options.arrowsScale;
    }
    incrementButton.setScaleMagnitude( arrowsScale );
    decrementButton.setScaleMagnitude( arrowsScale );

    // layout
    if ( options.arrowsPosition === 'leftRight' ) {
      incrementButton.left = valueParent.right + options.xSpacing;
      decrementButton.right = valueParent.left - options.xSpacing;
      incrementButton.centerY = decrementButton.centerY = valueParent.centerY;
    }
    else if ( options.arrowsPosition === 'topBottom' ) {
      incrementButton.centerX = decrementButton.centerX = valueParent.centerX;
      incrementButton.bottom = valueParent.top - options.ySpacing;
      decrementButton.top = valueParent.bottom + options.ySpacing;
    }
    else if ( options.arrowsPosition === 'bothRight' ) {
      incrementButton.left = decrementButton.left = valueParent.right + options.xSpacing;
      incrementButton.bottom = valueParent.centerY - ( options.ySpacing / 2 );
      decrementButton.top = valueParent.centerY + ( options.ySpacing / 2 );
    }
    else if ( options.arrowsPosition === 'bothBottom' ) {
      incrementButton.left = valueParent.centerX + ( options.xSpacing / 2 );
      decrementButton.right = valueParent.centerX - ( options.xSpacing / 2 );
      incrementButton.top = decrementButton.top = valueParent.bottom + options.ySpacing;
    }
    else {
      throw new Error( 'invalid options.arrowsPosition: ' + options.arrowsPosition );
    }

    assert && assert( !this.children, 'decoration not supported' );
    options.children = [ valueParent, incrementButton, decrementButton ];

    Node.call( this, options );

    // @private When the value changes ...
    this.numberPropertyObserver = function( value ) {
      assert && assert( range.contains( value ) );

      // update the number and center it
      numberNode.text = Util.toFixed( value, options.decimalPlaces );
      numberNode.center = backgroundNode.center;

      // enable/disable arrow buttons
      incrementButton.enabled = ( value < range.max );
      decrementButton.enabled = ( value > range.min );
    };
    this.numberProperty = numberProperty; // @private
    this.numberProperty.link( this.numberPropertyObserver ); // must be unlinked in dispose
  }

  sun.register( 'NumberSpinner', NumberSpinner );

  return inherit( Node, NumberSpinner, {

    // @public Ensures that this node is eligible for GC.
    dispose: function() {
      this.numberProperty.unlink( this.numberPropertyObserver );
    }
  } );
} );
