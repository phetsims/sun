// Copyright 2015, University of Colorado Boulder

/**
 * SimpleDragHandler subclass that adds tandem registration and together event emission.
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Emitter = require( 'AXON/Emitter' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var sun = require( 'SUN/sun' );
  var Brand = require( 'BRAND/Brand' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function TandemDragHandler( options ) {

    options = _.extend( {
      tandem: null

      /* Please see additional options described in the super type*/
    }, options );

    // Generate all emitters in every case to minimize the number of hidden classes,
    // see http://www.html5rocks.com/en/tutorials/speed/v8/
    this.startedCallbacksForDragStartedEmitter = new Emitter(); // @public (together)
    this.endedCallbacksForDragStartedEmitter = new Emitter(); // @public (together)

    this.startedCallbacksForDraggedEmitter = new Emitter(); // @public (together)
    this.endedCallbacksForDraggedEmitter = new Emitter(); // @public (together)

    this.startedCallbacksForDragEndedEmitter = new Emitter(); // @public (together)
    this.endedCallbacksForDragEndedEmitter = new Emitter(); // @public (together)

    var optionsCopy = _.clone( options );

    // For non-phet-io brands, skip tandem callbacks to save CPU
    if ( Brand.id === 'phet-io' ) {
      var tandemDragHandler = this;

      // Replace start/end/drag even if they did not exist, to get the tracking.
      optionsCopy.start = function( event, trail ) {
        tandemDragHandler.startedCallbacksForDragStartedEmitter.emit2( event.pointer.point.x, event.pointer.point.y );
        options.start && options.start( event, trail );
        tandemDragHandler.endedCallbacksForDragStartedEmitter.emit();
      };

      optionsCopy.drag = function( event, trail ) {
        tandemDragHandler.startedCallbacksForDraggedEmitter.emit2( event.pointer.point.x, event.pointer.point.y );
        options.drag && options.drag( event, trail );
        tandemDragHandler.endedCallbacksForDraggedEmitter.emit();
      };

      optionsCopy.end = function( event, trail ) {
        tandemDragHandler.startedCallbacksForDragEndedEmitter.emit2( event.pointer.point.x, event.pointer.point.y );
        options.end && options.end( event, trail );
        tandemDragHandler.endedCallbacksForDragEndedEmitter.emit();
      };
    }

    SimpleDragHandler.call( this, optionsCopy );

    options.tandem && options.tandem.addInstance( this );

    // @private
    this.disposeTandemDragHandler = function() {
      options.tandem && options.tandem.removeInstance( tandemDragHandler );
    };
  }

  sun.register( 'TandemDragHandler', TandemDragHandler );

  return inherit( SimpleDragHandler, TandemDragHandler, {

    // @public
    dispose: function() {
      this.disposeTandemDragHandler();
    }
  } );
} );