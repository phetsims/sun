// Copyright 2002-2014, University of Colorado Boulder

/**
 * Visual representation of a rectangular push button that uses gradients in
 * order to create a somewhat 3D look.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {

  // Includes
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.

  /**
   * @param buttonModel - Model that defines the button's behavior.
   * @param options
   * @constructor
   */
  function RectangularButtonView( buttonModel, options ) {
    this.buttonModel = buttonModel;
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
      xPadding: 5,
      yPadding: 5,
      listener: null,
      fireOnDown: false,
      touchExpansionX: 5,
      touchExpansionY: 5,
      stroke: null, // No outline stroke by default
      lineWidth: 1 // Only meaningful if stroke is non-null
    }, options );

    var content = options.content;

    Node.call( thisButton, { listener: options.listener, fireOnDown: options.fireOnDown } );

    var buttonWidth = Math.max( content ? content.width + options.xPadding * 2 : 0, options.minWidth );
    var buttonHeight = Math.max( content ? content.height + options.yPadding * 2 : 0, options.minHeight );
    var verticalHighlightStop = VERTICAL_HIGHLIGHT_GRADIENT_LENGTH / buttonHeight;
    var verticalShadowStop = 1 - SHADE_GRADIENT_LENGTH / buttonHeight;
    var horizontalHighlightStop = HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH / buttonWidth;
    var horizontalShadowStop = 1 - SHADE_GRADIENT_LENGTH / buttonWidth;
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

    //Set the opacity of the content, but only if it exists
    function setContentOpacity( opacity ) {
      if ( content ) {
        content.opacity = opacity;
      }
    }

    // Hook up the function that will modify button appearance as the state changes.
    buttonModel.interactionStateProperty.link( function( interactionState ) {

      switch( interactionState ) {

        case 'idle':
          setContentOpacity( 1 );
          background.fill = upFillVertical;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = upFillHorizontal;
          thisButton.cursor = 'pointer';
          break;

        case 'over':
          setContentOpacity( 1 );
          background.fill = overFillVertical;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = overFillHorizontal;
          thisButton.cursor = 'pointer';
          break;

        case 'pressed':
          setContentOpacity( 1 );
          background.fill = downFill;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = overFillHorizontal;
          thisButton.cursor = 'pointer';
          break;

        case 'disabled':
          setContentOpacity( 0.3 );
          background.fill = disabledFillVertical;
          background.stroke = lightenedStroke;
          overlayForHorizGradient.stroke = lightenedStroke;
          overlayForHorizGradient.fill = disabledFillHorizontal;
          thisButton.cursor = null;
          break;
      }
    } );

    // Add explicit mouse and touch areas so that the child nodes can all be non-pickable.
    this.mouseArea = Shape.rectangle( 0, 0, buttonWidth, buttonHeight );
    this.touchArea = Shape.rectangle( -options.touchExpansionX, -options.touchExpansionY, buttonWidth + options.touchExpansionX * 2, buttonHeight + options.touchExpansionY * 2 );

    // Mutate with the options after the layout is complete so that width-
    // dependent fields like centerX will work.
    thisButton.mutate( options );
  }

  return inherit( Node, RectangularButtonView,
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
        assert && assert( typeof value === 'boolean', 'AbstractPushButton.enabled must be a boolean value' );
        this.buttonModel.enabled = value;
      },

      get enabled() { return this.buttonModel.enabled; }
    } );
} );