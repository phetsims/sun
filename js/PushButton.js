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
        label: 'Button'
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
    thisButton._enabled = new Property( true );
    thisButton._listeners = [ callback ];

    // state nodes are attached to a parent, so we still addChild to a button without worrying about affects of removing children
    thisButton._parent = new Node();
    thisButton._parent.addChild( upNode );
    thisButton.addChild( thisButton._parent );

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
      this._parent.removeAllChildren();
      if ( this._enabled.get() ) {
        if ( this._state === 'up' ) {
          this._parent.addChild( this._upNode );
        }
        else if ( this._state === 'over' ) {
          this._parent.addChild( this._overNode );
        }
        else if ( this._state === 'down' ) {
          this._parent.addChild( this._downNode );
        }
        else {
          throw new Exception( "unsupported state: " + this._state );
        }
      }
      else {
        this._parent.addChild( this._disabledNode );
      }
    },

    set enabled( value ) { this._enabled.set( value ); },

    get enabled() { return this._enabled.get(); }
  } );
} );
