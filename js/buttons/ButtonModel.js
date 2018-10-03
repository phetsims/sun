// Copyright 2014-2017, University of Colorado Boulder

/**
 * Base class for button models, which describe the behavior of buttons when users interact with them.  Property values
 * are set by an associated listener, see ButtonListener for details.
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var PressListener = require( 'SCENERY/listeners/PressListener' );
  var Property = require( 'AXON/Property' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

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

      tandem: Tandem.required,
      phetioState: PhetioObject.DEFAULT_OPTIONS.phetioState, // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
    }, options );

    var self = this;

    // model properties
    this.overProperty = new BooleanProperty( false ); // @public - Is the pointer over the button?
    this.downProperty = new BooleanProperty( false, { reentrant: true } ); // @public - Is the pointer down?

    // @public - This Property was added for a11y. It tracks whether or not the button should "look" down. This
    // will be true if downProperty is true or if an a11y click is in progress. For an a11y click, the listeners
    // are fired right away but the button will look down for as long as PressListener.a11yLooksPressedInterval.
    // See PressListener.click for more details.
    this.looksPressedProperty = new BooleanProperty( false );

    // @public - Is the button enabled?
    this.enabledProperty = new BooleanProperty( options.enabled, {
      phetioState: options.phetioState,
      phetioReadOnly: options.phetioReadOnly,
      tandem: options.tandem.createTandem( 'enabledProperty' ),
      phetioInstanceDocumentation: 'When disabled, the button is grayed out and cannot be pressed'
    } );

    // @private - keep track of and store all listeners this model creates
    this.listeners = [];

    // @private {Multilink|null} - Links all of the looksPressedProperties from the listeners that were created
    // by this ButtonModel, and updates the looksPressedProperty accordingly. First Multilink is added when the
    // first listener is created. See this.createListener.
    this.looksPressedMultilink = null;

    // startCallback on pointer down, endCallback on pointer up. lazyLink so they aren't called immediately.
    this.downProperty.lazyLink( function( down ) {
      if ( down ) {
        options.startCallback();
      }
      else {
        options.endCallback( self.overProperty.get() );
      }
    } );

    // interrupt listeners when enabled is set to false
    this.enabledProperty.link( function( enabled ) {
      if ( !enabled ) {
        for ( var i = 0; i < self.listeners.length; i++ ) {
          var listener = self.listeners[ i ];
          listener.interrupt && listener.interrupt();
        }
      }
    } );

    // @private
    this.disposeButtonModel = function() {

      // This will unlink all listeners, causing potential issues if listeners try to unlink properties afterwards
      this.overProperty.dispose();
      this.downProperty.dispose();
      this.enabledProperty.dispose();

      this.looksPressedMultilink && this.looksPressedMultilink.dispose();

      this.listeners = [];
    };
  }

  sun.register( 'ButtonModel', ButtonModel );

  return inherit( Object, ButtonModel, {

    /**
     * @public
     */
    dispose: function() {
      this.disposeButtonModel();
    },

    /**
     * Creates a standard button listener that can be added to a node and that will trigger the changes to this model.
     * @param {Object} [options]
     * @returns {PressListener}
     * @public
     */
    createListener: function( options ) {
      var self = this;

      options = _.extend( {
        phetioInstanceDocumentation: 'Indicates when the button has been pressed or released',
        canStartPress: function() {
          return self.enabledProperty.value;
        }
      }, options );

      var pressListener = new PressListener( options );
      this.listeners.push( pressListener );

      pressListener.isPressedProperty.link( this.downProperty.set.bind( this.downProperty ) );
      pressListener.isOverProperty.link( this.overProperty.set.bind( this.overProperty ) );

      // dispose the previous multilink in case we already created a PressListener with this model
      this.looksPressedMultilink && this.looksPressedMultilink.dispose();

      // assign a new Multilink (for disposal), and make sure that the button looks pressed when any of the
      // PressListeners created by this ButtonModel look pressed
      function orIteratee( sum, newValue ) {
        return sum || newValue;
      }
      this.looksPressedMultilink = Property.multilink(
        self.listeners.map( function( listener ) { return listener.looksPressedProperty; } ), function() {
          self.looksPressedProperty.value = _.reduce( arguments, orIteratee );
        }
      );

      return pressListener;
    }
  } );
} );