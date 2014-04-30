// Copyright 2002-2014, University of Colorado Boulder

/**
 * Visual representation of a rectangular button that uses gradients in order
 * to create a somewhat 3D look.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SUN/experimental/buttons/ButtonListener' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );

  // Constants
  var VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.

  /**
   * @param {ButtonModel} buttonModel - Model that defines the button's behavior.
   * @param {Property} interactionState - A property that is used to drive the visual appearance of the button.
   * @param {Object} options
   * @constructor
   */
  function RectangularButtonView( buttonModel, interactionState, options ) {
    this.buttonModel = buttonModel; // @protected
    var thisButton = this;

    options = _.extend( {
      // Default values.
      content: null,
      minWidth: 1,
      minHeight: 1,
      cursor: 'pointer',
      cornerRounding: 4,
      baseColor: new Color( 153, 206, 255 ),
      disabledBaseColor: new Color( 220, 220, 220 ),
      xMargin: 5,
      yMargin: 5,
      fireOnDown: false,
      xTouchExpansion: 5,
      yTouchExpansion: 5,
      stroke: null, // No outline stroke by default
      lineWidth: 1, // Only meaningful if stroke is non-null

      // The following function controls how the appearance of the content
      // node is modified when this button is disabled.
      setContentEnabledLook: function( enabled ) {
        if ( content ) {
          enabled ? content.opacity = 1.0 : content.opacity = 0.3;
        }
      }
    }, options );

    Node.call( thisButton );

    // Hook up the input listener
    this.addInputListener( new ButtonListener( buttonModel ) );

    // Set up variables needed to create the various gradient fills
    var content = options.content;
    var buttonWidth = Math.max( content ? content.width + options.xMargin * 2 : 0, options.minWidth );
    var buttonHeight = Math.max( content ? content.height + options.yMargin * 2 : 0, options.minHeight );
    var verticalHighlightStop = Math.min( VERTICAL_HIGHLIGHT_GRADIENT_LENGTH / buttonHeight, 1 );
    var verticalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonHeight, 0 );
    var horizontalHighlightStop = Math.min( HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH / buttonWidth, 1 );
    var horizontalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonWidth, 0 );
    var baseColor = options.baseColor;
    var disabledBaseColor = options.disabledBaseColor;
    var transparentBaseColor = new Color( baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 0 );
    var transparentDisabledBaseColor = new Color( disabledBaseColor.getRed(), disabledBaseColor.getGreen(), disabledBaseColor.getBlue(), 0 );
    var lightenedStroke = null;
    if ( options.stroke ) {
      lightenedStroke = options.stroke instanceof Color ? options.stroke.colorUtilsBrighter( 0.5 ) : new Color( options.stroke ).colorUtilsBrighter( 0.5 );
    }
    var transparentWhite = new Color( 256, 256, 256, 0.7 );

    // Create the gradient fills used for various button states
    var upFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, baseColor )
      .addColorStop( verticalShadowStop, baseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var upFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, transparentWhite )
      .addColorStop( horizontalHighlightStop, transparentBaseColor )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var overFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalShadowStop, baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var overFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, transparentWhite )
      .addColorStop( horizontalHighlightStop / 2, new Color( 256, 256, 256, 0 ) )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.3 ) );

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

    var disabledPressedFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop * 0.67, disabledBaseColor.colorUtilsDarker( 0.3 ) )
      .addColorStop( verticalShadowStop, disabledBaseColor.colorUtilsBrighter( 0.2 ) )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    // Create the basic button shape.
    var background = new Rectangle( 0, 0, buttonWidth, buttonHeight, options.cornerRounding, options.cornerRounding,
      {
        fill: options.baseColor,
        lineWidth: options.lineWidth
      } );
    this.addChild( background );

    // Create the overlay that is used to add horizontal shading.
    var overlayForHorizGradient = new Rectangle( 0, 0, buttonWidth, buttonHeight, options.cornerRounding, options.cornerRounding,
      {
        fill: options.baseColor,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );
    this.addChild( overlayForHorizGradient );

    if ( content ) {
      content.center = background.center;
      thisButton.addChild( content );
    }

    // Hook up the function that will modify button appearance as the state changes.
    interactionState.link( function( state ) {

      switch( state ) {

        case 'idle':
          options.setContentEnabledLook( true );
          background.fill = upFillVertical;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = upFillHorizontal;
          thisButton.cursor = 'pointer';
          break;

        case 'over':
          options.setContentEnabledLook( true );
          background.fill = overFillVertical;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = overFillHorizontal;
          thisButton.cursor = 'pointer';
          break;

        case 'pressed':
          options.setContentEnabledLook( true );
          background.fill = downFill;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = overFillHorizontal;
          thisButton.cursor = 'pointer';
          break;

        case 'disabled':
          options.setContentEnabledLook( false );
          background.fill = disabledFillVertical;
          background.stroke = lightenedStroke;
          overlayForHorizGradient.stroke = lightenedStroke;
          overlayForHorizGradient.fill = disabledFillHorizontal;
          thisButton.cursor = null;
          break;

        case 'disabled-pressed':
          options.setContentEnabledLook( false );
          background.fill = disabledPressedFillVertical;
          background.stroke = lightenedStroke;
          overlayForHorizGradient.stroke = lightenedStroke;
          overlayForHorizGradient.fill = disabledFillHorizontal;
          thisButton.cursor = null;
          break;
      }
    } );

    // Add explicit mouse and touch areas so that the child nodes can all be non-pickable.
    this.mouseArea = Shape.rectangle( 0, 0, buttonWidth, buttonHeight );
    this.touchArea = Shape.rectangle( -options.xTouchExpansion, -options.yTouchExpansion, buttonWidth + options.xTouchExpansion * 2, buttonHeight + options.yTouchExpansion * 2 );

    // Mutate with the options after the layout is complete so that width-
    // dependent fields like centerX will work.
    thisButton.mutate( options );
  }

  return inherit( Node, RectangularButtonView,
    {
      set enabled( value ) {
        assert && assert( typeof value === 'boolean', 'RectangularButtonView.enabled must be a boolean value' );
        this.buttonModel.enabled = value;
      },

      get enabled() { return this.buttonModel.enabled; }
    } );
} );