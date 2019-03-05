// Copyright 2016-2019, University of Colorado Boulder

/**
 * A default slider track, currently intended for use only in HSlider.
 *
 * SliderTrack is composed of two rectangles, one for the enabled section of the track and one for the disabled
 * section.  The enabled track rectangle sits on top of the disabled track so that the enabled range can be any
 * desired sub range of the full slider range.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SliderTrackIO = require( 'SUN/SliderTrackIO' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Property.<number>} valueProperty
   * @param {function} valueToPosition - linear function that maps property value to position along the track
   * @param {Object} [options]
   * @constructor
   */
  function SliderTrack( valueProperty, valueToPosition, options ) {

    var self = this;
    Node.call( this );

    options = _.extend( {
      size: new Dimension2( 100, 5 ),
      fillEnabled: 'white',
      fillDisabled: 'gray',
      stroke: 'black',
      lineWidth: 1,
      cornerRadius: 0,
      startDrag: _.noop, // called when a drag sequence starts
      endDrag: _.noop, // called when a drag sequence ends
      constrainValue: _.identity, // called before valueProperty is set

      // phet-io
      tandem: Tandem.required,
      phetioType: SliderTrackIO

    }, options );

    // @private
    this.size = options.size;

    // @public
    this.valueToPosition = valueToPosition;

    // @private - Represents the disabled range of the slider, always visible and always the full range
    // of the slider so that when the enabled range changes we see the enabled sub-range on top of the
    // full range of the slider.
    this.disabledTrack = new Rectangle( 0, 0, this.size.width, this.size.height, {
      fill: options.fillDisabled,
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      cornerRadius: options.cornerRadius,
      cursor: 'default'
    } );
    this.addChild( this.disabledTrack );

    // @private - Will change size depending on the enabled range of the slider.  On top so that we can see
    // the enabled sub-range of the slider.
    this.enabledTrack = new Rectangle( 0, 0, this.size.width, this.size.height, {
      fill: options.fillEnabled,
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      cornerRadius: options.cornerRadius
    } );
    this.addChild( this.enabledTrack );

    // click in the track to change the value, continue dragging if desired
    var handleTrackEvent = function( event, trail ) {
      var transform = trail.subtrailTo( self ).getTransform();
      var x = transform.inversePosition2( event.pointer.point ).x;
      var value = self.valueToPosition.inverse( x );
      var newValue = options.constrainValue( value );
      valueProperty.set( newValue );
    };

    var trackInputListener = new SimpleDragHandler( {
      tandem: options.tandem.createTandem( 'trackInputListener' ),

      start: function( event, trail ) {
        options.startDrag( event );
        handleTrackEvent( event, trail );
      },

      drag: function( event, trail ) {

        // Reuse the same handleTrackEvent but make sure the startedCallbacks call is made before the value changes
        handleTrackEvent( event, trail );
      },

      end: function( event ) {
        options.endDrag( event );
      }
    } );
    this.enabledTrack.addInputListener( trackInputListener );

    // @private Called by dispose
    this.disposeSliderTrack = function() {
      trackInputListener.dispose();
    };
  }

  sun.register( 'SliderTrack', SliderTrack );

  inherit( Node, SliderTrack, {

    // @public - ensures that this object is eligible for GC
    dispose: function() {
      this.disposeSliderTrack();
      Node.prototype.dispose.call( this );
    },

    /**
     * Update the dimensions of the enabled track.
     *
     * @param  {number} minX - x value for the min position of the enabled range of the track
     * @param  {number} maxX - x value for the max position of the enabled range of the track
     */
    updateEnabledTrackWidth: function( minX, maxX ) {
      var enabledWidth = maxX - minX;
      this.enabledTrack.setRect( minX, 0, enabledWidth, this.size.height );
    }
  } );

  return SliderTrack;
} );