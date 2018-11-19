// Copyright 2014-2018, University of Colorado Boulder

/**
 * A push button whose appearance is based on a set of scenery Nodes, one node for each button 'interaction state'.
 * Unlike other sun buttons, this button does not have a separate 'view' type, because the Nodes provided determine
 * the appearance of the button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // import
  var ButtonInteractionState = require( 'SUN/buttons/ButtonInteractionState' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Node} idleNode
   * @param {Node} overNode
   * @param {Node} pressedNode
   * @param {Node} disabledNode
   * @param {Object} [options]
   * @constructor
   */
  function NodesPushButton( idleNode, overNode, pressedNode, disabledNode, options ) {

    options = _.extend( {
      cursor: 'pointer', // {string}
      listener: null, // {function}
      xAlign: 'center', // {string} how the nodes are horizontally aligned: center, left, right
      yAlign: 'center', // {string} how the nodes are vertically aligned: center, top, bottom
      tandem: Tandem.required
    }, options );
    options.children = [ idleNode, overNode, pressedNode, disabledNode ];

    Node.call( this );

    // @private - Button model
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    this.buttonModel = new PushButtonModel( options ); // @private

    // @private {PressListener}
    this.pressListener = this.buttonModel.createListener( { tandem: options.tandem.createTandem( 'pressListener' ) } );
    this.addInputListener( this.pressListener );

    // Button interactions
    var interactionStateProperty = new PushButtonInteractionStateProperty( this.buttonModel );
    interactionStateProperty.link( function( interactionState ) {
      idleNode.visible = ( interactionState === ButtonInteractionState.IDLE );
      overNode.visible = ( interactionState === ButtonInteractionState.OVER );
      pressedNode.visible = ( interactionState === ButtonInteractionState.PRESSED );
      disabledNode.visible = ( interactionState === ButtonInteractionState.DISABLED );
    } );

    //TODO this alignment feature would be useful to extract into a general layout node
    // Alignment of nodes
    var nodes = options.children;
    assert && assert( nodes.length > 0 );
    for ( var i = 1; i < nodes.length; i++ ) {

      // x alignment
      switch( options.xAlign ) {
        case 'center':
          nodes[ i ].centerX = nodes[ 0 ].centerX;
          break;
        case 'left':
          nodes[ i ].left = nodes[ 0 ].left;
          break;
        case 'right':
          nodes[ i ].right = nodes[ 0 ].right;
          break;
        default:
          throw new Error( 'unsupported xAlign: ' + options.xAlign );
      }

      // y alignment
      switch( options.yAlign ) {
        case 'center':
          nodes[ i ].centerY = nodes[ 0 ].centerY;
          break;
        case 'top':
          nodes[ i ].top = nodes[ 0 ].top;
          break;
        case 'bottom':
          nodes[ i ].bottom = nodes[ 0 ].bottom;
          break;
        default:
          throw new Error( 'unsupported yAlign: ' + options.yAlign );
      }
    }

    this.mutate( options );
  }

  sun.register( 'NodesPushButton', NodesPushButton );

  return inherit( Node, NodesPushButton, {

    // @public
    dispose: function() {
      //TODO implement this, see sun#212
      this.pressListener.dispose();
      Node.prototype.dispose.call( this );
    },

    // @public - Adds a {function} listener.
    addListener: function( listener ) { this.buttonModel.addListener( listener ); },

    // @public - Removes a {function} listener.
    removeListener: function( listener ) { this.buttonModel.removeListener( listener ); },

    // @public - Enables or disables the button.
    set enabled( value ) { this.buttonModel.enabledProperty.set( !!value ); },

    // @public - Is the button enabled?
    get enabled() { return this.buttonModel.enabledProperty.get(); }
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
     * @public
     */
    createImageButton: function( upImage, overImage, downImage, disabledImage, options ) {
      return new NodesPushButton( new Image( upImage ), new Image( overImage ), new Image( downImage ), new Image( disabledImage ), options );
    }
  } );
} );