// Copyright 2014-2020, University of Colorado Boulder

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

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import RadialGradient from '../../../scenery/js/util/RadialGradient.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import SunConstants from '../SunConstants.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonNode from './ButtonNode.js';

// constants
const HIGHLIGHT_GRADIENT_LENGTH = 5; // In screen coords, which are roughly pixels.
const DEFAULT_COLOR = ColorConstants.LIGHT_BLUE;

class RoundButtonView extends ButtonNode {

  /**
   * @param {ButtonModel} buttonModel
   * @param {Property} interactionStateProperty - A property that is used to drive the visual appearance of the button.
   * @param {Object} [options]
   */
  constructor( buttonModel, interactionStateProperty, options ) {

    options = merge( {

      // {Node|null} what appears on the button (icon, label, etc.)
      content: null,

      radius: ( options && options.content ) ? undefined : 30,
      cursor: 'pointer',
      baseColor: DEFAULT_COLOR,
      disabledBaseColor: ColorConstants.LIGHT_GRAY,
      minXMargin: 5, // Minimum margin in x direction, i.e. on left and right
      minYMargin: 5, // Minimum margin in y direction, i.e. on top and bottom
      fireOnDown: false,

      // pointer area dilation
      touchAreaDilation: 0, // radius dilation for touch area
      mouseAreaDilation: 0, // radius dilation for mouse area

      // pointer area shift
      touchAreaXShift: 0,
      touchAreaYShift: 0,
      mouseAreaXShift: 0,
      mouseAreaYShift: 0,

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
      contentAppearanceStrategy: RoundButtonView.FadeContentWhenDisabled,

      // phet-io
      tandem: Tandem.OPTIONAL, // This duplicates the parent option and works around https://github.com/phetsims/tandem/issues/50
      visiblePropertyOptions: { phetioFeatured: true },

      // pdom
      tagName: 'button'
    }, options );

    super( buttonModel, options );

    const content = options.content; // convenience variable

    // Compute the radius of the button.
    const buttonRadius = options.radius ||
                         Math.max( content.width + options.minXMargin * 2, content.height + options.minYMargin * 2 ) / 2;

    // Create the circular part of the button.
    const button = new Circle( buttonRadius, {
      fill: options.baseColor,
      lineWidth: options.lineWidth
    } );
    this.addChild( button );

    // Hook up the strategy that will control the button's appearance.
    const buttonAppearanceStrategy = new options.buttonAppearanceStrategy(
      button,
      interactionStateProperty,
      this.baseColorProperty,
      options
    );

    // Add the content to the button.
    if ( content ) {

      // For performance reasons, the content should be unpickable.
      content.pickable = false;

      content.center = new Vector2( options.xContentOffset, options.yContentOffset );
      this.addChild( content );
    }

    // Hook up the strategy that will control the content's appearance.
    const contentAppearanceStrategy = new options.contentAppearanceStrategy( content, interactionStateProperty );

    // Control the pointer state based on the interaction state.
    const handleInteractionStateChanged = state => {
      this.cursor = state === ButtonInteractionState.DISABLED ||
                    state === ButtonInteractionState.DISABLED_PRESSED ? null : 'pointer';
    };
    interactionStateProperty.link( handleInteractionStateChanged );

    // Set pointer areas.
    this.touchArea = Shape.circle( options.touchAreaXShift, options.touchAreaYShift,
      buttonRadius + options.touchAreaDilation );
    this.mouseArea = Shape.circle( options.mouseAreaXShift, options.mouseAreaYShift,
      buttonRadius + options.mouseAreaDilation );

    // Set pickable such that sub-nodes are pruned from hit testing.
    this.pickable = null;

    // PDOM - focus highlight is circular for round buttons, with a little bit of padding
    // between button shape and inner edge of highlight
    this.focusHighlight = Shape.circle( 0, 0, buttonRadius + 5 );

    // Mutate with the options after the layout is complete so that
    // width-dependent fields like centerX will work.
    this.mutate( options );

    // @private
    this.disposeRoundButtonView = () => {
      buttonAppearanceStrategy.dispose();
      contentAppearanceStrategy.dispose();
      if ( interactionStateProperty.hasListener( handleInteractionStateChanged ) ) {
        interactionStateProperty.unlink( handleInteractionStateChanged );
      }
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeRoundButtonView();
    super.dispose();
  }
}

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

  // Color properties
  // TODO https://github.com/phetsims/sun/issues/553 missing "Property" suffix for all PaintColorProperty names
  const baseBrighter8 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.8 } );
  const baseBrighter7 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.7 } );
  const baseBrighter3 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.3 } );
  const baseDarker1 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.1 } );
  const baseDarker2 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.2 } );
  const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
  const baseDarker5 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.5 } );
  const disabledBase = new PaintColorProperty( options.disabledBaseColor );
  const disabledBaseBrighter8 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: 0.8 } );
  const disabledBaseBrighter5 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: 0.5 } );
  const disabledBaseDarker1 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.1 } );
  const disabledBaseDarker2 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.2 } );
  const disabledBaseDarker4 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.4 } );
  const disabledBaseDarker5 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.5 } );
  const baseTransparent = new DerivedProperty( [ baseColorProperty ], color => color.withAlpha( 0 ) );
  const disabledBaseTransparent = new DerivedProperty( [ disabledBase ], color => color.withAlpha( 0 ) );

  // Set up variables needed to create the various gradient fills and otherwise mod the appearance
  const buttonRadius = button.width / 2;
  const innerGradientRadius = buttonRadius - HIGHLIGHT_GRADIENT_LENGTH / 2;
  const outerGradientRadius = buttonRadius + HIGHLIGHT_GRADIENT_LENGTH / 2;
  const gradientOffset = HIGHLIGHT_GRADIENT_LENGTH / 2;

  const upFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
    .addColorStop( 0, baseColorProperty )
    .addColorStop( 1, baseBrighter7 );

  const upFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
    .addColorStop( 0, baseTransparent )
    .addColorStop( 1, baseDarker5 );

  const overFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
    .addColorStop( 0, baseBrighter3 )
    .addColorStop( 1, baseBrighter8 );

  const overFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
    .addColorStop( 0, baseTransparent )
    .addColorStop( 1, baseDarker5 );

  const pressedFill = new RadialGradient( -gradientOffset, -gradientOffset, 0, 0, 0, outerGradientRadius )
    .addColorStop( 0, baseDarker1 )
    .addColorStop( 0.6, baseDarker2 )
    .addColorStop( 0.8, baseColorProperty )
    .addColorStop( 1, baseBrighter8 );

  const disabledFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
    .addColorStop( 0, options.disabledBaseColor )
    .addColorStop( 1, disabledBaseBrighter5 );

  const disabledFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
    .addColorStop( 0, disabledBaseTransparent )
    .addColorStop( 1, disabledBaseDarker5 );

  const disabledPressedFillHighlight = new RadialGradient( -gradientOffset, -gradientOffset, 0, 0, 0, outerGradientRadius )
    .addColorStop( 0, disabledBaseDarker1 )
    .addColorStop( 0.6, disabledBaseDarker2 )
    .addColorStop( 0.8, options.disabledBaseColor )
    .addColorStop( 1, disabledBaseBrighter8 );

  let enabledStroke = null;
  let disabledStroke = null;

  if ( options.stroke === null ) {
    // The stroke was explicitly set to null, so the button should have no stroke.
    enabledStroke = null;
    disabledStroke = null;
  }
  else if ( typeof ( options.stroke ) === 'undefined' ) {
    // No stroke was defined, but it wasn't set to null, so default to a stroke based on the base color of the
    // button.  This behavior is a bit unconventional for Scenery nodes, but it makes the buttons look much better.
    enabledStroke = baseDarker4;
    disabledStroke = disabledBaseDarker4;
  }
  else {
    enabledStroke = options.stroke;
    disabledStroke = disabledBaseDarker4;
  }

  // Create and add the overlay that is used to add shading.
  const overlayForShadowGradient = new Circle( buttonRadius, { lineWidth: options.lineWidth, pickable: false } );
  button.addChild( overlayForShadowGradient );

  button.cachedPaints = [
    upFillHighlight, overFillHighlight, pressedFill, disabledFillHighlight, disabledPressedFillHighlight
  ];

  overlayForShadowGradient.cachedPaints = [
    upFillShadow, overFillShadow, disabledFillShadow,
    enabledStroke, disabledStroke
  ];

  // Function for updating the button's appearance based on the current interaction state.
  function updateAppearance( interactionState ) {

    switch( interactionState ) {

      case ButtonInteractionState.IDLE:
        button.fill = upFillHighlight;
        overlayForShadowGradient.stroke = enabledStroke;
        overlayForShadowGradient.fill = upFillShadow;
        break;

      case ButtonInteractionState.OVER:
        button.fill = overFillHighlight;
        overlayForShadowGradient.stroke = enabledStroke;
        overlayForShadowGradient.fill = overFillShadow;
        break;

      case ButtonInteractionState.PRESSED:
        button.fill = pressedFill;
        overlayForShadowGradient.stroke = enabledStroke;
        overlayForShadowGradient.fill = overFillShadow;
        break;

      case ButtonInteractionState.DISABLED:
        button.fill = disabledFillHighlight;
        overlayForShadowGradient.stroke = disabledStroke;
        overlayForShadowGradient.fill = disabledFillShadow;
        break;

      case ButtonInteractionState.DISABLED_PRESSED:
        button.fill = disabledPressedFillHighlight;
        overlayForShadowGradient.stroke = disabledStroke;
        overlayForShadowGradient.fill = disabledFillShadow;
        break;

      default:
        throw new Error( 'upsupported interactionState: ' + interactionState );
    }
  }

  // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
  // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
  interactionStateProperty.link( updateAppearance );

  // add a dispose function
  this.dispose = () => {
    if ( interactionStateProperty.hasListener( updateAppearance ) ) {
      interactionStateProperty.unlink( updateAppearance );
    }

    baseTransparent.dispose();
    disabledBaseTransparent.dispose();
    disabledBase.dispose();
    baseBrighter8.dispose();
    baseBrighter7.dispose();
    baseBrighter3.dispose();
    baseDarker1.dispose();
    baseDarker2.dispose();
    baseDarker4.dispose();
    baseDarker5.dispose();
    disabledBaseBrighter8.dispose();
    disabledBaseBrighter5.dispose();
    disabledBaseDarker1.dispose();
    disabledBaseDarker2.dispose();
    disabledBaseDarker4.dispose();
    disabledBaseDarker5.dispose();
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

  // Color properties
  const baseBrighter4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.4 } );
  const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
  const disabledBaseDarker4 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.4 } );

  // various fills that are used to alter the button's appearance
  const upFill = baseColorProperty;
  const overFill = baseBrighter4;
  const downFill = baseDarker4;
  const disabledFill = options.disabledBaseColor;
  const disabledPressedFillVertical = disabledFill;

  let enabledStroke = null;
  let disabledStroke = null;

  if ( options.stroke === null ) {
    // The stroke was explicitly set to null, so the button should have no stroke.
    enabledStroke = null;
    disabledStroke = null;
  }
  else if ( typeof ( options.stroke ) === 'undefined' ) {
    // No stroke was defined, but it wasn't set to null, so default to a stroke based on the base color of the
    // button.  This behavior is a bit unconventional for Scenery nodes, but it makes the buttons look much better.
    enabledStroke = baseDarker4;
    disabledStroke = disabledBaseDarker4;
  }
  else {
    enabledStroke = options.stroke;
    disabledStroke = disabledBaseDarker4;
  }

  button.cachedPaints = [
    upFill, overFill, downFill, disabledFill, disabledPressedFillVertical,
    enabledStroke, disabledStroke
  ];

  function updateAppearance( interactionState ) {
    switch( interactionState ) {
      case ButtonInteractionState.IDLE:
        button.fill = upFill;
        button.stroke = enabledStroke;
        break;

      case ButtonInteractionState.OVER:
        button.fill = overFill;
        button.stroke = enabledStroke;
        break;

      case ButtonInteractionState.PRESSED:
        button.fill = downFill;
        button.stroke = enabledStroke;
        break;

      case ButtonInteractionState.DISABLED:
        button.fill = disabledFill;
        button.stroke = disabledStroke;
        break;

      case ButtonInteractionState.DISABLED_PRESSED:
        button.fill = disabledPressedFillVertical;
        button.stroke = disabledStroke;
        break;

      default:
        throw new Error( 'upsupported interactionState: ' + interactionState );
    }
  }

  // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
  // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
  interactionStateProperty.link( updateAppearance );

  // add a dispose function
  this.dispose = () => {
    if ( interactionStateProperty.hasListener( updateAppearance ) ) {
      interactionStateProperty.unlink( updateAppearance );
    }
    baseBrighter4.dispose();
    baseDarker4.dispose();
    disabledBaseDarker4.dispose();
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
      content.opacity = state === ButtonInteractionState.DISABLED ||
                        state === ButtonInteractionState.DISABLED_PRESSED ? SunConstants.DISABLED_OPACITY : 1;
    }
  }

  interactionStateProperty.link( updateOpacity );

  // add dispose function to unlink listener
  this.dispose = () => {
    if ( interactionStateProperty.hasListener( updateOpacity ) ) {
      interactionStateProperty.unlink( updateOpacity );
    }
  };
};

sun.register( 'RoundButtonView', RoundButtonView );
export default RoundButtonView;