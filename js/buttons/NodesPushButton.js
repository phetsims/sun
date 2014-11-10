// Copyright 2002-2014, University of Colorado Boulder

/**
 * A push button whose appearance is based on a set of scenery Nodes.
 * Unlike other sun buttons, this type does not have a separate 'view' type, because the Nodes
 * provided determine the look of the button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // import
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );

  /**
   * @param {Node} upNode
   * @param {Node} overNode
   * @param {Node} pressedNode
   * @param {Node} disabledNode
   * @param {Object} [options]
   * @constructor
   */
  function NodesPushButton( idleNode, overNode, pressedNode, disabledNode, options ) {

    options = _.extend( {
      cursor: 'pointer', // {string}
      enabled: true, // {boolean}
      listener: null // {function}
    }, options );
    options.children = [ idleNode, overNode, pressedNode, disabledNode ];

    Node.call( this );

    // Button model
    this.buttonModel = new PushButtonModel( options ); // @private
    this.addInputListener( new ButtonListener( this.buttonModel ) );

    // Button interactions
    var interactionStateProperty = new PushButtonInteractionStateProperty( this.buttonModel );
    interactionStateProperty.link( function( interactionState ) {
      idleNode.visible = ( interactionState === 'idle' );
      overNode.visible = ( interactionState === 'over' );
      pressedNode.visible = ( interactionState === 'pressed' );
      disabledNode.visible = ( interactionState === 'disabled' );
    } );

    this.mutate( options );
  }

  return inherit( Node, NodesPushButton, {

    // Adds a {function} listener.
    addListener: function( listener ) { this.buttonModel.addListener( listener ); },

    // Remove a {function} listener.
    removeListener: function( listener ) { this.buttonModel.removeListener( listener ); },

    set enabled( value ) { this.buttonModel.enabled = !!value; },

    get enabled() { return this.buttonModel.enabled; }
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