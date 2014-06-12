// Copyright 2002-2014, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  // constants
  var DEFAULT_WIDTH = 20;
  var DEFAULT_HEIGHT = 40;

  /**
   * @param {Object} options See parent type for info about options not shown in this file
   * @constructor
   */
  function SliderKnob( options ) {

    options = _.extend( {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      baseColor: '#00bfff',
      centerIndentWidth: 2, // use 0 for no line
      centerIndentColor: '#808080',
      buttonAppearanceStrategy: SliderKnob.threeDNoSquishAppearanceStrategy
    }, options );

    // Set up the margins to create the targeted height and width
    options.xMargin = ( options.width - options.centerIndentWidth ) / 2;
    options.yMargin = 5;

    // Create the center indent
    if ( options.centerIndentWidth > 0 ) {
      var indentWidth = options.centerIndentWidth;
      var indentHeight = options.height - options.yMargin * 2;
      var indentFill = new LinearGradient( 0, 0, indentWidth, 0 )
        .addColorStop( 0, Color.toColor( options.centerIndentColor ).colorUtilsDarker( 0.8 ) )
        .addColorStop( 0.75, Color.toColor( options.centerIndentColor ).colorUtilsBrighter( 0.8 ) );
      options.content = new Rectangle( 0, 0, indentWidth, indentHeight, 0, 0, { fill: indentFill } );
    }
    else {
      options.minWidth = options.width;
      options.minHeight = options.height;
    }

    RectangularPushButton.call( this, options );
  }

  //TODO: If this is kept after demo and review with the PhET team, it should be consolidated with the strategy in
  //TODO: RectangularButtonView from whence it was copied.  This was copied for a fast prototype.
  var VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.
  SliderKnob.threeDNoSquishAppearanceStrategy = function( button, interactionStateProperty, options ) {

    // Set up variables needed to create the various gradient fills
    var buttonWidth = button.width;
    var buttonHeight = button.height;
    var verticalHighlightStop = Math.min( VERTICAL_HIGHLIGHT_GRADIENT_LENGTH / buttonHeight, 1 );
    var verticalShadowStart = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonHeight, 1 );
    var horizontalHighlightStop = Math.min( HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH / buttonWidth, 1 );
    var horizontalShadowStart = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonWidth, 1 );
    var baseColor = Color.toColor( options.baseColor );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var transparentBaseColor = new Color( baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 0 );
    var transparentDisabledBaseColor = new Color( disabledBaseColor.getRed(), disabledBaseColor.getGreen(), disabledBaseColor.getBlue(), 0 );
    var disabledStroke = null;
    if ( options.stroke ) {
      disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    }
    var transparentWhite = new Color( 256, 256, 256, 0.7 );

    // Create the gradient fills used for various button states
    var upFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, baseColor )
      .addColorStop( verticalShadowStart, baseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var upFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, transparentWhite )
      .addColorStop( horizontalHighlightStop, transparentBaseColor )
      .addColorStop( horizontalShadowStart, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var overFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalShadowStart, baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var overFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, transparentWhite )
      .addColorStop( horizontalHighlightStop / 2, new Color( 256, 256, 256, 0 ) )
      .addColorStop( horizontalShadowStart, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.3 ) );

    var downFill = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalHighlightStop, baseColor.colorUtilsDarker( 0.2 ) )
      .addColorStop( verticalShadowStart, baseColor.colorUtilsDarker( 0.2 ) )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.3 ) );

    var disabledFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, disabledBaseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalShadowStart, disabledBaseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    var disabledFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( horizontalHighlightStop, transparentDisabledBaseColor )
      .addColorStop( horizontalShadowStart, transparentDisabledBaseColor )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    var disabledPressedFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop * 0.67, disabledBaseColor.colorUtilsDarker( 0.3 ) )
      .addColorStop( verticalShadowStart, disabledBaseColor.colorUtilsBrighter( 0.2 ) )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    // Create the overlay that is used to add horizontal shading.
    var overlayForHorizGradient = new Rectangle( 0, 0, buttonWidth, buttonHeight, options.cornerRadius, options.cornerRadius,
      {
        fill: options.baseColor,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );
    button.addChild( overlayForHorizGradient );

    interactionStateProperty.link( function( state ) {
      switch( state ) {

        case 'idle':
          button.fill = upFillVertical;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = upFillHorizontal;
          break;

        case 'over':
          button.fill = overFillVertical;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = overFillHorizontal;
          break;

        case 'pressed':
          button.fill = downFill;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = overFillHorizontal;
          break;

        case 'disabled':
          button.fill = disabledFillVertical;
          button.stroke = disabledStroke;
          overlayForHorizGradient.stroke = disabledStroke;
          overlayForHorizGradient.fill = disabledFillHorizontal;
          break;

        case 'disabled-pressed':
          button.fill = disabledPressedFillVertical;
          button.stroke = disabledStroke;
          overlayForHorizGradient.stroke = disabledStroke;
          overlayForHorizGradient.fill = disabledFillHorizontal;
          break;
      }
    } );
  };

  return inherit( RectangularPushButton, SliderKnob );
} );
