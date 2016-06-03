// Copyright 2013-2015, University of Colorado Boulder

/**
 * Track for a Horizontal Slider.  The HSliderTrack is composed of two rectangles, one for the enabled section of the
 * track and one for the disabled section.  The enabled track rectangle sits on top of the disabled track so that
 * the enabled range can be any desired sub range of the full slider range.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var TandemDragHandler = require( 'TANDEM/scenery/input/TandemDragHandler' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Property.<number>} valueProperty
   * @param {function} valueToPosition - linear function that maps property value to position along the track
   * @param {function} snapToValue - function to snap to a value if slider should snap to a value on drag end
   * @param {Object} [options]
   * @constructor
   */
  function HSliderTrack( valueProperty, valueToPosition, snapToValue, options ) {

    var thisTrack = this;
    Node.call( thisTrack );

    options = _.extend( {
      // track
      trackFillEnabled: 'white',
      trackFillDisabled: 'gray',
      trackStroke: 'black',
      trackLineWidth: 1,
      // tandem
      tandem: null
    }, options );

    Tandem.validateOptions( options ); // The tandem is required when brand==='phet-io'

    // @private
    this.trackSize = options.trackSize;
    this.enabledProperty = options.enabledProperty;

    // @public
    this.valueToPosition = valueToPosition;
    this.snapValue = options.snapValue;

    // @private
    thisTrack.disabledTrack = new Rectangle( 0, 0, this.trackSize.width, this.trackSize.height, {
      fill: options.trackFillDisabled,
      stroke: options.trackStroke,
      lineWidth: options.trackLineWidth,
      cursor: 'default'
    } );
    thisTrack.addChild( thisTrack.disabledTrack );

    // @private
    thisTrack.enabledTrack = new Rectangle( 0, 0, this.trackSize.width, this.trackSize.height, { 
      fill: options.trackFillEnabled,
      stroke: options.trackStroke,
      ineWidth: options.trackLineWidth
    } );
    thisTrack.addChild( thisTrack.enabledTrack );

    // click in the track to change the value, continue dragging if desired
    var handleTrackEvent = function( event, trail ) {
      if ( thisTrack.enabledProperty.get() ) {
        var transform = trail.subtrailTo( thisTrack ).getTransform();
        var x = transform.inversePosition2( event.pointer.point ).x;
        var value = thisTrack.valueToPosition.inverse( x );
        var newValue = options.constrainValue( value );
        valueProperty.set( newValue );
      }
    };
    var trackInputListener = new TandemDragHandler( {
      tandem: options.tandem ? options.tandem.createTandem( 'trackInputListener' ) : null,

      start: function( event, trail ) {
        if ( thisTrack.enabledProperty.get() ) {
          options.startDrag();
          handleTrackEvent( event, trail );
        }
      },

      drag: function( event, trail ) {

        // Reuse the same handleTrackEvent but make sure the startedCallbacks call is made before the value changes
        handleTrackEvent( event, trail );
      },

      end: function() {
        if ( thisTrack.enabledProperty.get() ) {
          if( typeof thisTrack.snapValue === 'number' ) {
            snapToValue( thisTrack.snapValue );
          }
          options.endDrag();
        }
      }
    } );
    thisTrack.enabledTrack.addInputListener( trackInputListener );

    // enable/disable
    var enabledObserver = function( enabled ) {
      thisTrack.enabledTrack.visible = enabled;
      if ( !enabled ) {
        if ( trackInputListener.dragging ) { trackInputListener.endDrag(); }
      }
    };
    thisTrack.enabledProperty.link( enabledObserver ); // must be unlinked in disposeHSliderTrack

    // @private Called by dispose
    this.disposeHSliderTrack = function() {
      thisTrack.enabledProperty.unlink( enabledObserver );
      options.tandem && options.tandem.removeInstance( thisTrack );
      trackInputListener.dispose();
    };

    options.tandem && options.tandem.addInstance( this );
  }

  sun.register( 'HSliderTrack', HSliderTrack );

  inherit( Node, HSliderTrack, {

    // @public - ensures that this object is eligible for GC
    dispose: function() {
      this.disposeHSliderTrack();
    },

    /**
     * Update the dimensions of the enabled track.
     * 
     * @param  {number} minX - x value for the min position of the enabled range of the track
     * @param  {number} maxX - x value for the max position of the enabled range of the track
     */
    updateEnabledTrackWidth: function( minX, maxX ) {
      var enabledWidth = maxX - minX;
      this.enabledTrack.setRect( minX, 0, enabledWidth, this.trackSize.height );
    }

  } );

  return HSliderTrack;
} );