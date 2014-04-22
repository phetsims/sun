// Copyright 2002-2014, University of Colorado Boulder

/**
 * Visual representation of a round button that uses gradients and such in
 * order to create a somewhat 3D look.  It is provided with a 'button model'
 * that is monitored to change the appearance of the button.
 *
 * Note: this is only the visual representation and does not have associated
 * input listeners (so that it can be reused in multiple contexts)
 * For a button that looks like this but has input listeners wired up,
 * please see RoundPushButton or RoundStickyToggleButton.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SUN/experimental/buttons/ButtonListener' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var HIGHLIGHT_GRADIENT_LENGTH = 5; // In screen coords, which are roughly pixels.

  /**
   * @param {Object} buttonModel
   * @param {Object} options
   * @constructor
   */
  function RoundButtonView( buttonModel, options ) {
    this.buttonModel = buttonModel;
    var thisButton = this;

    options = _.extend( {
      // Default values.
      radius: options.content ? undefined : 30,
      content: null,
      cursor: 'pointer',
      baseColor: new Color( 153, 206, 255 ),
      disabledBaseColor: new Color( 220, 220, 220 ),
      minXMargin: 5, // Minimum margin in x direction, i.e. on left and right
      minYMargin: 5, // Minimum margin in y direction, i.e. on top and bottom
      listener: null,
      fireOnDown: false,
      touchExpansion: 5, // Radius expansion for touch area, in screen units (roughly pixels)
      stroke: null, // No outline stroke by default
      lineWidth: 1, // Only meaningful if stroke is non-null

      // By default, icons are centered in the button, but icons with odd
      // shapes that are not wrapped in a normalizing parent node may need to
      // specify offsets to line things up properly
      iconOffsetX: 0,
      iconOffsetY: 0,

      // The following function controls how the appearance of the content
      // node is modified when this button is disabled.
      setContentEnabledLook: function( enabled ) {
        if ( content ) {
          enabled ? content.opacity = 1.0 : content.opacity = 0.3;
        }
      }
    }, options );

    Node.call( thisButton, { listener: options.listener, fireOnDown: options.fireOnDown } );
    var content = options.content; // convenience variable

    // Hook up the input listener
    this.addInputListener( new ButtonListener( buttonModel ) );

    // Use the user-specified radius if present, otherwise calculate the
    // radius based on the content and the margin.
    var buttonRadius = options.radius || Math.max( content.width + options.minXMargin * 2, content.height + options.minYMargin * 2 ) / 2;

    // Set up variables needed to create the various gradient fills and otherwise mod the appearance
    var upCenter = new Vector2( options.iconOffsetX, options.iconOffsetY );
    var baseColor = options.baseColor;
    var disabledBaseColor = options.disabledBaseColor;
    var transparentBaseColor = new Color( baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 0 );
    var transparentDisabledBaseColor = new Color( disabledBaseColor.getRed(), disabledBaseColor.getGreen(), disabledBaseColor.getBlue(), 0 );
    var lightenedStroke = null;
    if ( options.stroke ) {
      lightenedStroke = options.stroke instanceof Color ? options.stroke.colorUtilsBrighter( 0.5 ) : new Color( options.stroke ).colorUtilsBrighter( 0.5 );
    }

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

    // Create the basic button shape.
    var background = new Circle( buttonRadius,
      {
        fill: options.baseColor,
        lineWidth: options.lineWidth
      } );
    this.addChild( background );

    // Create the overlay that is used to add shading.
    var overlayForShadowGradient = new Circle( buttonRadius,
      {
        fill: options.baseColor,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );
    this.addChild( overlayForShadowGradient );

    if ( content ) {
      content.center = upCenter;
      thisButton.addChild( content );
    }

    // Hook up the function that will modify button appearance as the state changes.
    buttonModel.interactionStateProperty.link( function( interactionState ) {

      switch( interactionState ) {

        case 'idle':
          options.setContentEnabledLook( true );
          background.fill = upFillHighlight;
          overlayForShadowGradient.stroke = options.stroke;
          overlayForShadowGradient.fill = upFillShadow;
          thisButton.cursor = 'pointer';
          break;

        case 'over':
          options.setContentEnabledLook( true );
          background.fill = overFillHighlight;
          overlayForShadowGradient.stroke = options.stroke;
          overlayForShadowGradient.fill = overFillShadow;
          thisButton.cursor = 'pointer';
          break;

        case 'pressed':
          options.setContentEnabledLook( true );
          background.fill = pressedFill;
          overlayForShadowGradient.stroke = options.stroke;
          overlayForShadowGradient.fill = overFillShadow;
          thisButton.cursor = 'pointer';
          break;

        case 'disabled':
          options.setContentEnabledLook( false );
          background.fill = disabledFillHighlight;
          overlayForShadowGradient.stroke = lightenedStroke;
          overlayForShadowGradient.fill = disabledFillShadow;
          thisButton.cursor = null;
          break;

        case 'disabled-pressed':
          options.setContentEnabledLook( false );
          background.fill = disabledPressedFillHighlight;
          overlayForShadowGradient.stroke = lightenedStroke;
          overlayForShadowGradient.fill = disabledFillShadow;
          thisButton.cursor = null;
          break;
      }
    } );

    // Expand the touch area.
    this.touchArea = Shape.circle( 0, 0, buttonRadius + options.touchExpansion );

    // Set pickable such that sub-nodes are pruned from hit testing.
    this.pickable = null;

    // Mutate with the options after the layout is complete so that
    // width-dependent fields like centerX will work.
    thisButton.mutate( options );
  }

  return inherit( Node, RoundButtonView, {
    addListener: function( listener ) {
      // Pass through to button model.
      this.buttonModel.addListener( listener );
    },

    removeListener: function( listener ) {
      // Pass through to button model.
      this.buttonModel.removeListener( listener );
    },

    set enabled( value ) {
      assert && assert( typeof value === 'boolean', 'RoundButtonView.enabled must be a boolean value' );
      this.buttonModel.enabled = value;
    },

    get enabled() { return this.buttonModel.enabled; }
  } );
} );