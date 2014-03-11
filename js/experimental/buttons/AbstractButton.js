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
  var ButtonModel = require( 'SUN/experimental/buttons/ButtonModel' );
  var DownUpListener = require( 'SCENERY/input/DownUpListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );

  /**
   * @param options
   * @constructor
   */
  function AbstractButton( options ) {

    var thisButton = this;
    options = _.extend(
      {
        fireOnDown: false,
        listener: null
      }, options );

    Node.call( this, options );

    // Hook up the button model.
    this.buttonModel = new ButtonModel( { listener: options.listener, fireOnDown: options.fireOnDown } );
    this.addInputListener( this.buttonModel );    // accessibility

    // accessibility
    this.addPeer( '<input type="button" aria-label="' + _.escape( options.label ) + '">',
      { click: thisButton.buttonModel.fire.bind( thisButton ) }
    );
  }

  return inherit( Node, AbstractButton,
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
        assert && assert( typeof value === 'boolean', 'AbstractButton.enabled must be a boolean value' );
        this.buttonModel.enabled = value;
      },

      get enabled() { return this.buttonModel.enabled; }
    } );
} );