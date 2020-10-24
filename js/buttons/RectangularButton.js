// Copyright 2014-2020, University of Colorado Boulder

/**
 * Visual representation of a rectangular button.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import AlignBox from '../../../scenery/js/nodes/AlignBox.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Color from '../../../scenery/js/util/Color.js';
import LinearGradient from '../../../scenery/js/util/LinearGradient.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonNode from './ButtonNode.js';

// constants
const VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
const HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
const SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.
const X_ALIGN_VALUES = [ 'center', 'left', 'right' ];
const Y_ALIGN_VALUES = [ 'center', 'top', 'bottom' ];

class RectangularButton extends ButtonNode {

  /**
   * @param {ButtonModel} buttonModel - Model that defines the button's behavior.
   * @param {Property} interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param {Object} [options]
   */
  constructor( buttonModel, interactionStateProperty, options ) {

    options = merge( {

      // {Node|null} what appears on the button (icon, label, etc.)
      content: null,

      minWidth: HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,
      minHeight: VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,
      cursor: 'pointer',
      xMargin: 8, // should be visibly greater than yMargin, see issue #109
      yMargin: 5,

      // pointer area dilation
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // pointer area shift, see https://github.com/phetsims/sun/issues/500
      touchAreaXShift: 0,
      touchAreaYShift: 0,
      mouseAreaXShift: 0,
      mouseAreaYShift: 0,

      stroke: undefined, // undefined by default, which will cause a stroke to be derived from the base color
      lineWidth: 0.5, // Only meaningful if stroke is non-null

      // Alignment, relevant only when options minWidth or minHeight are greater than the size of options.content
      xAlign: 'center', // {string} see X_ALIGN_VALUES
      yAlign: 'center', // {string} see Y_ALIGN_VALUES

      // radius applied to all corners unless a corner-specific value is provided
      cornerRadius: 4,

      // {number|null} corner-specific radii
      // If null, the option is ignored.
      // If non-null, it overrides cornerRadius for the associated corner of the button.
      leftTopCornerRadius: null,
      rightTopCornerRadius: null,
      leftBottomCornerRadius: null,
      rightBottomCornerRadius: null,

      // Class that determines the button's appearance for the values of interactionStateProperty.
      // See RectangularButton.ThreeDAppearanceStrategy for an example of the interface required.
      buttonAppearanceStrategy: RectangularButton.ThreeDAppearanceStrategy,

      // pdom
      tagName: 'button',

      // phet-io
      tandem: Tandem.OPTIONAL, // This duplicates the parent option and works around https://github.com/phetsims/tandem/issues/50
      visiblePropertyOptions: { phetioFeatured: true }
    }, options );

    // validate options
    assert && assert( _.includes( X_ALIGN_VALUES, options.xAlign ), 'invalid xAlign: ' + options.xAlign );
    assert && assert( _.includes( Y_ALIGN_VALUES, options.yAlign ), 'invalid yAlign: ' + options.yAlign );

    super( buttonModel, options );

    const content = options.content; // convenience variable

    // Compute the size of the button.
    const buttonWidth = Math.max( content ? content.width + options.xMargin * 2 : 0, options.minWidth );
    const buttonHeight = Math.max( content ? content.height + options.yMargin * 2 : 0, options.minHeight );

    // Create the rectangular part of the button.
    const button = new Path( createButtonShape( buttonWidth, buttonHeight, options ), {
      fill: this.baseColorProperty,
      lineWidth: options.lineWidth,
      pickable: false
    } );
    this.addChild( button );

    // Hook up the strategy that will control the button's appearance.
    const buttonAppearanceStrategy = new options.buttonAppearanceStrategy( button, interactionStateProperty,
      this.baseColorProperty, options );

    // Add the content to the button.
    let alignBox = null;
    if ( content ) {

      // Align content in the button rectangle. Must be disposed since it adds listener to content bounds.
      alignBox = new AlignBox( content, {
        alignBounds: new Bounds2(
          options.xMargin,
          options.yMargin,
          button.width - options.xMargin,
          buttonHeight - options.yMargin
        ),
        xAlign: options.xAlign,
        yAlign: options.yAlign,
        pickable: false // for performance
      } );
      this.addChild( alignBox );
    }

    // Set pointer areas.
    this.touchArea = button.localBounds
      .dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation )
      .shifted( options.touchAreaXShift, options.touchAreaYShift );
    this.mouseArea = button.localBounds
      .dilatedXY( options.mouseAreaXDilation, options.mouseAreaYDilation )
      .shifted( options.mouseAreaXShift, options.mouseAreaYShift );

    // @private
    this.disposeRectangularButton = () => {
      buttonAppearanceStrategy.dispose && buttonAppearanceStrategy.dispose();
      alignBox && alignBox.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeRectangularButton();
    super.dispose();
  }
}

/**
 * Convenience function for creating the shape of the button, done to avoid code duplication
 * @param {number} width
 * @param {number} height
 * @param {Object} config - RectangularButton config, containing values related to radii of button corners
 * @returns {Shape}
 */
function createButtonShape( width, height, config ) {
  assert && assert( typeof config.cornerRadius === 'number', 'cornerRadius is required' );
  return Shape.roundedRectangleWithRadii( 0, 0, width, height, {
    topLeft: config.leftTopCornerRadius !== null ? config.leftTopCornerRadius : config.cornerRadius,
    topRight: config.rightTopCornerRadius !== null ? config.rightTopCornerRadius : config.cornerRadius,
    bottomLeft: config.leftBottomCornerRadius !== null ? config.leftBottomCornerRadius : config.cornerRadius,
    bottomRight: config.rightBottomCornerRadius !== null ? config.rightBottomCornerRadius : config.cornerRadius
  } );
}

/**
 * ThreeDAppearanceStrategy is a value for RectangularButton options.buttonAppearanceStrategy. It makes a rectangular
 * button look 3D-ish by using gradients that create the appearance of highlighted and shaded edges. The gradients are
 * set up to make the light source appear to be in the upper left.
 */
class ThreeDAppearanceStrategy {

  /**
   * @param {Node} button - the Node for the button's shape, sans content
   * @param {Property.<String>} interactionStateProperty
   * @param {Property.<Color>} baseColorProperty
   * @param {Object} [options]
   */
  constructor( button, interactionStateProperty, baseColorProperty, options ) {

    const buttonWidth = button.width;
    const buttonHeight = button.height;

    // compute color stops for gradient, see issue #148
    assert && assert( buttonWidth >= HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH );
    assert && assert( buttonHeight >= VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH );
    const verticalHighlightStop = Math.min( VERTICAL_HIGHLIGHT_GRADIENT_LENGTH / buttonHeight, 1 );
    const verticalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonHeight, 0 );
    const horizontalHighlightStop = Math.min( HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH / buttonWidth, 1 );
    const horizontalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonWidth, 0 );
    const transparentWhite = new Color( 255, 255, 255, 0.7 );

    // Dynamic colors
    // TODO https://github.com/phetsims/sun/issues/553 missing "Property" suffix for all PaintColorProperty names
    const baseBrighter7 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.7 } );
    const baseBrighter5 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.5 } );
    const baseBrighter2 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.2 } );
    const baseDarker3 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.3 } );
    const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
    const baseDarker5 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.5 } );
    const baseTransparent = new DerivedProperty( [ baseColorProperty ], color => color.withAlpha( 0 ) );

    // Gradient fills for button states
    const upFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseBrighter7 )
      .addColorStop( verticalHighlightStop, baseColorProperty )
      .addColorStop( verticalShadowStop, baseColorProperty )
      .addColorStop( 1, baseDarker5 );

    const upFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, transparentWhite )
      .addColorStop( horizontalHighlightStop, baseTransparent )
      .addColorStop( horizontalShadowStop, baseTransparent )
      .addColorStop( 1, baseDarker5 );

    const overFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseBrighter7 )
      .addColorStop( verticalHighlightStop, baseBrighter5 )
      .addColorStop( verticalShadowStop, baseBrighter5 )
      .addColorStop( 1, baseDarker5 );

    const overFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, transparentWhite )
      .addColorStop( horizontalHighlightStop / 2, new Color( 255, 255, 255, 0 ) )
      .addColorStop( horizontalShadowStop, baseTransparent )
      .addColorStop( 1, baseDarker3 );

    const downFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseBrighter7 )
      .addColorStop( verticalHighlightStop * 0.67, baseDarker3 )
      .addColorStop( verticalShadowStop, baseBrighter2 )
      .addColorStop( 1, baseDarker5 );

    // Adds shading to left and right edges of the button.
    const horizontalShadingPath = new Path( createButtonShape( buttonWidth, buttonHeight, options ), {
      stroke: ( typeof ( options.stroke ) === 'undefined' ) ? baseDarker4 : options.stroke,
      lineWidth: options.lineWidth,
      pickable: false
    } );
    button.addChild( horizontalShadingPath );

    // Cache gradients
    button.cachedPaints = [ upFillVertical, overFillVertical, downFillVertical ];
    horizontalShadingPath.cachedPaints = [ upFillHorizontal, overFillHorizontal ];

    // Change colors to match interactionState
    function interactionStateListener( interactionState ) {

      switch( interactionState ) {

        case ButtonInteractionState.IDLE:
        case ButtonInteractionState.DISABLED:
          button.fill = upFillVertical;
          horizontalShadingPath.fill = upFillHorizontal;
          break;

        case ButtonInteractionState.OVER:
          button.fill = overFillVertical;
          horizontalShadingPath.fill = overFillHorizontal;
          break;

        case ButtonInteractionState.PRESSED:
        case ButtonInteractionState.DISABLED_PRESSED:
          button.fill = downFillVertical;
          horizontalShadingPath.fill = overFillHorizontal;
          break;

        default:
          throw new Error( `unsupported interactionState: ${interactionState}` );
      }
    }

    interactionStateProperty.link( interactionStateListener );

    // @public
    this.dispose = () => {
      if ( interactionStateProperty.hasListener( interactionStateListener ) ) {
        interactionStateProperty.unlink( interactionStateListener );
      }

      baseBrighter7.dispose();
      baseBrighter5.dispose();
      baseBrighter2.dispose();
      baseDarker3.dispose();
      baseDarker4.dispose();
      baseDarker5.dispose();
      baseTransparent.dispose();
    };
  }
}


/**
 * FlatAppearanceStrategy is a value for RectangularButton options.buttonAppearanceStrategy. It makes a rectangular
 * button look flat, i.e. no shading or highlighting, with color changes on mouseover, press, etc.
 */
class FlatAppearanceStrategy {

  /*
   * @param {Node} button - the Node for the button's shape, sans content
   * @param {Property.<boolean>} interactionStateProperty
   * @param {Property.<Color>} baseColorProperty
   * @param {Object} [options]
   */
  constructor( button, interactionStateProperty, baseColorProperty, options ) {

    // Dynamic colors
    const baseBrighter4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.4 } );
    const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );

    // Fills used for various button states
    const upFill = baseColorProperty;
    const overFill = baseBrighter4;
    const downFill = baseDarker4;

    // If the stroke wasn't provided, set a default
    button.stroke = ( typeof ( options.stroke ) === 'undefined' ) ? baseDarker4 : options.stroke;

    // Cache paints
    button.cachedPaints = [ upFill, overFill, downFill ];

    // Change colors to match interactionState
    function interactionStateListener( interactionState ) {
      switch( interactionState ) {

        case ButtonInteractionState.IDLE:
        case ButtonInteractionState.DISABLED:
          button.fill = upFill;
          break;

        case ButtonInteractionState.OVER:
          button.fill = overFill;
          break;

        case ButtonInteractionState.PRESSED:
        case ButtonInteractionState.DISABLED_PRESSED:
          button.fill = downFill;
          break;

        default:
          throw new Error( `unsupported interactionState: ${interactionState}` );
      }
    }

    interactionStateProperty.link( interactionStateListener );

    // @public
    this.dispose = () => {
      if ( interactionStateProperty.hasListener( interactionStateListener ) ) {
        interactionStateProperty.unlink( interactionStateListener );
      }

      baseBrighter4.dispose();
      baseDarker4.dispose();
    };
  }
}

// @public
RectangularButton.ThreeDAppearanceStrategy = ThreeDAppearanceStrategy;
RectangularButton.FlatAppearanceStrategy = FlatAppearanceStrategy;

sun.register( 'RectangularButton', RectangularButton );
export default RectangularButton;