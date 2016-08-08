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
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var sun = require( 'SUN/sun' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // possible values for options.arrowsPosition
  var ARROWS_POSITION_VALUES = [
    'leftRight', // arrow buttons on left and right of value
    'topBottom', // arrow buttons on top and bottom of value
    'bothRight', // both arrow buttons to the right of the value
    'bothBottom' // both arrow buttons below the value
  ];

  // possible values for options.valueAlign
  var VALUE_ALIGN_VALUES = [ 'center', 'left', 'right' ];

  /**
   * @param {Property.<number>} numberProperty value, must be an integer
   * @param {Range} range range of values, min and max must be integers
   * @param {Object} [options]
   * @constructor
   */
  function NumberSpinner( numberProperty, range, options ) {

    assert && assert( range.contains( numberProperty.get() ), 'value ' + numberProperty.get() + ' is out of range ' + range.toString() );

    options = _.extend( {
      enabledProperty: new Property( true ),

      // {string} where to place the arrow buttons, see ARROWS_POSITION_VALUES
      arrowsPosition: 'bothRight',

      // {number|null} By default, arrows are scaled to fit dimensions of value background. This is an additional scale factor.
      arrowsScale: null,
      arrowButtonFill: 'white',
      arrowButtonStroke: 'black',
      arrowButtonLineWidth: 1,

      valuePattern: '{0}',
      decimalPlaces: 0,
      deltaValue: 1,
      font: new PhetFont( 28 ),
      
      // {string} alignment for value, see VALUE_ALIGN_VALUES
      valueAlign: 'center',
      xSpacing: 5,
      ySpacing: 3,
      
      // background node
      xMargin: 5,
      yMargin: 3,
      cornerRadius: 5,
      backgroundMinWidth: 0,
      backgroundFill: 'white',
      backgroundStroke: 'black',
      backgroundLineWidth: 1,

      // arrow button pointer areas
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0

    }, options );

    // validate options
    assert && assert( _.contains( ARROWS_POSITION_VALUES, options.arrowsPosition ), 'invalid arrowsPosition: ' + options.arrowsPosition );
    assert && assert( _.contains( VALUE_ALIGN_VALUES, options.valueAlign ), 'invalid valueAlign: ' + options.valueAlign );

    var thisNode = this;

    var valueOptions = {
      font: options.font,
      fill: 'black'
    };

    // compute max width of the value that's going to be displayed
    var minString = StringUtils.format( options.valuePattern, Util.toFixed( range.min, options.decimalPlaces ) );
    var maxString = StringUtils.format( options.valuePattern, Util.toFixed( range.max, options.decimalPlaces ) );
    var maxWidth = Math.max(
      new Text( minString, valueOptions ).width,
      new Text( maxString, valueOptions ).width
    );

    // number
    var numberNode = new Text( numberProperty.get(), valueOptions );

    // compute the size of the background
    var backgroundWidth = Math.max( maxWidth + 2 * options.xMargin, options.backgroundMinWidth );
    var backgroundHeight = numberNode.height + ( 2 * options.yMargin );

    // background for displaying the value
    var backgroundNode = new Rectangle( 0, 0, backgroundWidth, backgroundHeight,
      options.cornerRadius, options.cornerRadius, {
        fill: options.backgroundFill,
        stroke: options.backgroundStroke,
        lineWidth: options.backgroundLineWidth
      } );
    numberNode.center = backgroundNode.center;
    var valueParent = new Node( { children: [ backgroundNode, numberNode ] } );

    // buttons
    var arrowButtonOptions = { 
      baseColor: options.arrowButtonFill,
      stroke: options.arrowButtonStroke,
      lineWidth: options.arrowButtonLineWidth
    };
    var incrementDirection = ( options.arrowsPosition === 'topBottom' || options.arrowsPosition === 'bothRight' ) ? 'up' : 'right';
    var incrementButton = new ArrowButton( incrementDirection, function() {
      numberProperty.set( numberProperty.get() + options.deltaValue );
    }, arrowButtonOptions );
    var decrementDirection = ( options.arrowsPosition === 'topBottom' || options.arrowsPosition === 'bothRight' ) ? 'down' : 'left';
    var decrementButton = new ArrowButton( decrementDirection, function() {
      numberProperty.set( numberProperty.get() - options.deltaValue );
    }, arrowButtonOptions );

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
      else { // 'bothBottom'
        arrowsScale = ( ( valueParent.width / 2 ) - ( options.xSpacing / 2 ) ) / incrementButton.width;
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
    else { // 'bothBottom'
      incrementButton.left = valueParent.centerX + ( options.xSpacing / 2 );
      decrementButton.right = valueParent.centerX - ( options.xSpacing / 2 );
      incrementButton.top = decrementButton.top = valueParent.bottom + options.ySpacing;
    }

    // touch areas
    if ( options.touchAreaXDilation || options.touchAreaYDilation ) {

      incrementButton.touchArea = incrementButton.localBounds.dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation );
      decrementButton.touchArea = decrementButton.localBounds.dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation );

      // shift touch areas for these options, to prevent overlap
      if ( options.arrowsPosition === 'bothRight' ) {
        incrementButton.touchArea = incrementButton.touchArea.shiftedY( -options.touchAreaYDilation );
        decrementButton.touchArea = decrementButton.touchArea.shiftedY( options.touchAreaYDilation );
      }
      else if ( options.arrowsPosition === 'bothBottom' ){
        incrementButton.touchArea = incrementButton.touchArea.shiftedX( options.touchAreaXDilation );
        decrementButton.touchArea = decrementButton.touchArea.shiftedX( -options.touchAreaXDilation );
      }
    }

    // mouse areas
    if ( options.mouseAreaXDilation || options.mouseAreaYDilation ) {

      incrementButton.mouseArea = incrementButton.localBounds.dilatedXY( options.mouseAreaXDilation, options.mouseAreaYDilation );
      decrementButton.mouseArea = decrementButton.localBounds.dilatedXY( options.mouseAreaXDilation, options.mouseAreaYDilation );

      // shift touch areas for these options, to prevent overlap
      if ( options.arrowsPosition === 'bothRight' ) {
        incrementButton.mouseArea = incrementButton.mouseArea.shiftedY( -options.mouseAreaYDilation );
        decrementButton.mouseArea = decrementButton.mouseArea.shiftedY( options.mouseAreaYDilation );
      }
      else if ( options.arrowsPosition === 'bothBottom' ) {
        incrementButton.mouseArea = incrementButton.mouseArea.shiftedX( options.mouseAreaXDilation );
        decrementButton.mouseArea = decrementButton.mouseArea.shiftedX( -options.mouseAreaXDilation );
      }
    }

    assert && assert( !options.children, 'decoration not supported' );
    options.children = [ valueParent, incrementButton, decrementButton ];

    Node.call( this, options );

    // synchronize with number value
    var numberPropertyObserver = function( value ) {
      assert && assert( range.contains( value ), 'value out of range: ' + value );

      // update the number and align it
      numberNode.text = StringUtils.format( options.valuePattern, Util.toFixed( value, options.decimalPlaces ) );
      switch (options.valueAlign ) {
        case 'center':
          numberNode.center = backgroundNode.center;
          break;
        case 'left':
          numberNode.left = backgroundNode.left + options.xMargin;
          break;
        case 'right':
          numberNode.right = backgroundNode.right - options.xMargin;
          break;
        default:
          throw new Error( 'invalid valueAlign: ' + options.valueAlign );
      }

      // enable/disable arrow buttons
      incrementButton.enabled = ( ( value + options.deltaValue ) <= range.max );
      decrementButton.enabled = ( ( value - options.deltaValue ) >= range.min );
    };
    numberProperty.link( numberPropertyObserver ); // must be unlinked in dispose

    // enable or disable this component
    this.enabledProperty = options.enabledProperty; // @public
    var enabledPropertyObserver = function( enabled ) {
      thisNode.pickable = enabled;
      thisNode.opacity = enabled ? 1 : 0.5;
    };
    this.enabledProperty.link( enabledPropertyObserver );

    // @private
    this.disposeNumberSpinner = function() {
      numberProperty.unlink( numberPropertyObserver );
      thisNode.enabledProperty.unlink( enabledPropertyObserver );
    };
  }

  sun.register( 'NumberSpinner', NumberSpinner );

  return inherit( Node, NumberSpinner, {

    // @public Ensures that this node is eligible for GC.
    dispose: function() {
      this.disposeNumberSpinner();
    },

    // @public
    setEnabled: function( enabled ) { this.enabledProperty.set( enabled ); },
    set enabled( value ) { this.setEnabled( value ); },

    // @public
    getEnabled: function() { return this.enabledProperty.get(); },
    get enabled() { return this.getEnabled(); } 
  } );
} );
