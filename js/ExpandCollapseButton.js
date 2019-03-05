// Copyright 2013-2019, University of Colorado Boulder

/**
 * Button for expanding/collapsing something.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanRectangularToggleButton = require( 'SUN/buttons/BooleanRectangularToggleButton' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Path = require( 'SCENERY/nodes/Path' );
  const RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  const Shape = require( 'KITE/Shape' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  // constants
  const SYMBOL_RELATIVE_WIDTH = 0.6; // width of +/- symbols relative to button sideLength (see options)
  const RELATIVE_X_MARGIN = ( 1 - SYMBOL_RELATIVE_WIDTH ) / 2; // margin to produce a button of specified sideLength

  class ExpandCollapseButton extends BooleanRectangularToggleButton {

    /**
     * @param  {Property.<boolean>} expandedProperty
     * @param  {Object} options
     */
    constructor( expandedProperty, options ) {

      options = _.extend( {
        stroke: 'black',
        sideLength: 25,  // length of one side of the square button

        // phet-io
        tandem: Tandem.required
      }, options );

      assert && assert( options.cornerRadius === undefined, 'ExpandCollapseButton sets cornerRadius' );
      options.cornerRadius = 0.1 * options.sideLength;

      assert && assert( options.xMargin === undefined, 'ExpandCollapseButton sets xMargin' );
      options.xMargin = RELATIVE_X_MARGIN * options.sideLength;

      assert && assert( options.yMargin === undefined, 'ExpandCollapseButton sets yMargin' );
      options.yMargin = options.xMargin;

      assert && assert( options.buttonAppearanceStrategy === undefined, 'ExpandCollapseButton sets buttonAppearanceStrategy' );
      options.buttonAppearanceStrategy = RectangularButtonView.FlatAppearanceStrategy;

      // configure the +/- symbol on the button
      const symbolLength = SYMBOL_RELATIVE_WIDTH * options.sideLength;
      const symbolLineWidth = 0.15 * options.sideLength;
      const symbolOptions = {
        lineWidth: symbolLineWidth,
        stroke: 'white',
        centerX: options.sideLength / 2,
        centerY: options.sideLength / 2,
        pickable: false
      };

      // Expand '+' content
      const plusSymbolShape = new Shape()
        .moveTo( symbolLength / 2, 0 )
        .lineTo( symbolLength / 2, symbolLength )
        .moveTo( 0, symbolLength / 2 )
        .lineTo( symbolLength, symbolLength / 2 );
      const expandNode = new Path( plusSymbolShape, symbolOptions );

      // Collapse '-' content
      const minusSymbolShape = new Shape()
        .moveTo( -symbolLength / 2, 0 )
        .lineTo( symbolLength / 2, 0 );
      const collapseNode = new Path( minusSymbolShape, symbolOptions );

      super( collapseNode, expandNode, expandedProperty, options );

      // listeners must be removed in dispose
      const expandedPropertyObserver = expanded => {

        //TODO use PhetColorScheme.RED_COLORBLIND, see https://github.com/phetsims/sun/issues/485
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

    /**
     * Ensures that this node is eligible for GC.
     * @public
     */
    dispose() {
      this.disposeExpandCollapseButton();
      super.dispose(); 
    }
  }

  return sun.register( 'ExpandCollapseButton', ExpandCollapseButton );

} );