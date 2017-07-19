// Copyright 2014-2015, University of Colorado Boulder

/**
 * Visual representation of a round button.  It is provided with a 'button
 * model' that is monitored to change the appearance of the button.
 *
 * Note: this is only the visual representation and does not have associated
 * input listeners so that it can be reused in multiple contexts.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var ColorConstants = require( 'SUN/ColorConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var HIGHLIGHT_GRADIENT_LENGTH = 5; // In screen coords, which are roughly pixels.
  var DEFAULT_COLOR = ColorConstants.LIGHT_BLUE;

  /**
   * @param {ButtonModel} buttonModel
   * @param {Property} interactionStateProperty - A property that is used to drive the visual appearance of the button.
   * @param {Object} [options]
   * @constructor
   */
  function RoundButtonView( buttonModel, interactionStateProperty, options ) {
    this.buttonModel = buttonModel; // @protected

    options = _.extend( {

      radius: ( options && options.content ) ? undefined : 30,
      content: null,
      cursor: 'pointer',
      baseColor: DEFAULT_COLOR,
      disabledBaseColor: ColorConstants.LIGHT_GRAY,
      minXMargin: 5, // Minimum margin in x direction, i.e. on left and right
      minYMargin: 5, // Minimum margin in y direction, i.e. on top and bottom
      fireOnDown: false,
      touchAreaDilation: 0, // radius dilation for touch area
      mouseAreaDilation: 0, // radius dilation for mouse area
      stroke: undefined, // undefined by default, which will cause a stroke to be derived from the base color
      lineWidth: 0.5, // Only meaningful if stroke is non-null

      // By default, icons are centered in the button, but icons with odd
      // shapes that are not wrapped in a normalizing parent node may need to
      // specify offsets to line things up properly
      xContentOffset: 0,
      yContentOffset: 0,

      // Strategy for controlling the button's appearance, excluding any
      // content.  This can be a stock strategy from this file or custom.  To
      // create a custom one, model it off of the stock strategies defined in
      // this file.
      buttonAppearanceStrategy: RoundButtonView.ThreeDAppearanceStrategy,

      // Strategy for controlling the appearance of the button's content based
      // on the button's state.  This can be a stock strategy from this file,
      // or custom.  To create a custom one, model it off of the stock
      // version(s) defined in this file.
      contentAppearanceStrategy: RoundButtonView.FadeContentWhenDisabled
    }, options );

    Node.call( this );
    var content = options.content; // convenience variable
    var upCenter = new Vector2( options.xContentOffset, options.yContentOffset );

    // For performance reasons, the content should be unpickable.
    if ( content ) {
      content.pickable = false;
    }

    // Make the base color into a property so that the appearance strategy can update itself if changes occur.
    this.baseColorProperty = new Property( Color.toColor( options.baseColor ) ); // @private

    // Hook up the input listener
    this.addInputListener( new ButtonListener( buttonModel ) );

    // Use the user-specified radius if present, otherwise calculate the
    // radius based on the content and the margin.
    var buttonRadius = options.radius || Math.max( content.width + options.minXMargin * 2, content.height + options.minYMargin * 2 ) / 2;

    // Create the basic button shape.
    var button = new Circle( buttonRadius, { fill: options.baseColor, lineWidth: options.lineWidth } );
    this.addChild( button );

    // Hook up the strategy that will control the basic button appearance.
    var buttonAppearanceStrategy = new options.buttonAppearanceStrategy(
      button,
      interactionStateProperty,
      this.baseColorProperty,
      options
    );

    // Add the content to the button.
    if ( content ) {
      content.center = upCenter;
      this.addChild( content );
    }

    // Hook up the strategy that will control the content appearance.
    var contentAppearanceStrategy = new options.contentAppearanceStrategy( content, interactionStateProperty );

    // Control the pointer state based on the interaction state.
    var self = this;
    function handleInteractionStateChanged( state ) {
      self.cursor = state === 'disabled' || state === 'disabled-pressed' ? null : 'pointer';
    }
    interactionStateProperty.link( handleInteractionStateChanged );

    // Dilate the pointer areas.
    this.touchArea = Shape.circle( 0, 0, buttonRadius + options.touchAreaDilation );
    this.mouseArea = Shape.circle( 0, 0, buttonRadius + options.mouseAreaDilation );

    // Set pickable such that sub-nodes are pruned from hit testing.
    this.pickable = null;

    // a11y
    this.focusHighlight = new Shape.circle( 0, 0, buttonRadius + 5 );

    // Mutate with the options after the layout is complete so that
    // width-dependent fields like centerX will work.
    this.mutate( options );

    // define a dispose function
    this.disposeRoundButtonView = function() {
      buttonAppearanceStrategy.dispose();
      contentAppearanceStrategy.dispose();
      interactionStateProperty.unlink( handleInteractionStateChanged );
    };
  }

  sun.register( 'RoundButtonView', RoundButtonView );

  /**
   * Strategy for making a button look 3D-ish by using gradients that create the appearance of highlighted and shaded
   * edges.  The gradients are intended to make the light source appear to be above and to the left of the button.
   *
   * @param {Node} button
   * @param {Property.<boolean>} interactionStateProperty
   * @param {Property.<Color>} baseColorProperty
   * @param {Object} [options]
   * @constructor
   * @public
   */
  RoundButtonView.ThreeDAppearanceStrategy = function( button, interactionStateProperty, baseColorProperty, options ) {

    // Set up variables needed to create the various gradient fills and otherwise mod the appearance
    var buttonRadius = button.width / 2;
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var transparentDisabledBaseColor = new Color(
      disabledBaseColor.getRed(),
      disabledBaseColor.getGreen(),
      disabledBaseColor.getBlue(),
      0
    );
    var disabledStroke = options.stroke ? disabledBaseColor.colorUtilsDarker( 0.4 ) : null;
    var innerGradientRadius = buttonRadius - HIGHLIGHT_GRADIENT_LENGTH / 2;
    var outerGradientRadius = buttonRadius + HIGHLIGHT_GRADIENT_LENGTH / 2;
    var gradientOffset = HIGHLIGHT_GRADIENT_LENGTH / 2;

    // Create and add the overlay that is used to add shading.
    var overlayForShadowGradient = new Circle( buttonRadius, { lineWidth: options.lineWidth, pickable: false } );
    button.addChild( overlayForShadowGradient );

    // various fills used to alter the appearance of the button, values set below
    var upFillHighlight;
    var upFillShadow;
    var overFillHighlight;
    var overFillShadow;
    var pressedFill;
    var disabledFillHighlight;
    var disabledFillShadow;
    var disabledPressedFillHighlight;
    var enabledStroke = null;

    // Function to create a fill that represents a pressed in round button.
    function createPressedFill( color ) {
      return new RadialGradient( -gradientOffset, -gradientOffset, 0, 0, 0, outerGradientRadius )
        .addColorStop( 0, color.colorUtilsDarker( 0.1 ) )
        .addColorStop( 0.6, color.colorUtilsDarker( 0.2 ) )
        .addColorStop( 0.8, color )
        .addColorStop( 1, color.colorUtilsBrighter( 0.8 ) );
    }

    // Function for updating the button's appearance based on the current interaction state.
    function updateAppearance( interactionState ) {

      switch( interactionState ) {

        case 'idle':
          button.fill = upFillHighlight;
          overlayForShadowGradient.stroke = enabledStroke;
          overlayForShadowGradient.fill = upFillShadow;
          break;

        case 'over':
          button.fill = overFillHighlight;
          overlayForShadowGradient.stroke = enabledStroke;
          overlayForShadowGradient.fill = overFillShadow;
          break;

        case 'pressed':
          button.fill = pressedFill;
          overlayForShadowGradient.stroke = enabledStroke;
          overlayForShadowGradient.fill = overFillShadow;
          break;

        case 'disabled':
          button.fill = disabledFillHighlight;
          overlayForShadowGradient.stroke = disabledStroke;
          overlayForShadowGradient.fill = disabledFillShadow;
          break;

        case 'disabled-pressed':
          button.fill = disabledPressedFillHighlight;
          overlayForShadowGradient.stroke = disabledStroke;
          overlayForShadowGradient.fill = disabledFillShadow;
          break;

        default:
          throw new Error( 'upsupported interactionState: ' + interactionState );
      }
    }

    // Function for creating the fills and strokes used to control the button's appearance.
    function updateFillsAndStrokes( baseColor ) {

      var transparentBaseColor = new Color( baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 0 );

      upFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
        .addColorStop( 0, baseColor )
        .addColorStop( 1, baseColor.colorUtilsBrighter( 0.7 ) );

      upFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
        .addColorStop( 0, transparentBaseColor )
        .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

      overFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
        .addColorStop( 0, baseColor.colorUtilsBrighter( 0.3 ) )
        .addColorStop( 1, baseColor.colorUtilsBrighter( 0.8 ) );

      overFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
        .addColorStop( 0, transparentBaseColor )
        .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

      pressedFill = createPressedFill( baseColor );

      disabledFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
        .addColorStop( 0, disabledBaseColor )
        .addColorStop( 1, disabledBaseColor.colorUtilsBrighter( 0.5 ) );

      disabledFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
        .addColorStop( 0, transparentDisabledBaseColor )
        .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

      disabledPressedFillHighlight = createPressedFill( disabledBaseColor );

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
        upFillHighlight, overFillHighlight, pressedFill, disabledFillHighlight, disabledPressedFillHighlight
      ];

      overlayForShadowGradient.cachedPaints = [
        upFillShadow, overFillShadow, disabledFillShadow,
        enabledStroke, disabledStroke
      ];

      updateAppearance( interactionStateProperty.value );
    }

    // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
    // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
    updateFillsAndStrokes( baseColorProperty.value );
    updateAppearance( interactionStateProperty.value );

    baseColorProperty.lazyLink( updateFillsAndStrokes );
    interactionStateProperty.lazyLink( updateAppearance );

    // add a dispose function
    this.dispose = function() {
      baseColorProperty.unlink( updateFillsAndStrokes );
      interactionStateProperty.unlink( updateAppearance );
    };
  };

  /**
   * Strategy for buttons that look flat, i.e. no shading or highlighting, but
   * that change color on mouseover, press, etc.
   * @param {Node} button
   * @param {Property.<boolean>} interactionStateProperty
   * @param {Property.<Color>} baseColorProperty
   * @param {Object} [options]
   * @constructor
   * @public
   */
  RoundButtonView.FlatAppearanceStrategy = function( button, interactionStateProperty, baseColorProperty, options ) {

    // Set up variables needed to create the various gradient fills
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );

    // various fills that are used to alter the button's appearance
    var upFill;
    var overFill;
    var downFill;
    var disabledFill;
    var disabledPressedFillVertical;
    var enabledStroke = null;
    var disabledStroke = null;

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

    // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
    // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
    updateFillsAndStrokes( baseColorProperty.value );
    updateAppearance( interactionStateProperty.value );

    baseColorProperty.lazyLink( updateFillsAndStrokes );
    interactionStateProperty.lazyLink( updateAppearance );

    // add a dispose function
    this.dispose = function() {
      baseColorProperty.unlink( updateFillsAndStrokes );
      interactionStateProperty.unlink( updateAppearance );
    };
  };

  /**
   * Basic strategy for controlling content appearance, fades the content by making it transparent when disabled.
   * @param {Node} content
   * @param {Property} interactionStateProperty
   */
  RoundButtonView.FadeContentWhenDisabled = function( content, interactionStateProperty ) {

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

  return inherit( Node, RoundButtonView, {

    /**
     * Sets the enabled state.
     * @param {boolean} value
     * @public
     */
    setEnabled: function( value ) {
      assert && assert( typeof value === 'boolean', 'RoundButtonView.enabled must be a boolean value' );
      this.buttonModel.enabledProperty.set( value );
    },
    set enabled( value ) { this.setEnabled( value ); },

    /**
     * Gets the enabled state.
     * @returns {boolean}
     * @public
     */
    getEnabled: function() {return this.buttonModel.enabledProperty.get(); },
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
      this.disposeRoundButtonView();
      Node.prototype.dispose.call( this );
    }
  } );
} );