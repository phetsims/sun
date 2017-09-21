// Copyright 2016-2017, University of Colorado Boulder

//TODO Not ready for production use. See https://github.com/phetsims/sun/issues/257
/**
 * Base type for UI components, contains behavior/implementation that they have in common, including:
 *
 * - enable/disable
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function UIComponent( options ) {

    var self = this;

    options = _.extend( {

      // {Property.<boolean>} client can either provide their own Property, or use this.enabledProperty
      enabledProperty: new Property( true ),

      // {number} opacity used by the default implementation of enabledObserver to make the component look disabled
      disabledOpacity: 0.5,

      // {function} default strategy for enabling/disabling a UI component
      enabledObserver: function( enabled ) {
        self.inputEnabled = enabled;
        self.opacity = enabled ? 1.0 : self.disabledOpacity;
      }

    }, options );

    // validate options
    assert && assert( options.disabledOpacity >= 0 && options.disabledOpacity <= 1,
      'invalid disabledOpacity: ' + options.disabledOpacity );
    Tandem.indicateUninstrumentedCode();

    Node.call( this );

    // @public (read-only)
    this.enabledProperty = options.enabledProperty;

    // @private
    this.disabledOpacity = options.disabledOpacity;

    // enable/disable the UI component
    this.enabledProperty.link( options.enabledObserver );

    // @private called by dispose
    this.disposeUIComponent = function() {
      self.enabledProperty.unlink( options.enabledObserver );
    };

    this.mutate( options );
  }

  sun.register( 'UIComponent', UIComponent );

  return inherit( Node, UIComponent, {

    // @public
    dispose: function() {
      this.disposeUIComponent();
      Node.prototype.dispose.call( this );
    },

    // @public
    setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this.setEnabled( value ); },

    // @public
    getEnabled: function() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); }
  } );
} );
