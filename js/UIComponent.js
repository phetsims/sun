// Copyright 2016, University of Colorado Boulder

//TODO Not ready for production use. See https://github.com/phetsims/sun/issues/257
//TODO Is it reasonable to think that we can add other common behavior here, or should this be just enabled/disabled?
/**
 * Base type for UI components, contains behavior/implementation that they have in common, including:
 *
 * - enabled/disabled
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

  /**
   * @param {Object} [options]
   * @constructor
   */
  function UIComponent( options ) {

    options = _.extend( {
      enabledProperty: new Property( true ),

      // {number} opacity used by the default implementation of updateEnabled to make the component look disabled
      disabledOpacity: 0.5
    }, options );

    // validate options
    assert && assert( options.disabledOpacity >= 0 && options.disabledOpacity <= 1,
      'invalid disabledOpacity: ' + options.disabledOpacity );

    var self = this;

    Node.call( this );

    // @public (read-only)
    this.enabledProperty = options.enabledProperty;

    // enable/disable the UI component
    var enabledObserver = function( enabled ) {
      self.updateEnabled( enabled, options );
    };
    this.enabledProperty.link( enabledObserver );

    // @private called by dispose
    this.disposeMyComponent = function() {
      self.enabledProperty.unlink( enabledObserver );
    };

    this.mutate( options );
  }

  sun.register( 'UIComponent', UIComponent );

  return inherit( Node, UIComponent, {

    // @public
    dispose: function() { this.disposeMyComponent(); },

    // @public
    setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this.setEnabled( value ); },

    // @public
    getEnabled: function() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); },

    //TODO Since this is a base type (not intended by for direct instantiation) is subtype override preferable to providing this function via options?
    //TODO Does passing in constructor options provide useful flexibility or create problems?
    /**
     * Default strategy for enabling/disabling a UI component. Override this to change the behavior.
     *
     * @param {boolean} enabled
     * @param {Object} options - options that were passed to the constructor
     * @protected
     */
    updateEnabled: function( enabled, options ) {

      //TODO using pickable is problematic, what are the alternatives?
      this.pickable = enabled;
      this.opacity = enabled ? 1.0 : options.disabledOpacity;
    }
  } );
} );
