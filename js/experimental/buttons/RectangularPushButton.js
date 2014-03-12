// Copyright 2002-2014, University of Colorado Boulder

/**
 * A rectangular push button that draws gradients and such in order to create
 * a somewhat 2D effect.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Includes
  var AbstractButton = require( 'SUN/experimental/buttons/AbstractButton' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
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
    AbstractButton.call( thisButton, { listener: options.listener, fireOnDown: options.fireOnDown } );

    options = _.extend( {
      // Default values.
      cursor: 'pointer',
      cornerRounding: 4,
      baseColor: new Color( 153, 206, 255 ),
      disabledBaseColor: new Color( 220, 220, 220 ),
      xPadding: 5,
      yPadding: 5,
      listener: null,
      fireOnDown: false,
      touchExpansionX: 5,
      touchExpansionY: 5
    }, options );

    var buttonWidth = content.width + options.xPadding * 2;
    var buttonHeight = content.height + options.yPadding * 2;
    var upCenter = new Vector2( buttonWidth / 2, buttonHeight / 2 );
    var downCenter = upCenter.plus( new Vector2( 0.5, 0.5 ) ); // Displacement empirically determined.
    var verticalHighlightStop = HIGHLIGHT_GRADIENT_LENGTH / buttonHeight;
    var verticalShadowStop = 1 - SHADE_GRADIENT_LENGTH / buttonHeight;
    var horizontalHighlightStop = HIGHLIGHT_GRADIENT_LENGTH / buttonWidth;
    var horizontalShadowStop = 1 - SHADE_GRADIENT_LENGTH / buttonWidth;
    var baseColor = options.baseColor;
    var disabledBaseColor = options.disabledBaseColor;
    var transparentBaseColor = new Color( baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 0 );
    var transparentDisabledBaseColor = new Color( disabledBaseColor.getRed(), disabledBaseColor.getGreen(), disabledBaseColor.getBlue(), 0 );

    // Create the gradient fills used for various button states
    var upFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, baseColor )
      .addColorStop( verticalShadowStop, baseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var upFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( horizontalHighlightStop, transparentBaseColor )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var overFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalShadowStop, baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var overFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( horizontalHighlightStop, transparentBaseColor )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var downFill = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop * 0.67, baseColor.colorUtilsDarker( 0.3 ) )
      .addColorStop( verticalShadowStop, baseColor.colorUtilsBrighter( 0.2 ) )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var disabledFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, disabledBaseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalShadowStop, disabledBaseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    var disabledFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( horizontalHighlightStop, transparentDisabledBaseColor )
      .addColorStop( horizontalShadowStop, transparentDisabledBaseColor )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    // Create the basic button shape.
    var background = new Rectangle( 0, 0, buttonWidth, buttonHeight, options.cornerRounding, options.cornerRounding,
      {
        fill: options.baseColor
      } );
    this.addChild( background );

    // Create the overlay that is used to add horizontal shading.
    var overlayForHorizGradient = new Rectangle( 0, 0, buttonWidth, buttonHeight, options.cornerRounding, options.cornerRounding,
      {
        fill: options.baseColor
      } );
    this.addChild( overlayForHorizGradient );

    content.center = upCenter;
    thisButton.addChild( content );

    // Hook up the function that will modify button appearance as the state changes.
    this.buttonModel.interactionState.link( function( interactionState ) {

      switch( interactionState ) {

        case 'idle':
          content.center = upCenter;
          content.opacity = 1;
          background.fill = upFillVertical;
          overlayForHorizGradient.fill = upFillHorizontal;
          thisButton.pickable = true;
          break;

        case 'over':
          content.center = upCenter;
          content.opacity = 1;
          background.fill = overFillVertical;
          overlayForHorizGradient.fill = overFillHorizontal;
          thisButton.pickable = true;
          break;

        case 'pressed':
          content.center = downCenter;
          content.opacity = 1;
          background.fill = downFill;
          overlayForHorizGradient.fill = overFillHorizontal;
          thisButton.pickable = true;
          break;

        case 'disabled':
          content.center = upCenter;
          content.opacity = 0.3;
          background.fill = disabledFillVertical;
          overlayForHorizGradient.fill = disabledFillHorizontal;
          thisButton.pickable = false;
          break;
      }
    } );

    // Add explicit mouse and touch areas so that the child nodes can all be non-pickable.
    this.mouseArea = Shape.rectangle( 0, 0, buttonWidth, buttonHeight );
    this.touchArea = Shape.rectangle( -options.touchExpansionX, -options.touchExpansionY, buttonWidth + options.touchExpansionX * 2, buttonHeight + options.touchExpansionY * 2 );

    // Mutate with the options after the layout is complete so that
    // width-dependent fields like centerX will work.
    thisButton.mutate( options );
  }

  return inherit( AbstractButton, RectangularPushButton );
} );