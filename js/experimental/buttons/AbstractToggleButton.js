// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base type for buttons.  This provides a property that can be monitored by
 * descendant classes to modify the appearance of the button as the user
 * interacts with it, and also handles firing of the listener functions.
 *
 */
define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ButtonListener = require( 'SUN/experimental/buttons/ButtonListener' );
  var ToggleButtonModel = require( 'SUN/experimental/buttons/ToggleButtonModel' );

  /**
   * @param {Property} booleanProperty
   * @param {Object} options
   * @constructor
   */
  function AbstractToggleButton( booleanProperty, options ) {

    var thisButton = this;
    Node.call( this, options );

    // Hook up the button model.
    this.buttonModel = new ToggleButtonModel( { toggleOnDown: typeof options.toggleOnDown === 'undefined' ? true : options.toggleOnDown } );
    this.addInputListener( new ButtonListener( this.buttonModel ) );

    // accessibility
    this.addPeer( '<input type="button" aria-label="' + _.escape( options.label ) + '">',
      { click: thisButton.booleanProperty.toggleFunction}
    );
  }

  return inherit( Node, AbstractToggleButton,
    {
      addListener: function( listener ) {
        // Pass through to button model.
        this.buttonModel.addListener( listener );
      },

      removeListener: function( listener ) {
        // Pass through to button model.
        this.buttonModel.removeListener( listener );
      },

      set enabled( value ) {
        assert && assert( typeof value === 'boolean', 'AbstractToggleButton.enabled must be a boolean value' );
        this.buttonModel.enabled = value;
      },

      get enabled() { return this.buttonModel.enabled; }
    } );
} );