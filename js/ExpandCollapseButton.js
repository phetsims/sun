// Copyright 2013-2019, University of Colorado Boulder

/**
 * Button for expanding/collapsing something.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanRectangularToggleButton = require( 'SUN/buttons/BooleanRectangularToggleButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  // constants
  var SYMBOL_RELATIVE_WIDTH = 0.6; // width of +/- symbols relative to button sideLength (see options)
  var RELATIVE_X_MARGIN = ( 1 - SYMBOL_RELATIVE_WIDTH ) / 2; // margin to produce a button of specified sideLength

  /**
   * @param {Property.<boolean>} expandedProperty
   * @param {Object} [options]
   * @constructor
   */
  function ExpandCollapseButton( expandedProperty, options ) {

    options = _.extend( {
      stroke: 'black',
      sideLength: 25,  // length of one side of the square button

      // phet-io
      tandem: Tandem.required
    }, options );

    assert && assert( options.cornderRadius === undefined, 'ExpandCollapseButton sets cornerRadius' );
    options.cornerRadius = 0.1 * options.sideLength;

    assert && assert( options.xMargin === undefined, 'ExpandCollapseButton sets xMargin' );
    options.xMargin = RELATIVE_X_MARGIN * options.sideLength;

    assert && assert( options.yMargin === undefined, 'ExpandCollapseButton sets yMargin' );
    options.yMargin = options.xMargin;

    assert && assert( options.buttonAppearanceStrategy === undefined, 'ExpandCollapseButton sets buttonAppearanceStrategy' );
    options.buttonAppearanceStrategy = RectangularButtonView.FlatAppearanceStrategy;

    // configure the +/- symbol on the button
    var symbolLength = SYMBOL_RELATIVE_WIDTH * options.sideLength;
    var symbolLineWidth = 0.15 * options.sideLength;
    var symbolOptions = {
      lineWidth: symbolLineWidth,
      stroke: 'white',
      centerX: options.sideLength / 2,
      centerY: options.sideLength / 2,
      pickable: false
    };

    // Expand '+' content
    var plusSymbolShape = new Shape()
      .moveTo( symbolLength / 2, 0 )
      .lineTo( symbolLength / 2, symbolLength )
      .moveTo( 0, symbolLength / 2 )
      .lineTo( symbolLength, symbolLength / 2 );
    var expandeNode = new Path( plusSymbolShape, symbolOptions );

    // Collapse '-' content
    var minusSymbolShape = new Shape()
      .moveTo( -symbolLength / 2, 0 )
      .lineTo( symbolLength / 2, 0 );
    var collapseNode = new Path( minusSymbolShape, symbolOptions );

    BooleanRectangularToggleButton.call( this, collapseNode, expandeNode, expandedProperty, options );

    // listeners must be removed in dispose
    var expandedPropertyObserver = expanded => {
      this.baseColor = expanded ? 'rgb( 255, 85, 0 )' : 'rgb( 0, 179, 0 )';
    };
    expandedProperty.link( expandedPropertyObserver );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ExpandCollapseButton', this );

    // @private
    this.disposeExpandCollapseButton = () => {
      expandedProperty.unlink( expandedPropertyObserver );
    };
  }

  sun.register( 'ExpandCollapseButton', ExpandCollapseButton );

  return inherit( BooleanRectangularToggleButton, ExpandCollapseButton, {

    // @public - Ensures that this node is eligible for GC.
    dispose: function() {
      this.disposeExpandCollapseButton();
      BooleanRectangularToggleButton.prototype.dispose.call( this );
    }
  } );
} );