// Copyright 2002-2014, University of Colorado Boulder

/**
 * Push Button - prototype of a version that draws gradients and such in order
 * to try to get a somewhat 2D effect.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Includes
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var ButtonModel = require( 'SUN/experimental/buttons/ButtonModel' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.

  /**
   * @param {Node} content - Node to put on surface of button, could be text, icon, or whatever
   * @param {Object} options
   * @constructor
   */
  function RectangularPushButton( content, options ) {

    var thisButton = this;
    Node.call( thisButton );

    options = _.extend( {
      // Default values.
      cursor: 'pointer',
      cornerRounding: 4,
      baseColor: new Color( 153, 206, 255 ),
      disabledBaseColor: new Color( 220, 220, 220 ),
      xPadding: 5,
      yPadding: 5,
      touchAreaExpansionFactor: 1.3,
      listener: null,
      fireOnDown: false
    }, options );

    thisButton.buttonWidth = content.width + options.xPadding * 2;
    thisButton.buttonHeight = content.height + options.yPadding * 2;
    thisButton.baseColor = options.baseColor;
    thisButton.disabledBaseColor = options.disabledBaseColor;
    thisButton.label = content;
    thisButton.upCenter = new Vector2( thisButton.buttonWidth / 2, thisButton.buttonHeight / 2 );
    thisButton.downCenter = thisButton.upCenter;

    var verticalHighlightStop = HIGHLIGHT_GRADIENT_LENGTH / thisButton.buttonHeight;
    var verticalShadowStop = 1 - SHADE_GRADIENT_LENGTH / thisButton.buttonHeight;
    var horizontalHighlightStop = HIGHLIGHT_GRADIENT_LENGTH / thisButton.buttonWidth;
    var horizontalShadowStop = 1 - SHADE_GRADIENT_LENGTH / thisButton.buttonWidth;

    // Gradient fills used for various button states
    thisButton.upFillVertical = new LinearGradient( 0, 0, 0, thisButton.buttonHeight )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, thisButton.baseColor )
      .addColorStop( verticalShadowStop, thisButton.baseColor )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.5 ) );

    var transparentBaseColor = new Color( thisButton.baseColor.getRed(), thisButton.baseColor.getGreen(), thisButton.baseColor.getBlue(), 0 );
    thisButton.upFillHorizontal = new LinearGradient( 0, 0, thisButton.buttonWidth, 0 )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( horizontalHighlightStop, transparentBaseColor )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.5 ) );

    thisButton.overFillVertical = new LinearGradient( 0, 0, 0, thisButton.buttonHeight )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, thisButton.baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalShadowStop, thisButton.baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.5 ) );

    thisButton.overFillHorizontal = new LinearGradient( 0, 0, thisButton.buttonWidth, 0 )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( horizontalHighlightStop, transparentBaseColor )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.5 ) );

    thisButton.downFill = new LinearGradient( 0, 0, 0, thisButton.buttonHeight )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop * 0.67, thisButton.baseColor.colorUtilsDarker( 0.3 ) )
      .addColorStop( verticalShadowStop, thisButton.baseColor.colorUtilsBrighter( 0.2 ) )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.5 ) );

    thisButton.disabledFillVertical = new LinearGradient( 0, 0, 0, thisButton.buttonHeight )
      .addColorStop( 0, options.disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, options.disabledBaseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalShadowStop, options.disabledBaseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, options.disabledBaseColor.colorUtilsDarker( 0.5 ) );

    thisButton.disabledFillHorizontal = new LinearGradient( 0, 0, thisButton.buttonWidth, 0 )
      .addColorStop( 0, options.disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( horizontalHighlightStop, transparentBaseColor )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, options.disabledBaseColor.colorUtilsDarker( 0.5 ) );

    thisButton.background = new Rectangle( 0, 0, thisButton.buttonWidth, thisButton.buttonHeight, options.cornerRounding, options.cornerRounding,
      {
        fill: options.baseColor,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );
    this.addChild( thisButton.background );

    thisButton.overlayForHorizGradient = new Rectangle( 0, 0, thisButton.buttonWidth, thisButton.buttonHeight, options.cornerRounding, options.cornerRounding,
      {
        fill: options.baseColor,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );
    this.addChild( thisButton.overlayForHorizGradient );

    thisButton.label.center = thisButton.upCenter;
    thisButton.addChild( thisButton.label );

    // Hook up the button model.
    this.buttonModel = new ButtonModel( { listener: options.listener, fireOnDown: options.fireOnDown } );
    this.addInputListener( this.buttonModel );
    this.buttonModel.interactionState.link( function( interactionState ) {

      // TODO: Following line for debug, remove once things are fully working.
      console.log( 'interactionState changed, new value = ' + interactionState );

      switch( interactionState ) {

        case 'idle':
          thisButton.background.fill = thisButton.upFillVertical;
          thisButton.overlayForHorizGradient.fill = thisButton.upFillHorizontal;
          thisButton.label.center = thisButton.upCenter;
          break;

        case 'over':
          thisButton.label.center = thisButton.upCenter;
          thisButton.background.fill = thisButton.overFillVertical;
          thisButton.overlayForHorizGradient.fill = thisButton.overFillHorizontal;
          break;

        case 'pressed':
          thisButton.label.center = thisButton.downCenter;
          thisButton.background.fill = thisButton.downFill;
          thisButton.overlayForHorizGradient.fill = thisButton.overFillHorizontal;
          break;

        case 'disabled':
          thisButton.label.center = thisButton.downCenter;
          thisButton.background.fill = thisButton.disabledFillVertical;
          thisButton.overlayForHorizGradient.fill = thisButton.disabledFillHorizontal;
          break;
      }
    } );

    // Add an explicit mouse area so that the child nodes can all be non-pickable.
    this.mouseArea = Shape.rectangle( 0, 0, thisButton.buttonWidth, thisButton.buttonHeight );

    // Expand the touch area so that the button works better on touch devices.
    var touchAreaWidth = thisButton.buttonWidth * options.touchAreaExpansionFactor;
    var touchAreaHeight = thisButton.buttonHeight * options.touchAreaExpansionFactor;
    this.touchArea = Shape.rectangle( -touchAreaWidth / 2, -touchAreaHeight / 2, touchAreaWidth, touchAreaHeight );

    // accessibility
    thisButton.addPeer( '<input type="button" aria-label="' + _.escape( options.label ) + '">',
      { click: thisButton.buttonModel.fire.bind( thisButton ) }
    );

    // Mutate with the options after the layout is complete so that
    // width-dependent fields like centerX will work.
    thisButton.mutate( options );
  }

  return inherit( Node, RectangularPushButton, {

    addListener: function( listener ) {
      // Pass through to button model.
      this.buttonModel.addListener( listener );
    },

    // Remove a listener. If not a listener, this is a no-op.
    removeListener: function( listener ) {
      // Pass through to button model.
      this.buttonModel.removeListener( listener );
    },

    set enabled( value ) {
      assert && assert( typeof value === 'boolean', 'RectangularPushButton.enabled must be a boolean value' );
      this.buttonModel.enabled = value;
    },

    get enabled() { return this.buttonModel.enabled; }
  } );
} );