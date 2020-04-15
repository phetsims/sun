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
import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import AlignBox from '../../../scenery/js/nodes/AlignBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Color from '../../../scenery/js/util/Color.js';
import LinearGradient from '../../../scenery/js/util/LinearGradient.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import SunConstants from '../SunConstants.js';
import ButtonInteractionState from './ButtonInteractionState.js';

// constants
const VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
const HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
const SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.
const DEFAULT_COLOR = ColorConstants.LIGHT_BLUE;
const X_ALIGN_VALUES = [ 'center', 'left', 'right' ];
const Y_ALIGN_VALUES = [ 'center', 'top', 'bottom' ];

/**
 * @param {ButtonModel} buttonModel - Model that defines the button's behavior.
 * @param {Property.<String>} interactionStateProperty - A property that is used to drive the visual appearance of the button.
 * @param {Object} [options]
 * @constructor
 */
function RectangularButtonView( buttonModel, interactionStateProperty, options ) {

  options = merge( {

    content: null,
    minWidth: HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,
    minHeight: VERTICAL_HIGHLIGHT_GRADIENT_LENGTH + SHADE_GRADIENT_LENGTH,
    cursor: 'pointer',
    baseColor: DEFAULT_COLOR,
    disabledBaseColor: ColorConstants.LIGHT_GRAY,
    xMargin: 8, // should be visibly greater than yMargin, see issue #109
    yMargin: 5,
    fireOnDown: false,

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

    // Options that will be passed through to the main input listener (PressListener)
    listenerOptions: null,

    // pdom
    tagName: 'button',

    // phet-io
    tandem: Tandem.OPTIONAL // This duplicates the parent option and works around https://github.com/phetsims/tandem/issues/50
  }, options );

  // validate options
  assert && assert( _.includes( X_ALIGN_VALUES, options.xAlign ), 'invalid xAlign: ' + options.xAlign );
  assert && assert( _.includes( Y_ALIGN_VALUES, options.yAlign ), 'invalid yAlign: ' + options.yAlign );

  options.listenerOptions = merge( {
    tandem: options.tandem.createTandem( 'pressListener' ),
    accessibleClick: options.accessibleClick
  }, options.listenerOptions );

  // Use this pattern so that passed in phetioComponentOptions are not blown away.
  PhetioObject.mergePhetioComponentOptions( { visibleProperty: { phetioFeatured: true } }, options );

  this.buttonModel = buttonModel; // @protected

  Node.call( this );

  const content = options.content; // convenience variable

  // Hook up the input listener
  // @private (a11y) {PressListener}
  this._pressListener = buttonModel.createListener( options.listenerOptions );
  this.addInputListener( this._pressListener );

  // @private - make the base color into a property so that the appearance strategy can update itself if changes occur.
  this.baseColorProperty = new PaintColorProperty( options.baseColor ); // @private

  // Figure out the size of the button.
  const buttonWidth = Math.max( content ? content.width + options.xMargin * 2 : 0, options.minWidth );
  const buttonHeight = Math.max( content ? content.height + options.yMargin * 2 : 0, options.minHeight );

  // create and add the button node
  const button = new Path( createButtonShape( buttonWidth, buttonHeight, options ), {
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

    // align content in the button, this AlignBox must be disposed since it adds listener to content bounds
    var alignBox = new AlignBox( content, {
      alignBounds: new Bounds2(
        options.xMargin,
        options.yMargin,
        button.width - options.xMargin,
        buttonHeight - options.yMargin
      ),
      xAlign: options.xAlign,
      yAlign: options.yAlign
    } );
    this.addChild( alignBox );
  }

  // Hook up the strategy that will control the basic button appearance.
  const buttonAppearanceStrategy = new options.buttonAppearanceStrategy(
    button,
    interactionStateProperty,
    this.baseColorProperty,
    options
  );

  // Hook up the strategy that will control the content appearance.
  const contentAppearanceStrategy = new options.contentAppearanceStrategy( content, interactionStateProperty, options );

  // Control the pointer state based on the interaction state.
  // Control the pointer state based on the interaction state.
  const self = this;

  function handleInteractionStateChanged( state ) {
    self.cursor = state === ButtonInteractionState.DISABLED ||
                  state === ButtonInteractionState.DISABLED_PRESSED ? null : 'pointer';
  }

  interactionStateProperty.link( handleInteractionStateChanged );

  // set pointer areas
  this.touchArea = button.localBounds
    .dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation )
    .shifted( options.touchAreaXShift, options.touchAreaYShift );
  this.mouseArea = button.localBounds
    .dilatedXY( options.mouseAreaXDilation, options.mouseAreaYDilation )
    .shifted( options.mouseAreaXShift, options.mouseAreaYShift );

  // Mutate with the options after the layout is complete so that width-
  // dependent fields like centerX will work.
  this.mutate( options );

  // define a dispose function
  this.disposeRectangularButtonView = function() {
    buttonAppearanceStrategy.dispose();
    contentAppearanceStrategy.dispose();
    this.baseColorProperty.dispose();
    this._pressListener.dispose();
    if ( interactionStateProperty.hasListener( handleInteractionStateChanged ) ) {
      interactionStateProperty.unlink( handleInteractionStateChanged );
    }

    if ( content ) {
      alignBox.dispose();
    }
  };
}

sun.register( 'RectangularButtonView', RectangularButtonView );

/**
 * Convenience function for creating the shape of the button, done to avoid code duplication
 * @param {number} width
 * @param {number} height
 * @param {Object} config - RectangularButtonView config, containing values related to radii of button corners
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
 * Strategy for making a button look 3D-ish by using gradients that create the appearance of highlighted and shaded
 * edges.  The gradients are set up to make the light source appear to be in the upper left.
 * @param {Node} button
 * @param {Property.<String>} interactionStateProperty
 * @param {Property.<Color>} baseColorProperty
 * @param {Object} [options]
 * @constructor
 * @public
 */
RectangularButtonView.ThreeDAppearanceStrategy = function( button,
                                                           interactionStateProperty,
                                                           baseColorProperty,
                                                           options ) {

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

  // Color properties
  // TODO https://github.com/phetsims/sun/issues/553 missing "Property" suffix for all PaintColorProperty names
  const baseBrighter7 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.7 } );
  const baseBrighter5 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.5 } );
  const baseBrighter2 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.2 } );
  const baseDarker3 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.3 } );
  const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
  const baseDarker5 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.5 } );
  const disabledBase = new PaintColorProperty( options.disabledBaseColor );
  const disabledBaseBrighter7 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: 0.7 } );
  const disabledBaseBrighter5 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: 0.5 } );
  const disabledBaseBrighter2 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: 0.2 } );
  const disabledBaseDarker3 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.3 } );
  const disabledBaseDarker4 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.4 } );
  const disabledBaseDarker5 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.5 } );
  const baseTransparent = new DerivedProperty( [ baseColorProperty ], function( color ) {
    return color.withAlpha( 0 );
  } );
  const disabledBaseTransparent = new DerivedProperty( [ disabledBase ], function( color ) {
    return color.withAlpha( 0 );
  } );

  // Create the gradient fills used for various button states
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

  const disabledFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
    .addColorStop( 0, disabledBaseBrighter7 )
    .addColorStop( verticalHighlightStop, disabledBaseBrighter5 )
    .addColorStop( verticalShadowStop, disabledBaseBrighter5 )
    .addColorStop( 1, disabledBaseDarker5 );

  const disabledFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
    .addColorStop( 0, disabledBaseBrighter7 )
    .addColorStop( horizontalHighlightStop, disabledBaseTransparent )
    .addColorStop( horizontalShadowStop, disabledBaseTransparent )
    .addColorStop( 1, disabledBaseDarker5 );

  const disabledPressedFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
    .addColorStop( 0, disabledBaseBrighter7 )
    .addColorStop( verticalHighlightStop * 0.67, disabledBaseDarker3 )
    .addColorStop( verticalShadowStop, disabledBaseBrighter2 )
    .addColorStop( 1, disabledBaseDarker5 );

  // strokes filled in below
  let enabledStroke;
  let disabledStroke;

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

  // Create the overlay that is used to add shading to left and right edges of the button.
  const overlayForHorizGradient = new Path( createButtonShape( buttonWidth, buttonHeight, options ), {
    lineWidth: options.lineWidth,
    pickable: false
  } );
  button.addChild( overlayForHorizGradient );

  button.cachedPaints = [
    upFillVertical, overFillVertical, downFillVertical, disabledFillVertical, disabledPressedFillVertical,
    disabledStroke
  ];

  overlayForHorizGradient.cachedPaints = [
    upFillHorizontal, overFillHorizontal, disabledFillHorizontal, enabledStroke, disabledStroke
  ];

  // Function for updating the button's appearance based on the current interaction state.
  function updateAppearance( interactionState ) {

    switch( interactionState ) {

      case ButtonInteractionState.IDLE:
        button.fill = upFillVertical;
        overlayForHorizGradient.stroke = enabledStroke;
        overlayForHorizGradient.fill = upFillHorizontal;
        break;

      case ButtonInteractionState.OVER:
        button.fill = overFillVertical;
        overlayForHorizGradient.stroke = enabledStroke;
        overlayForHorizGradient.fill = overFillHorizontal;
        break;

      case ButtonInteractionState.PRESSED:
        button.fill = downFillVertical;
        overlayForHorizGradient.stroke = enabledStroke;
        overlayForHorizGradient.fill = overFillHorizontal;
        break;

      case ButtonInteractionState.DISABLED:
        button.fill = disabledFillVertical;
        button.stroke = disabledStroke;
        overlayForHorizGradient.stroke = disabledStroke;
        overlayForHorizGradient.fill = disabledFillHorizontal;
        break;

      case ButtonInteractionState.DISABLED_PRESSED:
        button.fill = disabledPressedFillVertical;
        button.stroke = disabledStroke;
        overlayForHorizGradient.stroke = disabledStroke;
        overlayForHorizGradient.fill = disabledFillHorizontal;
        break;

      default:
        throw new Error( 'unsupported interactionState: ' + interactionState );
    }
  }

  // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
  // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
  interactionStateProperty.link( updateAppearance );

  this.dispose = function() {
    if ( interactionStateProperty.hasListener( updateAppearance ) ) {
      interactionStateProperty.unlink( updateAppearance );
    }

    baseTransparent.dispose();
    disabledBaseTransparent.dispose();
    disabledBase.dispose();
    baseBrighter7.dispose();
    baseBrighter5.dispose();
    baseBrighter2.dispose();
    baseDarker3.dispose();
    baseDarker4.dispose();
    baseDarker5.dispose();
    disabledBaseBrighter7.dispose();
    disabledBaseBrighter5.dispose();
    disabledBaseBrighter2.dispose();
    disabledBaseDarker3.dispose();
    disabledBaseDarker4.dispose();
    disabledBaseDarker5.dispose();
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

  // Color properties
  const baseBrighter4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.4 } );
  const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );
  const disabledBaseDarker4 = new PaintColorProperty( options.disabledBaseColor, { luminanceFactor: -0.4 } );

  // fills used for various button states
  const upFill = baseColorProperty;
  const overFill = baseBrighter4;
  const downFill = baseDarker4;
  const disabledFill = options.disabledBaseColor;
  const disabledPressedFillVertical = disabledFill;

  let enabledStroke;
  let disabledStroke;

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
        throw new Error( 'unsupported interactionState: ' + interactionState );
    }
  }

  interactionStateProperty.link( updateAppearance );

  this.dispose = function() {
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
      content.opacity = state === ButtonInteractionState.DISABLED ||
                        state === ButtonInteractionState.DISABLED_PRESSED ? SunConstants.DISABLED_OPACITY : 1;
    }
  }

  interactionStateProperty.link( updateOpacity );

  // add dispose function to unlink listener
  this.dispose = function() {
    if ( interactionStateProperty.hasListener( updateOpacity ) ) {
      interactionStateProperty.unlink( updateOpacity );
    }
  };
};

inherit( Node, RectangularButtonView, {

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
   * Gets the enabledProperty. This is meant to be a workaround for https://github.com/phetsims/sun/issues/515 while
   * https://github.com/phetsims/sun/issues/257 is being figured out and worked on.
   * TODO: remove me once https://github.com/phetsims/sun/issues/257 is complete
   * @returns {Property.<boolean>}
   * @public
   */
  getEnabledProperty: function() { return this.buttonModel.enabledProperty; },

  /**
   * Sets the base color, which is the main background fill color used for the button.
   * @param {null|string|Color|Property.<string|Color>} baseColor
   * @public
   */
  setBaseColor: function( baseColor ) { this.baseColorProperty.paint = baseColor; },
  set baseColor( baseColor ) { this.setBaseColor( baseColor ); },

  /**
   * Gets the base color for this button.
   * @returns {Color}
   * @public
   */
  getBaseColor: function() { return this.baseColorProperty.value; },
  get baseColor() { return this.getBaseColor(); },

  /**
   * Clicks the button. Recommended only for accessibility usages. For the most part, a11y button functionality should
   * be managed by the PressListener. This is more for edge cases.
   * @public
   * @a11y
   */
  a11yClick: function() {
    this._pressListener.click();
  },

  /**
   * dispose function
   * @public
   */
  dispose: function() {
    this.disposeRectangularButtonView();
    Node.prototype.dispose.call( this );
  }
} );

export default RectangularButtonView;