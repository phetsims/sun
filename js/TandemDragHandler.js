// Copyright 2015, University of Colorado Boulder

/**
 * SimpleDragHandler subclass that adds tandem registration and PhET-iO event emission.
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Brand = require( 'BRAND/Brand' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function TandemDragHandler( options ) {

    // NOTE: supertype options start/end/drag will be wrapped to provide PhET-iO instrumentation.
    options = _.extend( {
      tandem: null
    }, options );

    // Generate all emitters in every case to minimize the number of hidden classes,
    // see http://www.html5rocks.com/en/tutorials/speed/v8/
    this.startedCallbacksForDragStartedEmitter = new Emitter(); // @public (phet-io)
    this.endedCallbacksForDragStartedEmitter = new Emitter(); // @public (phet-io)

    this.startedCallbacksForDraggedEmitter = new Emitter(); // @public (phet-io)
    this.endedCallbacksForDraggedEmitter = new Emitter(); // @public (phet-io)

    this.startedCallbacksForDragEndedEmitter = new Emitter(); // @public (phet-io)
    this.endedCallbacksForDragEndedEmitter = new Emitter(); // @public (phet-io)

    var optionsCopy = _.clone( options );

    // For non-phet-io brands, skip tandem callbacks to save CPU
    if ( Brand.id === 'phet-io' ) {
      var tandemDragHandler = this;

      // Wrap start/end/drag options (even if they did not exist) to get the PhET-iO instrumentation.
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

        // drag end may be triggered programatically and hence event and trail may be undefined
        tandemDragHandler.startedCallbacksForDragEndedEmitter.emit();
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