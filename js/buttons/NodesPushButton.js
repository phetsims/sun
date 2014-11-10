// Copyright 2002-2014, University of Colorado Boulder

/**
 * A push button whose appearance is based on a set of scenery Nodes.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // import
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {Node} upNode
   * @param {Node} overNode
   * @param {Node} downNode
   * @param {Node} disabledNode
   * @param {Object} [options]
   * @constructor
   */
  function NodesPushButton( upNode, overNode, downNode, disabledNode, options ) {

    options = _.extend( {
      cursor: 'pointer', // {string}
      enabled: true, // {boolean}
      listener: null // {function}
    }, options );

    var thisButton = this;

    // @private nodes for each state
    thisButton.upNode = upNode;
    thisButton.overNode = overNode;
    thisButton.downNode = downNode;
    thisButton.disabledNode = disabledNode;

    thisButton.state = 'up'; // @private {string}
    thisButton.enabledProperty = new Property( options.enabled ); // @private
    thisButton.listeners = []; // @private {[function]}
    if ( options.listener ) { thisButton.listeners.push( options.listener ); }

    options.children = [ upNode, overNode, downNode, disabledNode ];
    Node.call( thisButton, options );

    thisButton.addInputListener( new ButtonListener( {

      up: function() { thisButton.update( 'up' ); },

      over: function() { thisButton.update( 'over' ); },

      down: function() { thisButton.update( 'down' ); },

      out: function() { thisButton.update( 'up' ); }, // 'out' looks the same as 'up'

      fire: function() {
        if ( thisButton.enabledProperty.get() ) {
          thisButton.notifyListeners();
        }
      }
    } ) );

    thisButton.enabledProperty.link( function( enabled ) {
      thisButton.cursor = enabled ? options.cursor : 'default';
      thisButton.update( thisButton.state );
    } );
  }

  return inherit( Node, NodesPushButton, {

    // Adds a {function} listener. If already a listener, this is a no-op.
    addListener: function( listener ) {
      if ( this.listeners.indexOf( listener ) === -1 ) {
        this.listeners.push( listener );
      }
    },

    // Remove a {function} listener. If not a listener, this is a no-op.
    removeListener: function( listener ) {
      var i = this.listeners.indexOf( listener );
      if ( i !== -1 ) {
        this.listeners.splice( i, 1 );
      }
    },

    // @private Notifies listeners.
    notifyListeners: function() {
      var listenersCopy = this.listeners.slice( 0 );
      for ( var i = 0; i < listenersCopy.length; i++ ) {
        listenersCopy[i]();
      }
    },

    // @private Updates the button to match the specified {string} state.
    update: function( state ) {
      this.state = state;
      var enabled = this.enabledProperty.get();
      this.upNode.visible = ( state === 'up' && enabled );
      this.overNode.visible = ( state === 'over' && enabled );
      this.downNode.visible = ( state === 'down' && enabled );
      this.disabledNode.visible = !enabled;
    },

    set enabled( value ) {
      assert && assert( typeof value === 'boolean', 'enabled must be a boolean value' ); // Scenery complains about visible otherwise
      this.enabledProperty.set( value );
    },

    get enabled() { return this.enabledProperty.get(); }
  }, {

    /**
     * Creates a button based on image files.
     * @param {HTMLImageElement} upImage
     * @param {HTMLImageElement} overImage
     * @param {HTMLImageElement} downImage
     * @param {HTMLImageElement} disabledImage
     * @param {Object} [options]
     * @returns {NodesPushButton}
     * @static
     */
    createImageButton: function( upImage, overImage, downImage, disabledImage, options ) {
       return new NodesPushButton( new Image( upImage ), new Image( overImage ), new Image( downImage ), new Image( disabledImage ), options );
    }
  } );
} );