// Copyright 2013-2016, University of Colorado Boulder

/**
 * The default thumb for an HSlider.
 * It's a rectangle with a vertical white line down the center
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Property.<boolean>} enabledProperty
   * @param {Object} [options] see HSlider constructor
   * @constructor
   * @private
   */
  function HSliderThumb( enabledProperty, options ) {

    options = _.extend( {
      thumbSize: new Dimension2( 22, 45 ),
      thumbFillEnabled: 'rgb(50,145,184)',
      thumbFillHighlighted: 'rgb(71,207,255)',
      thumbFillDisabled: '#F0F0F0',
      thumbStroke: 'black',
      thumbLineWidth: 1,
      thumbCenterLineStroke: 'white'
    }, options );

    var thisNode = this;

    // rectangle
    var arcWidth = 0.25 * options.thumbSize.width;
    Rectangle.call( thisNode,
      -options.thumbSize.width / 2, -options.thumbSize.height / 2,
      options.thumbSize.width, options.thumbSize.height,
      arcWidth, arcWidth,
      {
        fill: enabledProperty.get() ? options.thumbFillEnabled : options.thumbFillDisabled,
        stroke: options.thumbStroke,
        lineWidth: options.thumbLineWidth,
        cachedPaints: [
          options.thumbFillHighlighted, options.thumbFillEnabled, options.thumbFillDisabled
        ]
      } );

    // vertical line down the center
    var centerLineYMargin = 3;
    thisNode.addChild( new Path( Shape.lineSegment(
      0, -( options.thumbSize.height / 2 ) + centerLineYMargin,
      0, ( options.thumbSize.height / 2 ) - centerLineYMargin ),
      { stroke: options.thumbCenterLineStroke } ) );

    // highlight thumb on pointer over
    thisNode.addInputListener( new ButtonListener( {
      over: function( event ) {
        if ( enabledProperty.get() ) { thisNode.fill = options.thumbFillHighlighted; }
      },
      up: function( event ) {
        if ( enabledProperty.get() ) { thisNode.fill = options.thumbFillEnabled; }
      }
    } ) );

    // @private enable/disable the look of the thumb
    var enabledObserver = function( enabled ) {
      thisNode.fill = enabled ? options.thumbFillEnabled : options.thumbFillDisabled;
    };
    enabledProperty.link( enabledObserver ); // must be unlinked in disposeHSliderThumb

    // @private Called by dispose
    this.disposeHSliderThumb = function() {
      enabledProperty.unlink( enabledObserver );
    };
  }

  sun.register( 'HSliderThumb', HSliderThumb );

  return inherit( Rectangle, HSliderThumb, {

    // @public - Ensures that this object is eligible for GC.
    dispose: function() {
      this.disposeHSliderThumb();
    }
  } );
} );
