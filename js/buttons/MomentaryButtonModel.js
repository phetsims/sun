// Copyright 2015-2017, University of Colorado Boulder

/**
 * Model for a momentary button: on when pressed, off when released.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} valueProperty
   * @param {Object} options
   * @constructor
   */
  function MomentaryButtonModel( valueOff, valueOn, valueProperty, options ) {
    options = _.extend( {
      tandem: Tandem.optional,
      phetioEventSource: null // {PhetioObject|null} sends events to the PhET-iO data stream
    }, options );
    var self = this;
    ButtonModel.call( self );

    // sync with the property, do this before wiring up to supertype properties
    var onObserver = function( value ) {
      self.downProperty.set( value === valueOn );
    };
    valueProperty.link( onObserver );

    var processingRelease = false;

    var downListener = function( down ) {

      // turn on when pressed (if enabled)
      if ( down ) {
        if ( self.enabledProperty.get() ) {
          options.phetioEventSource && options.phetioEventSource.startEvent( 'user', 'pressed' );
          valueProperty.set( valueOn );
          options.phetioEventSource && options.phetioEventSource.endEvent();
        }
      }
      else {

        // turn off when released
        options.phetioEventSource && options.phetioEventSource.startEvent( 'user', 'released' );
        processingRelease = true;
        valueProperty.set( valueOff );
        options.phetioEventSource && options.phetioEventSource.endEvent();
        processingRelease = false;
      }
    };
    this.downProperty.lazyLink( downListener );

    // turn off when disabled
    var enabledListener = function( enabled ) {

      // If the button became disabled (and not as a result of pressing the button itself), trigger an event
      // and change the value
      if ( !enabled && !processingRelease ) {
        options.phetioEventSource && options.phetioEventSource.startEvent( 'user', 'releasedDisabled' );
        valueProperty.set( valueOff );
        options.phetioEventSource && options.phetioEventSource.endEvent();
      }
    };
    this.enabledProperty.link( enabledListener );

    // @private: just for dispose.  Named based on the type name so it won't have a name collision with parent/child ones
    this.disposeMomentaryButtonModel = function() {
      self.enabledProperty.unlink( enabledListener );
      self.downProperty.unlink( downListener );
      valueProperty.unlink( onObserver );
    };
  }

  sun.register( 'MomentaryButtonModel', MomentaryButtonModel );

  return inherit( ButtonModel, MomentaryButtonModel, {

    // @public - Ensures that this model is eligible for GC.
    dispose: function() {
      this.disposeMomentaryButtonModel();
      ButtonModel.prototype.dispose.call( this ); //TODO fails with assertions enabled, see sun#212
    }
  } );
} );