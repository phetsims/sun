// Copyright 2014-2015, University of Colorado Boulder

/**
 * Visual representation of a rectangular button.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AlignBox = require( 'SCENERY/nodes/AlignBox' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var Color = require( 'SCENERY/util/Color' );
  var ColorConstants = require( 'SUN/ColorConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );

  // constants
  var VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.
  var DEFAULT_COLOR = ColorConstants.LIGHT_BLUE;
  var X_ALIGN_VALUES = [ 'center', 'left', 'right' ];
  var Y_ALIGN_VALUES = [ 'center', 'top', 'bottom' ];

  // convenience function for creating the shape of the button, done to avoid code duplication
  function createButtonShape( width, height, options ) {
    return Shape.roundedRectangleWithRadii( 0, 0, width, height, {
      topLeft: typeof( options.leftTopCornerRadius ) === 'number' ? options.leftTopCornerRadius : options.cornerRadius,
      topRight: typeof( options.rightTopCornerRadius ) === 'number' ? options.rightTopCornerRadius : options.cornerRadius,
      bottomLeft: typeof( options.leftBottomCornerRadius ) === 'number' ? options.leftBottomCornerRadius : options.cornerRadius,
      bottomRight: typeof( options.rightBottomCornerRadius ) === 'number' ? options.rightBottomCornerRadius : options.cornerRadius
    } );
  }

  /**
   * @param {ButtonModel} buttonModel - Model that defines the button's behavior.
   * @param {Property} interactionStateProperty - A property that is used to drive the visual appearance of the button.
   * @param {Object} [options]
   * @constructor
   */
  function RectangularButtonView( buttonModel, interactionStateProperty, options ) {
    this.buttonModel = buttonModel; // @protected

    options = _.extend( {
      // Default values.
      content: null,
      minWidth: HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,
      minHeight: VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,
      cursor: 'pointer',
      cornerRadius: 4,
      baseColor: DEFAULT_COLOR,
      disabledBaseColor: ColorConstants.LIGHT_GRAY,
      xMargin: 8, // should be visibly greater than yMargin, see issue #109
      yMargin: 5,
      fireOnDown: false,
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      stroke: undefined, // undefined by default, which will cause a stroke to be derived from the base color
      lineWidth: 0.5, // Only meaningful if stroke is non-null
      xAlign: 'center', // {string} see X_ALIGN_VALUES
      yAlign: 'center', // {string} see Y_ALIGN_VALUES

      // Strategy for controlling the button's appearance, excluding any
      // content.  This can be a stock strategy from this file or custom.  To
      // create a custom one, model it off of the stock strategies defined in
      // this file.
      buttonAppearanceStrategy: RectangularButtonView.ThreeDAppearanceStrategy,

      // Strategy for controlling the appearance of the button's content based
      // on the button's state.  This can be a stock strategy from this file,
      // or custom.  To create a custom one, model it off of the stock
      // version(s) defined in this file.
      contentAppearanceStrategy: RectangularButtonView.FadeContentWhenDisabled,

      // a11y
      tagName: 'button'
    }, options );

    // validate options
    assert && assert( _.includes( X_ALIGN_VALUES, options.xAlign ), 'invalid xAlign: ' + options.xAlign );
    assert && assert( _.includes( Y_ALIGN_VALUES, options.yAlign ), 'invalid yAlign: ' + options.yAlign );

    Node.call( this );

    var content = options.content; // convenience variable

    // Hook up the input listener
    this.addInputListener( new ButtonListener( buttonModel ) );

    // @private - make the base color into a property so that the appearance strategy can update itself if changes occur.
    this.baseColorProperty = new Property( Color.toColor( options.baseColor ) ); // @private

    // Figure out the size of the button.
    var buttonWidth = Math.max( content ? content.width + options.xMargin * 2 : 0, options.minWidth );
    var buttonHeight = Math.max( content ? content.height + options.yMargin * 2 : 0, options.minHeight );

    // create and add the button node
    var button = new Path( createButtonShape( buttonWidth, buttonHeight, options ), {
      fill: options.baseColor,
      lineWidth: options.lineWidth
    } );
    this.addChild( button );

    // Add the content to the button.
    if ( content ) {

      // For performance reasons, the content should be unpickable.
      if ( content ) {
        content.pickable = false;
      }

      this.addChild( new AlignBox( content, {
        alignBounds: new Bounds2(
          options.xMargin,
          options.yMargin,
          button.width - options.xMargin,
          buttonHeight - options.yMargin
        ),
        xAlign: options.xAlign,
        yAlign: options.yAlign
      } ) );
    }

    // Hook up the strategy that will control the basic button appearance.
    var buttonAppearanceStrategy = new options.buttonAppearanceStrategy(
      button,
      interactionStateProperty,
      this.baseColorProperty,
      options
    );

    // Hook up the strategy that will control the content appearance.
    var contentAppearanceStrategy = new options.contentAppearanceStrategy( content, interactionStateProperty, options );

    // Control the pointer state based on the interaction state.
    // Control the pointer state based on the interaction state.
    var self = this;

    function handleInteractionStateChanged( state ) {
      self.cursor = state === 'disabled' || state === 'disabled-pressed' ? null : 'pointer';
    }

    interactionStateProperty.link( handleInteractionStateChanged );

    // Add explicit mouse and touch areas so that the child nodes can all be non-pickable.
    this.mouseArea = Shape.rectangle( 0, 0, buttonWidth, buttonHeight );
    this.touchArea = Shape.rectangle(
      -options.touchAreaXDilation,
      -options.touchAreaYDilation,
      buttonWidth + options.touchAreaXDilation * 2,
      buttonHeight + options.touchAreaYDilation * 2
    );

    // Mutate with the options after the layout is complete so that width-
    // dependent fields like centerX will work.
    this.mutate( options );

    // define a dispose function
    this.disposeRectangularButtonView = function() {
      buttonAppearanceStrategy.dispose();
      contentAppearanceStrategy.dispose();
      interactionStateProperty.unlink( handleInteractionStateChanged );
    };
  }

  sun.register( 'RectangularButtonView', RectangularButtonView );

  /**
   * Strategy for making a button look 3D-ish by using gradients that create the appearance of highlighted and shaded
   * edges.  The gradients are set up to make the light source appear to be in the upper left.
   * @param {Node} button
   * @param {Property.<Boolean>} interactionStateProperty
   * @param {Property.<Color>} baseColorProperty
   * @param {Object} [options]
   * @constructor
   * @public
   */
  RectangularButtonView.ThreeDAppearanceStrategy = function( button, interactionStateProperty, baseColorProperty, options ) {

    var buttonWidth = button.width;
    var buttonHeight = button.height;

    // compute color stops for gradient, see issue #148
    assert && assert( buttonWidth >= HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH );
    assert && assert( buttonHeight >= VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH );
    var verticalHighlightStop = Math.min( VERTICAL_HIGHLIGHT_GRADIENT_LENGTH / buttonHeight, 1 );
    var verticalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonHeight, 0 );
    var horizontalHighlightStop = Math.min( HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH / buttonWidth, 1 );
    var horizontalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonWidth, 0 );

    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var transparentDisabledBaseColor = new Color( disabledBaseColor.getRed(), disabledBaseColor.getGreen(), disabledBaseColor.getBlue(), 0 );
    var transparentWhite = new Color( 256, 256, 256, 0.7 );

    // Create the overlay that is used to add shading to left and right edges of the button.
    var overlayForHorizGradient = new Path( createButtonShape( buttonWidth, buttonHeight, options ), {
      lineWidth: options.lineWidth,
      pickable: false
    } );
    button.addChild( overlayForHorizGradient );

    // Various fills used in the button's appearance, updated below.
    var upFillVertical;
    var upFillHorizontal;
    var overFillVertical;
    var overFillHorizontal;
    var downFillVertical;
    var disabledFillVertical;
    var disabledFillHorizontal;
    var disabledPressedFillVertical;
    var enabledStroke;
    var disabledStroke;

    // Function for updating the button's appearance based on the current interaction state.
    function updateAppearance( interactionState ) {

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
          button.fill = downFillVertical;
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

        default:
          throw new Error( 'unsupported interactionState: ' + interactionState );
      }
    }

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

      downFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
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

      if ( options.stroke === null ) {
        // The stroke was explicitly set to null, so the button should have no stroke.
        enabledStroke = null;
        disabledStroke = null;
      }
      else if ( typeof( options.stroke ) === 'undefined' ) {
        // No stroke was defined, but it wasn't set to null, so default to a stroke based on the base color of the
        // button.  This behavior is a bit unconventional for Scenery nodes, but it makes the buttons look much better.
        enabledStroke = baseColor.colorUtilsDarker( 0.4 );
        disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
      }
      else {
        enabledStroke = Color.toColor( options.stroke );
        disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
      }

      button.cachedPaints = [
        upFillVertical, overFillVertical, downFillVertical, disabledFillVertical, disabledPressedFillVertical,
        disabledStroke
      ];

      overlayForHorizGradient.cachedPaints = [
        upFillHorizontal, overFillHorizontal, disabledFillHorizontal, enabledStroke, disabledStroke
      ];

      updateAppearance( interactionStateProperty.value );
    }

    // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
    // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
    updateFillsAndStrokes( baseColorProperty.value );
    updateAppearance( interactionStateProperty.value );

    baseColorProperty.lazyLink( updateFillsAndStrokes );

    interactionStateProperty.lazyLink( updateAppearance );

    this.dispose = function() {
      baseColorProperty.unlink( updateFillsAndStrokes );
      interactionStateProperty.unlink( updateAppearance );
    };
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
   * @public
   */
  RectangularButtonView.FlatAppearanceStrategy = function( button, interactionStateProperty, baseColorProperty, options ) {

    // Set up variables needed to create the various gradient fills
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );

    // fills used for various button states
    var upFill;
    var overFill;
    var downFill;
    var disabledFill;
    var disabledPressedFillVertical;
    var enabledStroke;
    var disabledStroke;

    function updateAppearance( interactionState ) {
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

        default:
          throw new Error( 'upsupported interactionState: ' + interactionState );
      }
    }

    function updateFillsAndStrokes( baseColor ) {
      upFill = baseColor;
      overFill = baseColor.colorUtilsBrighter( 0.4 );
      downFill = baseColor.colorUtilsDarker( 0.4 );
      disabledFill = disabledBaseColor;
      disabledPressedFillVertical = disabledFill;
      if ( options.stroke === null ) {
        // The stroke was explicitly set to null, so the button should have no stroke.
        enabledStroke = null;
        disabledStroke = null;
      }
      else if ( typeof( options.stroke ) === 'undefined' ) {
        // No stroke was defined, but it wasn't set to null, so default to a stroke based on the base color of the
        // button.  This behavior is a bit unconventional for Scenery nodes, but it makes the buttons look much better.
        enabledStroke = baseColor.colorUtilsDarker( 0.4 );
        disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
      }
      else {
        enabledStroke = Color.toColor( options.stroke );
        disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
      }

      button.cachedPaints = [
        upFill, overFill, downFill, disabledFill, disabledPressedFillVertical,
        enabledStroke, disabledStroke
      ];
      updateAppearance( interactionStateProperty.value );
    }

    baseColorProperty.link( updateFillsAndStrokes );

    // Lazy link to interaction state to avoid two updates at init.
    interactionStateProperty.lazyLink( updateAppearance );

    this.dispose = function() {
      baseColorProperty.unlink( updateFillsAndStrokes );
      interactionStateProperty.unlink( updateAppearance );
    };
  };

  /**
   * Basic strategy for controlling content appearance, fades the content by making it transparent when disabled.
   *
   * @param {Node} content
   * @param {Property} interactionStateProperty
   * @constructor
   * @public
   */
  RectangularButtonView.FadeContentWhenDisabled = function( content, interactionStateProperty ) {

    // update the opacity when the state changes
    function updateOpacity( state ) {
      if ( content ) {
        content.opacity = state === 'disabled' || state === 'disabled-pressed' ? 0.3 : 1;
      }
    }

    interactionStateProperty.link( updateOpacity );

    // add dispose function to unlink listener
    this.dispose = function() {
      interactionStateProperty.unlink( updateOpacity );
    };
  };

  return inherit( Node, RectangularButtonView, {

    /**
     * Sets the enabled state.
     * @param {boolean} value
     * @public
     */
    setEnabled: function( value ) {
      assert && assert( typeof value === 'boolean', 'RectangularButtonView.enabled must be a boolean value' );
      this.buttonModel.enabledProperty.set( value );
    },
    set enabled( value ) { this.setEnabled( value ); },

    /**
     * Gets the enabled state.
     * @returns {boolean}
     * @public
     */
    getEnabled: function() { return this.buttonModel.enabledProperty.get(); },
    get enabled() { return this.getEnabled(); },

    /**
     * Sets the base color, which is the main background fill color used for the button.
     * @param {Color|String} baseColor
     * @public
     */
    setBaseColor: function( baseColor ) { this.baseColorProperty.value = Color.toColor( baseColor ); },
    set baseColor( baseColor ) { this.setBaseColor( baseColor ); },

    /**
     * Gets the base color for this button.
     * @returns {Color}
     * @public
     */
    getBaseColor: function() { return this.baseColorProperty.value; },
    get baseColor() { return this.getBaseColor(); },

    /**
     * dispose function
     * @public
     */
    dispose: function() {
      this.disposeRectangularButtonView();
      Node.prototype.dispose.call( this );
    }
  } );
} );