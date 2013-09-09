// Copyright 2002-2013, University of Colorado Boulder

/**
 * Base class for push buttons that give visual feedback about their state.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // import
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {Node} upNode
   * @param {Node} overNode
   * @param {Node} downNode
   * @param {Node} disabledNode
   * @param {function} callback
   * @param {object} options
   * @constructor
   */
  function PushButton( upNode, overNode, downNode, disabledNode, callback, options ) {

    options = _.extend( {
        cursor: 'pointer',
        label: 'Button',
        enabled: true
      },
      options );

    var thisButton = this;
    Node.call( thisButton );

    // nodes for each state
    thisButton._upNode = upNode;
    thisButton._overNode = overNode;
    thisButton._downNode = downNode;
    thisButton._disabledNode = disabledNode;

    thisButton._state = 'up';
    thisButton._enabled = new Property( options.enabled );
    thisButton._listeners = [ callback ];

    thisButton.addChild( upNode );
    thisButton.addChild( overNode );
    thisButton.addChild( downNode );
    thisButton.addChild( disabledNode );

    thisButton.addInputListener( new ButtonListener( {

      up: function() {
        thisButton._state = 'up';
        thisButton._update();
      },

      over: function() {
        thisButton._state = 'over';
        thisButton._update();
      },

      down: function() {
        thisButton._state = 'down';
        thisButton._update();
      },

      out: function() {
        thisButton._state = 'up'; //NOTE: 'out' state looks the same as 'up'
        thisButton._update();
      },

      fire: function() {
        thisButton._fire();
      }
    } ) );

    // accessibility
    thisButton.addPeer( '<input type="button" aria-label="' + _.escape( options.label ) + '">',
      { click: thisButton._fire.bind( thisButton ) }
    );

    thisButton._enabled.link( function( enabled ) {
      thisButton.cursor = enabled ? options.cursor : 'default';
      thisButton._update();
    } );

    //Mutate with the options after the layout is complete so that you can use width-dependent fields like centerX, etc.
    thisButton.mutate( options );
  }

  return inherit( Node, PushButton, {

    // Adds a listener. If already a listener, this is a no-op.
    addListener: function( listener ) {
      if ( this._listeners.indexOf( listener ) === -1 ) {
        this._listeners.push( listener );
      }
    },

    // Remove a listener. If not a listener, this is a no-op.
    removeListener: function( listener ) {
      var i = this._listeners.indexOf( listener );
      if ( i !== -1 ) {
        this._listeners.splice( i, 1 );
      }
    },

    _fire: function() {
      this._listeners.forEach( function( listener ) {
        listener();
      } );
    },

    _update: function() {
      // use visible instead of add/removeChild to prevent flickering
      var enabled = this._enabled.get();
      this._upNode.visible = ( this._state === 'up' && enabled );
      this._downNode.visible = ( this._state === 'down' && enabled );
      this._overNode.visible = ( this._state === 'over' && enabled );
      this._disabledNode.visible = !enabled;
    },

    set enabled( value ) { this._enabled.set( value ); },

    get enabled() { return this._enabled.get(); }
  } );
} );
