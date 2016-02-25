// Copyright 2013-2015, University of Colorado Boulder

/**
 * Track for a Horizontal Slider.  The SliderTrack is composed of two rectangles, one for the enabled section of the
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
  var TandemDragHandler = require( 'SUN/TandemDragHandler' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Property.<number>} valueProperty
   * @param { {min:number, max:number} } range
   * @param {function} valueToPosition
   * @param {function} snapToValue - function to snap to a value if slider should snap to a vavlue on drag end
   * @param {Object} [options]
   * @constructor
   */
  function SliderTrack( valueProperty, range, valueToPosition, snapToValue, options ) {

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
    this.options = options; // @private TODO save only the options that are needed by prototype functions
    this.enabledProperty = options.enabledProperty;
    this.enabledRangeProperty = options.enabledRangeProperty;

    // @private
    thisTrack.disabledTrack = new Rectangle( 0, 0, options.trackSize.width, options.trackSize.height, {
      fill: options.trackFillDisabled,
      stroke: options.trackStroke,
      lineWidth: options.trackLineWidth
    } );
    thisTrack.addChild( thisTrack.disabledTrack );

    // @private
    thisTrack.enabledTrack = new Rectangle( 0, 0, options.trackSize.width, options.trackSize.height, { 
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
        var value = valueToPosition.inverse( x );
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
          if( typeof options.snapValue === 'number' ) {
            snapToValue( options.snapValue );
          }
          options.endDrag();
        }
      }
    } );
    thisTrack.enabledTrack.addInputListener( trackInputListener );

    // @private enable/disable
    var enabledObserver = function( enabled ) {
      thisTrack.cursor = thisTrack.enabledProperty.get() ? options.cursor : 'default';
      thisTrack.enabledTrack.visible = enabled;
      if ( !enabled ) {
        if ( trackInputListener.dragging ) { trackInputListener.endDrag(); }
      }
    };
    thisTrack.enabledProperty.link( enabledObserver ); // must be unlinked in disposeSliderTrack

    // when the range changes, update the geometry of the 'enabled' rectangle
    var enabledRangeObserver = function( enabledRange ) {
      var minPosition = valueToPosition( enabledRange.min );
      var maxPosition = valueToPosition( enabledRange.max );
      var enabledWidth = maxPosition - minPosition;
      thisTrack.enabledTrack.setRect( minPosition, 0, enabledWidth, thisTrack.options.trackSize.height );
    };
    this.enabledRangeProperty.link( enabledRangeObserver ); // must be unlinked in disposeSliderTrack  

    // @private Called by dispose
    this.disposeSliderTrack = function() {
      thisTrack.enabledProperty.unlink( enabledObserver );
      thisTrack.enabledRangeProperty.unlink( enabledRangeObserver );
      options.tandem && options.tandem.removeInstance( thisTrack );
      trackInputListener.dispose();
    };

    thisTrack.mutate( options );

    options.tandem && options.tandem.addInstance( this );
  }

  sun.register( 'SliderTrack', SliderTrack );

  inherit( Node, SliderTrack, {

    // @public - ensures that this object is eligible for GC
    dispose: function() {
      this.disposeSliderTrack();
    },

    // @public
    setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this.setEnabled( value ); },

    // @public
    getEnabled: function() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); },

    setEnabledRange: function( enabledRange ) {
      this.enabledRangeProperty.value = enabledRange;
    },
    set enabledRange( enabledRange ) { this.setEnabledRange( enabledRange ); },

    getEnabledRange: function() { return this.enabledRangeProperty.value; },
    get enabledRange() { return this.getEnabledRange(); }

  } );

  return SliderTrack;
} );