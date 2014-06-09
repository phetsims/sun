// Copyright 2002-2014, University of Colorado Boulder

/**
 * Visual representation of a round button.  It is provided with a 'button
 * model' that is monitored to change the appearance of the button.
 *
 * Note: this is only the visual representation and does not have associated
 * input listeners so that it can be reused in multiple contexts.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var HIGHLIGHT_GRADIENT_LENGTH = 5; // In screen coords, which are roughly pixels.
  var DEFAULT_COLOR = new Color( 153, 206, 255 );

  /**
   * @param {ButtonModel} buttonModel
   * @param {Property} interactionStateProperty - A property that is used to drive the visual appearance of the button.
   * @param {Object} options
   * @constructor
   */
  function RoundButtonView( buttonModel, interactionStateProperty, options ) {
    this.buttonModel = buttonModel; // @protected
    var thisButton = this;

    options = _.extend( {
      // Default values.
      radius: options.content ? undefined : 30,
      content: null,
      cursor: 'pointer',
      baseColor: DEFAULT_COLOR,
      disabledBaseColor: new Color( 220, 220, 220 ),
      minXMargin: 5, // Minimum margin in x direction, i.e. on left and right
      minYMargin: 5, // Minimum margin in y direction, i.e. on top and bottom
      fireOnDown: false,
      touchExpansion: 5, // Radius expansion for touch area, in screen units (roughly pixels)
      stroke: DEFAULT_COLOR.colorUtilsDarker( 0.4 ),
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
      buttonAppearanceStrategy: RoundButtonView.threeDAppearanceStrategy,

      // Strategy for controlling the appearance of the button's content based
      // on the button's state.  This can be a stock strategy from this file,
      // or custom.  To create a custom one, model it off of the stock
      // version(s) defined in this file.
      contentAppearanceStrategy: RoundButtonView.fadeContentWhenDisabled
    }, options );

    Node.call( thisButton );
    var content = options.content; // convenience variable
    var upCenter = new Vector2( options.xContentOffset, options.yContentOffset );

    // Hook up the input listener
    this.addInputListener( new ButtonListener( buttonModel ) );

    // Use the user-specified radius if present, otherwise calculate the
    // radius based on the content and the margin.
    var buttonRadius = options.radius || Math.max( content.width + options.minXMargin * 2, content.height + options.minYMargin * 2 ) / 2;

    // Create the basic button shape.
    var button = new Circle( buttonRadius,
      {
        fill: options.baseColor,
        lineWidth: options.lineWidth
      } );
    this.addChild( button );

    // Hook up the strategy that will control the basic button appearance.
    options.buttonAppearanceStrategy( button, interactionStateProperty, options );

    // Add the content to the button.
    if ( content ) {
      content.center = upCenter;
      thisButton.addChild( content );
    }

    // Hook up the strategy that will control the content appearance.
    options.contentAppearanceStrategy( content, interactionStateProperty );

    // Control the pointer state based on the interaction state.
    interactionStateProperty.link( function( state ) {
      thisButton.cursor = state === 'disabled' || state === 'disabled-pressed' ? null : 'pointer';
    } );

    // Expand the touch area.
    this.touchArea = Shape.circle( 0, 0, buttonRadius + options.touchExpansion );

    // Set pickable such that sub-nodes are pruned from hit testing.
    this.pickable = null;

    // Mutate with the options after the layout is complete so that
    // width-dependent fields like centerX will work.
    thisButton.mutate( options );
  }

  /**
   * Strategy for making a button look 3D-ish by using gradients that create
   * the appearance of highlighted and shaded edges.
   *
   * @param {Node} button
   * @param {Property} interactionStateProperty
   * @param {Object} options
   * @constructor
   */
  RoundButtonView.threeDAppearanceStrategy = function( button, interactionStateProperty, options ) {

    // Set up variables needed to create the various gradient fills and otherwise mod the appearance
    var buttonRadius = button.width / 2;
    var baseColor = Color.toColor( options.baseColor );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var transparentBaseColor = new Color( baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 0 );
    var transparentDisabledBaseColor = new Color( disabledBaseColor.getRed(), disabledBaseColor.getGreen(), disabledBaseColor.getBlue(), 0 );
    var disabledStroke = options.stroke ? disabledBaseColor.colorUtilsDarker( 0.4 ) : null;

    // Create the overlay that is used to add shading.
    var overlayForShadowGradient = new Circle( buttonRadius,
      {
        fill: options.baseColor,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );
    button.addChild( overlayForShadowGradient );

    // The multiplier below can be varied in order to tweak the highlight appearance.
    var innerGradientRadius = buttonRadius - HIGHLIGHT_GRADIENT_LENGTH / 2;
    var outerGradientRadius = buttonRadius + HIGHLIGHT_GRADIENT_LENGTH / 2;
    var gradientOffset = HIGHLIGHT_GRADIENT_LENGTH / 2;

    // Create the gradient fills used for various button states
    var upFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseColor )
      .addColorStop( 1, baseColor.colorUtilsBrighter( 0.7 ) );

    var upFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var overFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.3 ) )
      .addColorStop( 1, baseColor.colorUtilsBrighter( 0.8 ) );

    var overFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    // Function to create a fill that represents a pressed in round button.
    function createPressedFill( color ) {
      return new RadialGradient( -gradientOffset, -gradientOffset, 0, 0, 0, outerGradientRadius )
        .addColorStop( 0, color.colorUtilsDarker( 0.1 ) )
        .addColorStop( 0.6, color.colorUtilsDarker( 0.2 ) )
        .addColorStop( 0.8, color )
        .addColorStop( 1, color.colorUtilsBrighter( 0.8 ) );
    }

    var pressedFill = createPressedFill( baseColor );

    var disabledFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, disabledBaseColor )
      .addColorStop( 1, disabledBaseColor.colorUtilsBrighter( 0.5 ) );

    var disabledFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, transparentDisabledBaseColor )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    var disabledPressedFillHighlight = createPressedFill( disabledBaseColor );

    // Hook up to the property that will trigger visual appearance changes.
    interactionStateProperty.link( function( state ) {
      switch( state ) {

        case 'idle':
          button.fill = upFillHighlight;
          overlayForShadowGradient.stroke = options.stroke;
          overlayForShadowGradient.fill = upFillShadow;
          break;

        case 'over':
          button.fill = overFillHighlight;
          overlayForShadowGradient.stroke = options.stroke;
          overlayForShadowGradient.fill = overFillShadow;
          break;

        case 'pressed':
          button.fill = pressedFill;
          overlayForShadowGradient.stroke = options.stroke;
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
      }
    } );
  };

  /**
   * Strategy for buttons that look flat, i.e. no shading or highlighting, but
   * that change color on mouseover, press, etc.
   *
   * @param {Node} button
   * @param {Property} interactionStateProperty
   * @param {Object} options
   * @constructor
   */
  RoundButtonView.flatAppearanceStrategy = function( button, interactionStateProperty, options ) {

    // Set up variables needed to create the various gradient fills
    var baseColor = Color.toColor( options.baseColor );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var disabledStroke = null;
    if ( options.stroke ) {
      disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    }

    // Create the fills used for various button states
    var upFill = baseColor;
    var overFill = baseColor.colorUtilsBrighter( 0.4 );
    var downFill = baseColor.colorUtilsDarker( 0.4 );
    var disabledFill = disabledBaseColor;
    var disabledPressedFillVertical = disabledFill;

    interactionStateProperty.link( function( state ) {
      switch( state ) {

        case 'idle':
          button.fill = upFill;
          button.stroke = options.stroke;
          break;

        case 'over':
          button.fill = overFill;
          button.stroke = options.stroke;
          break;

        case 'pressed':
          button.fill = downFill;
          button.stroke = options.stroke;
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
  RoundButtonView.fadeContentWhenDisabled = function( content, interactionStateProperty ) {
    if ( content ) {
      interactionStateProperty.link( function( state ) {
        content.opacity = state === 'disabled' || state === 'disabled-pressed' ? 0.3 : 1;
      } );
    }
  };

  return inherit( Node, RoundButtonView, {
    set enabled( value ) {
      assert && assert( typeof value === 'boolean', 'RoundButtonView.enabled must be a boolean value' );
      this.buttonModel.enabled = value;
    },

    get enabled() { return this.buttonModel.enabled; }
  } );
} );