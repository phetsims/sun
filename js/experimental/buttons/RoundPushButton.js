// Copyright 2002-2014, University of Colorado Boulder

/**
 * A round push button that draws gradients and such in order to create
 * a somewhat 3D look.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Includes
  var AbstractButton = require( 'SUN/experimental/buttons/AbstractButton' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var HIGHLIGHT_GRADIENT_LENGTH = 5; // In screen coords, which are roughly pixels.

  /**
   * @param {Node} content - Node to put on surface of button, could be text, icon, or whatever
   * @param {Object} options
   * @constructor
   */
  function RoundPushButton( content, options ) {

    var thisButton = this;

    options = _.extend( {
      // Default values.
      cursor: 'pointer',
      baseColor: new Color( 153, 206, 255 ),
      disabledBaseColor: new Color( 220, 220, 220 ),
      minXPadding: 5, // Minimum padding in x direction, i.e. on left and right
      minYPadding: 5, // Minimum padding in x direction, i.e. on top and bottom
      listener: null,
      fireOnDown: false,
      touchExpansion: 5, // In screen units (roughly pixels) beyond button's edge.

      // By default, icons are centered in the button, but icons with odd
      // shapes that are not wrapped in a normalizing parent node may need to
      // specify offsets to line things up properly
      iconOffsetX: 0,
      iconOffsetY: 0
    }, options );

    AbstractButton.call( thisButton, { listener: options.listener, fireOnDown: options.fireOnDown } );

    var buttonRadius = Math.max( content.width + options.minXPadding * 2, content.height + options.minYPadding * 2 ) / 2;
    var upCenter = new Vector2( options.iconOffsetX, options.iconOffsetY );
    var downCenter = upCenter.plus( new Vector2( 0.0, 0.0 ) ); // TODO: Set to zero on 3/36/2014 because text was moving inconsistently.  Decide whether to eliminate completely.
    var baseColor = options.baseColor;
    var disabledBaseColor = options.disabledBaseColor;
    var transparentBaseColor = new Color( baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 0 );
    var transparentDisabledBaseColor = new Color( disabledBaseColor.getRed(), disabledBaseColor.getGreen(), disabledBaseColor.getBlue(), 0 );

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

    var downFill = new RadialGradient( 0, 0, 0, 0, 0, outerGradientRadius )
      .addColorStop( 0, baseColor )
      .addColorStop( 0.5, baseColor )
      .addColorStop( 0.6, baseColor.colorUtilsDarker( 0.1 ) )
      .addColorStop( 0.8, baseColor )
      .addColorStop( 1, baseColor.colorUtilsBrighter( 0.7 ) );

    var disabledFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, disabledBaseColor )
      .addColorStop( 1, disabledBaseColor.colorUtilsBrighter( 0.5 ) );

    var disabledFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, transparentDisabledBaseColor )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    // Create the basic button shape.
    var background = new Circle( buttonRadius,
      {
        fill: options.baseColor
      } );
    this.addChild( background );

    // Create the overlay that is used to add shading.
    var overlayForShadowGradient = new Circle( buttonRadius,
      {
        fill: options.baseColor
      } );
    this.addChild( overlayForShadowGradient );

    content.center = upCenter;
    thisButton.addChild( content );

    // Hook up the function that will modify button appearance as the state changes.
    this.buttonModel.interactionState.link( function( interactionState ) {

      switch( interactionState ) {

        case 'idle':
          content.center = upCenter;
          content.opacity = 1;
          background.fill = upFillHighlight;
          overlayForShadowGradient.fill = upFillShadow;
          thisButton.pickable = true;
          break;

        case 'over':
          content.center = upCenter;
          content.opacity = 1;
          background.fill = overFillHighlight;
          overlayForShadowGradient.fill = overFillShadow;
          thisButton.pickable = true;
          break;

        case 'pressed':
          content.center = downCenter;
          content.opacity = 1;
          background.fill = downFill;
          overlayForShadowGradient.fill = overFillShadow;
          thisButton.pickable = true;
          break;

        case 'disabled':
          content.center = upCenter;
          content.opacity = 0.3;
          background.fill = disabledFillHighlight;
          overlayForShadowGradient.fill = disabledFillShadow;
          thisButton.pickable = false;
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

  return inherit( AbstractButton, RoundPushButton );
} );