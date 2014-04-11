// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base type for buttons.  This provides a property that can be monitored by
 * descendant classes to modify the appearance of the button as the user
 * interacts with it, and also handles firing of the listener functions.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // Imports
  var PushButtonModel = require( 'SUN/experimental/buttons/PushButtonModel' );
  var ButtonListener = require( 'SUN/experimental/buttons/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param options
   * @constructor
   */
  function AbstractPushButton( options ) {

    var thisButton = this;
    options = _.extend(
      {
        fireOnDown: false,
        listener: null
      }, options );

    Node.call( this, options );

    // Hook up the button model.
    this.buttonModel = new PushButtonModel( { listener: options.listener, fireOnDown: options.fireOnDown } );
    this.addInputListener( new ButtonListener( this.buttonModel ) );

    // accessibility
    this.addPeer( '<input type="button" aria-label="' + _.escape( options.label ) + '">',
      { click: thisButton.buttonModel.fire.bind( thisButton ) }
    );
  }

  return inherit( Node, AbstractPushButton,
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
        assert && assert( typeof value === 'boolean', 'AbstractPushButton.enabled must be a boolean value' );
        this.buttonModel.enabled = value;
      },

      get enabled() { return this.buttonModel.enabled; }
    } );
} );