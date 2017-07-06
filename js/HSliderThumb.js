// Copyright 2013-2016, University of Colorado Boulder

/**
 * A default slider thumb, currently intended for use only in HSlider. It's a rectangle with a vertical white line down
 * the center.  The origin is at the top left (HSlider uses the thumb center for positioning).
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
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Property.<boolean>} enabledProperty
   * @param {Object} [options] see HSlider constructor
   * @constructor
   * @private
   */
  function HSliderThumb( enabledProperty, options ) {

    options = _.extend( {
      size: new Dimension2( 22, 45 ),
      fillEnabled: 'rgb(50,145,184)',
      fillHighlighted: 'rgb(71,207,255)',
      fillDisabled: '#F0F0F0',
      stroke: 'black',
      lineWidth: 1,
      centerLineStroke: 'white',
      tandem: Tandem.tandemRequired()
    }, options );

    var self = this;

    // rectangle
    var arcWidth = 0.25 * options.size.width;
    Rectangle.call( this, 0, 0,
      options.size.width, options.size.height,
      arcWidth, arcWidth,
      {
        fill: enabledProperty.get() ? options.fillEnabled : options.fillDisabled,
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        cachedPaints: [
          options.fillHighlighted, options.fillEnabled, options.fillDisabled
        ]
      } );

    // vertical line down the center
    var centerLineYMargin = 3;
    this.addChild( new Path( Shape.lineSegment(
        options.size.width / 2, centerLineYMargin,
        options.size.width / 2, options.size.height - centerLineYMargin ),
      { stroke: options.centerLineStroke } ) );

    // highlight thumb on pointer over
    this.addInputListener( new ButtonListener( {
      over: function( event ) {
        if ( enabledProperty.get() ) { self.fill = options.fillHighlighted; }
      },
      up: function( event ) {
        if ( enabledProperty.get() ) { self.fill = options.fillEnabled; }
      }
    } ) );

    // @private enable/disable the look of the thumb
    var enabledObserver = function( enabled ) {
      self.fill = enabled ? options.fillEnabled : options.fillDisabled;
    };
    enabledProperty.link( enabledObserver ); // must be unlinked in disposeHSliderThumb

    // @private Called by dispose
    this.disposeHSliderThumb = function() {
      enabledProperty.unlink( enabledObserver );
    };

    // tandem support
    this.mutate( {
      tandem: options.tandem
    } );
  }

  sun.register( 'HSliderThumb', HSliderThumb );

  return inherit( Rectangle, HSliderThumb, {

    // @public - Ensures that this object is eligible for GC.
    dispose: function() {
      this.disposeHSliderThumb();
      Rectangle.prototype.dispose.call( this );
    }
  } );
} );
