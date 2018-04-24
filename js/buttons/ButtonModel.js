// Copyright 2014-2017, University of Colorado Boulder

/**
 * Base class for button models, which describe the behavior of buttons when users interact with them.  Property values
 * are set by an associated listener, see ButtonListener for details.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PressListener = require( 'SCENERY/listeners/PressListener' );
  var Property = require( 'AXON/Property' );
  var sun = require( 'SUN/sun' );
  var Timer = require( 'PHET_CORE/Timer' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function ButtonModel( options ) {

    options = _.extend( {
      // {function} called on pointer down
      startCallback: function() {},
      // {function} called on pointer up, @param {boolean} over - indicates whether the pointer was released over the button
      endCallback: function( over ) {},
      // {boolean} is the button enabled?
      enabled: true,

      // a11y
      fireOnHoldInterval: 100 // fire continuously at this interval in ms when holding down button with keyboard
    }, options );

    var self = this;

    // model properties
    this.overProperty = new Property( false ); // @public - Is the pointer over the button?
    this.downProperty = new Property( false ); // @public - Is the pointer down?
    this.enabledProperty = new Property( options.enabled ); // @public - Is the button enabled?

    // @private {number}
    this._fireOnHoldInterval = options.fireOnHoldInterval;

    // startCallback on pointer down, endCallback on pointer up. lazyLink so they aren't called immediately.
    this.downProperty.lazyLink( function( down ) {
      if ( down ) {
        options.startCallback();
      }
      else {
        options.endCallback( self.overProperty.get() );
      }
    } );
  }

  sun.register( 'ButtonModel', ButtonModel );

  return inherit( Object, ButtonModel, {

    /**
     * Click the button by pressing the button down and then releasing after a timeout. When assistive technology is
     * used, the browser does not receive 'down' or 'up' events on buttons - only a single 'click' event. For a11y we
     * need to toggle the pressed state every 'click' event.
     * @param {function} [endListener] - optional function to be called once the button has been released after
     *                                   accessibility related interaction.
     * @public
     */
    a11yClick: function( endListener ) {
      if ( !this.downProperty.get() && this.enabledProperty.get() ) {

        // ensure that button is 'over' so listener can be called while button is down
        this.overProperty.set( true );
        this.downProperty.set( true );

        var self = this;
        Timer.setTimeout( function() {

          // no longer down, don't reset 'over' so button can be styled as long as it has focus
          self.downProperty.set( false );

          endListener && endListener();
        }, self._fireOnHoldInterval );
      }
    },

    /**
     * Button is no longer considered over on blur, unless blur was initiated by a 'down' event.
     *
     * @public
     */
    a11yBlur: function() {
      if ( !this.downProperty.get() ) {
        this.overProperty.value = false;
      }
    },

    /**
     * Creates a standard button listener that can be added to a node and that will trigger the changes to this model.
     * @param {Tandem} tandem
     * @returns {PressListener}
     * @public
     */
    createListener: function( tandem ) {
      var self = this;

      return new PressListener( {
        tandem: tandem,
        isPressedProperty: this.downProperty,
        isOverProperty: this.overProperty,
        canStartPress: function() {
          return self.enabledProperty.value;
        }
      } );
    }
  } );
} );