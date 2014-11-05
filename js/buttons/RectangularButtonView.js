// Copyright 2002-2014, University of Colorado Boulder

/**
 * Visual representation of a rectangular button.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var ColorConstants = require( 'SUN/ColorConstants' );

  // constants
  var VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.
  var DEFAULT_COLOR = ColorConstants.LIGHT_BLUE;

  /**
   * @param {ButtonModel} buttonModel - Model that defines the button's behavior.
   * @param {Property} interactionStateProperty - A property that is used to drive the visual appearance of the button.
   * @param {Object} [options]
   * @constructor
   */
  function RectangularButtonView( buttonModel, interactionStateProperty, options ) {
    this.buttonModel = buttonModel; // @protected
    var thisButton = this;

    options = _.extend( {
      // Default values.
      content: null,
      minWidth: 1,
      minHeight: 1,
      cursor: 'pointer',
      cornerRadius: 4,
      baseColor: DEFAULT_COLOR,
      disabledBaseColor: ColorConstants.LIGHT_GRAY,
      xMargin: 8, // should be visibly greater than yMargin, see issue #109
      yMargin: 5,
      fireOnDown: false,
      xTouchExpansion: 5,
      yTouchExpansion: 5,
      stroke: DEFAULT_COLOR.colorUtilsDarker( 0.4 ),
      lineWidth: 0.5, // Only meaningful if stroke is non-null

      // Strategy for controlling the button's appearance, excluding any
      // content.  This can be a stock strategy from this file or custom.  To
      // create a custom one, model it off of the stock strategies defined in
      // this file.
      buttonAppearanceStrategy: RectangularButtonView.threeDAppearanceStrategy,

      // Strategy for controlling the appearance of the button's content based
      // on the button's state.  This can be a stock strategy from this file,
      // or custom.  To create a custom one, model it off of the stock
      // version(s) defined in this file.
      contentAppearanceStrategy: RectangularButtonView.fadeContentWhenDisabled
    }, options );

    Node.call( thisButton );

    // Hook up the input listener
    this.addInputListener( new ButtonListener( buttonModel ) );

    // Make the base color into a property so that the appearance strategy can update itself if changes occur.
    this.baseColorProperty = new Property( Color.toColor( options.baseColor ) );

    // Figure out the size of the button.
    var content = options.content;
    var buttonWidth = Math.max( content ? content.width + options.xMargin * 2 : 0, options.minWidth );
    var buttonHeight = Math.max( content ? content.height + options.yMargin * 2 : 0, options.minHeight );

    // Create the basic button shape.
    var button = new Rectangle( 0, 0, buttonWidth, buttonHeight, options.cornerRadius, options.cornerRadius,
      {
        fill: options.baseColor,
        lineWidth: options.lineWidth
      } );
    this.addChild( button );

    // Hook up the strategy that will control the basic button appearance.
    options.buttonAppearanceStrategy( button, interactionStateProperty, this.baseColorProperty, options );

    // Add the content to the button.
    if ( content ) {
      content.center = button.center;
      thisButton.addChild( content );
    }

    // Hook up the strategy that will control the content appearance.
    options.contentAppearanceStrategy( content, interactionStateProperty, options );

    // Control the pointer state based on the interaction state.
    interactionStateProperty.link( function( state ) {
      thisButton.cursor = state === 'disabled' || state === 'disabled-pressed' ? null : 'pointer';
    } );

    // Add explicit mouse and touch areas so that the child nodes can all be non-pickable.
    this.mouseArea = Shape.rectangle( 0, 0, buttonWidth, buttonHeight );
    this.touchArea = Shape.rectangle( -options.xTouchExpansion, -options.yTouchExpansion, buttonWidth + options.xTouchExpansion * 2, buttonHeight + options.yTouchExpansion * 2 );

    // Mutate with the options after the layout is complete so that width-
    // dependent fields like centerX will work.
    thisButton.mutate( options );
  }

  /**
   * Strategy for making a button look 3D-ish by using gradients that create the appearance of highlighted and shaded
   * edges.
   *
   * @param {Node} button
   * @param {Property.<Boolean>} interactionStateProperty
   * @param {Property.<Color>} baseColorProperty
   * @param {Object} [options]
   * @constructor
   */
  RectangularButtonView.threeDAppearanceStrategy = function( button, interactionStateProperty, baseColorProperty, options ) {

    // Set up variables needed to create the various gradient fills
    var buttonWidth = button.width;
    var buttonHeight = button.height;
    var verticalHighlightStop = Math.min( VERTICAL_HIGHLIGHT_GRADIENT_LENGTH / buttonHeight, 1 );
    var verticalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonHeight, 0 );
    var horizontalHighlightStop = Math.min( HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH / buttonWidth, 1 );
    var horizontalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonWidth, 0 );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var transparentDisabledBaseColor = new Color( disabledBaseColor.getRed(), disabledBaseColor.getGreen(), disabledBaseColor.getBlue(), 0 );
    var disabledStroke = null;
    if ( options.stroke ) {
      disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    }
    var transparentWhite = new Color( 256, 256, 256, 0.7 );

    // Create the overlay that is used to add shading to left and right edges of the button.
    var overlayForHorizGradient = new Rectangle( 0, 0, buttonWidth, buttonHeight, options.cornerRadius, options.cornerRadius,
      {
        lineWidth: options.lineWidth
      } );
    button.addChild( overlayForHorizGradient );

    // Various fills used in the button's appearance, updated below.
    var upFillVertical;
    var upFillHorizontal;
    var overFillVertical;
    var overFillHorizontal;
    var downFill;
    var disabledFillVertical;
    var disabledFillHorizontal;
    var disabledPressedFillVertical;
    var enabledStroke = null;

    // Keep the gradients in memory, so switching back and forth has improved performance.
    button.fillKept = true;
    overlayForHorizGradient.fillKept = true;

    // Function for creating the fills and strokes used to control the button's appearance.
    function updateFillsAndStrokes( baseColor ) {

      var transparentBaseColor = new Color( baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 0 );

      // Create the gradient fills used for various button states
      upFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
        .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
        .addColorStop( verticalHighlightStop, baseColor )
        .addColorStop( verticalShadowStop, baseColor )
        .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

      upFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
        .addColorStop( 0, transparentWhite )
        .addColorStop( horizontalHighlightStop, transparentBaseColor )
        .addColorStop( horizontalShadowStop, transparentBaseColor )
        .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

      overFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
        .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
        .addColorStop( verticalHighlightStop, baseColor.colorUtilsBrighter( 0.5 ) )
        .addColorStop( verticalShadowStop, baseColor.colorUtilsBrighter( 0.5 ) )
        .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

      overFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
        .addColorStop( 0, transparentWhite )
        .addColorStop( horizontalHighlightStop / 2, new Color( 256, 256, 256, 0 ) )
        .addColorStop( horizontalShadowStop, transparentBaseColor )
        .addColorStop( 1, baseColor.colorUtilsDarker( 0.3 ) );

      downFill = new LinearGradient( 0, 0, 0, buttonHeight )
        .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
        .addColorStop( verticalHighlightStop * 0.67, baseColor.colorUtilsDarker( 0.3 ) )
        .addColorStop( verticalShadowStop, baseColor.colorUtilsBrighter( 0.2 ) )
        .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

      disabledFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
        .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
        .addColorStop( verticalHighlightStop, disabledBaseColor.colorUtilsBrighter( 0.5 ) )
        .addColorStop( verticalShadowStop, disabledBaseColor.colorUtilsBrighter( 0.5 ) )
        .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

      disabledFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
        .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
        .addColorStop( horizontalHighlightStop, transparentDisabledBaseColor )
        .addColorStop( horizontalShadowStop, transparentDisabledBaseColor )
        .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

      disabledPressedFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
        .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
        .addColorStop( verticalHighlightStop * 0.67, disabledBaseColor.colorUtilsDarker( 0.3 ) )
        .addColorStop( verticalShadowStop, disabledBaseColor.colorUtilsBrighter( 0.2 ) )
        .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

      if ( options.stroke !== null ) {
        enabledStroke = baseColor.colorUtilsDarker( 0.4 );
        disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
      }
    }

    // Function for updating the button's appearance based on the current interaction state.
    function updateAppearanceForState( interactionState ) {

      switch( interactionState ) {

        case 'idle':
          button.fill = upFillVertical;
          overlayForHorizGradient.stroke = enabledStroke;
          overlayForHorizGradient.fill = upFillHorizontal;
          break;

        case 'over':
          button.fill = overFillVertical;
          overlayForHorizGradient.stroke = enabledStroke;
          overlayForHorizGradient.fill = overFillHorizontal;
          break;

        case 'pressed':
          button.fill = downFill;
          overlayForHorizGradient.stroke = enabledStroke;
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
    }

    // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
    // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
    updateFillsAndStrokes( baseColorProperty.value );
    updateAppearanceForState( interactionStateProperty.value );

    baseColorProperty.lazyLink( function( baseColor ) {

      // Turn off the memory optimization for gradients, since this button instance is apparently changing colors.
      button.fillKept = false;
      overlayForHorizGradient.fillKept = false;

      // Do the appearance updates.
      updateFillsAndStrokes( baseColor );
      updateAppearanceForState( interactionStateProperty.value );
    } );

    interactionStateProperty.lazyLink( function( interactionState ) {
      updateAppearanceForState( interactionState );
    } );
  };

  /**
   * Strategy for buttons that look flat, i.e. no shading or highlighting, but that change color on mouseover, press,
   * etc.
   *
   * @param {Node} button
   * @param {Property.<boolean>} interactionStateProperty
   * @param {Property.<Color>} baseColorProperty
   * @param {Object} [options]
   * @constructor
   */
  RectangularButtonView.flatAppearanceStrategy = function( button, interactionStateProperty, baseColorProperty, options ) {

    // Set up variables needed to create the various gradient fills
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var disabledStroke = null;
    if ( options.stroke ) {
      disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    }

    // fills used for various button states
    var upFill;
    var overFill;
    var downFill;
    var disabledFill;
    var disabledPressedFillVertical;
    var enabledStroke = null;

    function updateFillsAndStrokes( baseColor ) {
      upFill = baseColor;
      overFill = baseColor.colorUtilsBrighter( 0.4 );
      downFill = baseColor.colorUtilsDarker( 0.4 );
      disabledFill = disabledBaseColor;
      disabledPressedFillVertical = disabledFill;
      if ( options.stroke !== null ) {
        enabledStroke = baseColor.colorUtilsDarker( 0.4 );
        disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
      }
    }

    function updateAppearanceForState( interactionState ) {
      switch( interactionState ) {

        case 'idle':
          button.fill = upFill;
          button.stroke = enabledStroke;
          break;

        case 'over':
          button.fill = overFill;
          button.stroke = enabledStroke;
          break;

        case 'pressed':
          button.fill = downFill;
          button.stroke = enabledStroke;
          break;

        case 'disabled':
          button.fill = disabledFill;
          button.stroke = disabledStroke;
          break;

        case 'disabled-pressed':
          button.fill = disabledPressedFillVertical;
          button.stroke = disabledStroke;
          break;
      }
    }

    baseColorProperty.link( function( baseColor ) {
      updateFillsAndStrokes( baseColor );
      updateAppearanceForState( interactionStateProperty.value );
    } );

    // Lazy link to interaction state to avoid two updates at init.
    interactionStateProperty.lazyLink( function( interactionState ) {
      updateAppearanceForState( interactionState );
    } );
  };

  /**
   * Basic strategy for controlling content appearance, fades the content by
   * making it transparent when disabled.
   *
   * @param {Node} content
   * @param {Property} interactionStateProperty
   * @constructor
   */
  RectangularButtonView.fadeContentWhenDisabled = function( content, interactionStateProperty ) {
    if ( content ) {
      interactionStateProperty.link( function( state ) {
        content.opacity = state === 'disabled' || state === 'disabled-pressed' ? 0.3 : 1;
      } );
    }
  };

  return inherit( Node, RectangularButtonView,
    {
      set enabled( value ) {
        assert && assert( typeof value === 'boolean', 'RectangularButtonView.enabled must be a boolean value' );
        this.buttonModel.enabled = value;
      },
      get enabled() { return this.buttonModel.enabled; },

      set baseColor( baseColor ) { this.baseColorProperty.value = Color.toColor( baseColor ); },
      get baseColor() { return this.baseColorProperty.value; }
    } );
} );