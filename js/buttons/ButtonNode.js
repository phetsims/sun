// Copyright 2020, University of Colorado Boulder

/**
 * ButtonNode is the base class for the sun button hierarchy.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import AlignBox from '../../../scenery/js/nodes/AlignBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import EnabledNode from '../EnabledNode.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';

// constants
const X_ALIGN_VALUES = [ 'center', 'left', 'right' ];
const Y_ALIGN_VALUES = [ 'center', 'top', 'bottom' ];

class ButtonNode extends Node {

  /**
   * @param {ButtonModel} buttonModel
   * @param {Node} buttonBackground - the background of the button (like a circle or rectangle).
   * @param {Property} interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param {Object} [options] - this type does not mutate its options, but relies on the subtype to
   */
  constructor( buttonModel, buttonBackground, interactionStateProperty, options ) {

    options = merge( {

      // {Node|null} what appears on the button (icon, label, etc.)
      content: null,

      xMargin: 10, // margin in x direction, i.e. on left and right
      yMargin: 5, // margin in y direction, i.e. on top and bottom

      // Alignment, relevant only when options minWidth or minHeight are greater than the size of options.content
      xAlign: 'center', // {string} see X_ALIGN_VALUES
      yAlign: 'center', // {string} see Y_ALIGN_VALUES

      // By default, icons are centered in the button, but icons with odd
      // shapes that are not wrapped in a normalizing parent node may need to
      // specify offsets to line things up properly
      xContentOffset: 0,
      yContentOffset: 0,

      // Options that will be passed through to the main input listener (PressListener)
      listenerOptions: null,

      // {ColorDef} initial color of the button's background
      baseColor: ColorConstants.LIGHT_BLUE,

      // {string} default cursor
      cursor: 'pointer',

      // Class that determines the button's appearance for the values of interactionStateProperty.
      // Constructor is {function( backgroundNode:Node, interactionStateProperty:Property, options:*)},
      // and the class has an optional dispose method.
      // See ButtonNode.FlatAppearanceStrategy for an example.
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,

      // Optional class that determines the content's appearance for the values of interactionStateProperty.
      // Constructor is {function( content:Node, interactionStateProperty:Property, options:*)},
      // and the class has an optional dispose method.
      // See RectangularRadioButton.ContentAppearanceStrategy for an example.
      contentAppearanceStrategy: null,

      // phet-io
      // TODO: workaround for difficulty in mutate/instrumentation order of sun buttons,
      //  see https://github.com/phetsims/sun/issues/643 or https://github.com/phetsims/sun/issues/515
      phetioLinkEnabledElement: false,
      tandem: Tandem.OPTIONAL,
      visiblePropertyOptions: { phetioFeatured: true }
    }, options );

    options.listenerOptions = merge( {
      tandem: options.tandem.createTandem( 'pressListener' )
    }, options.listenerOptions );

    assert && options.enabledProperty && assert( options.enabledProperty === buttonModel.enabledProperty,
      'if options.enabledProperty is provided, it must === buttonModel.enabledProperty' );
    options.enabledProperty = buttonModel.enabledProperty;

    // validate options - TODO: are these needed? Won't AlignBox handle this validation? https://github.com/phetsims/sun/issues/643
    assert && assert( _.includes( X_ALIGN_VALUES, options.xAlign ), 'invalid xAlign: ' + options.xAlign );
    assert && assert( _.includes( Y_ALIGN_VALUES, options.yAlign ), 'invalid yAlign: ' + options.yAlign );

    super();

    this.initializeEnabledNode( options );

    // @protected
    this.buttonModel = buttonModel;

    // Make the base color into a Property so that the appearance strategy can update itself if changes occur.
    this.baseColorProperty = new PaintColorProperty( options.baseColor ); // @private

    // @private {PressListener}
    this._pressListener = buttonModel.createPressListener( options.listenerOptions );
    this.addInputListener( this._pressListener );

    assert && assert( buttonBackground.fill === null, 'ButtonNode controls the fill for the buttonBackground' );
    buttonBackground.pickable = false;
    buttonBackground.fill = this.baseColorProperty;
    this.addChild( buttonBackground );

    // Hook up the strategy that will control the button's appearance.
    const buttonAppearanceStrategy = new options.buttonAppearanceStrategy( buttonBackground, interactionStateProperty,
      this.baseColorProperty, options );

    // Optionally hook up the strategy that will control the content's appearance.
    let contentAppearanceStrategy;
    if ( options.contentAppearanceStrategy ) {
      contentAppearanceStrategy = new options.contentAppearanceStrategy( options.content, interactionStateProperty, options );
    }

    let alignBox = null;
    if ( options.content ) {

      // Align content in the button rectangle. Must be disposed since it adds listener to content bounds.
      alignBox = new AlignBox( options.content, {

        alignBounds: buttonBackground.bounds,
        xAlign: options.xAlign,
        yAlign: options.yAlign,

        // TODO https://github.com/phetsims/sun/issues/643 Margins here would be broken for round buttons if they
        //  don't use the same value for x and y. Because they are used here differently from how they are used to
        //  calculate radius in RoundButton (as a minimum). Is that OK?

        // Apply offsets via margins, so that bounds of the AlignBox doesn't unnecessarily extend past the
        // buttonBackground. See https://github.com/phetsims/sun/issues/649
        leftMargin: options.xMargin + options.xContentOffset,
        rightMargin: options.xMargin - options.xContentOffset,
        topMargin: options.yMargin + options.yContentOffset,
        bottomMargin: options.yMargin - options.yContentOffset,

        // for performance
        pickable: false
      } );
      this.addChild( alignBox );
    }

    this.mutate( options );

    // @private - define a dispose function
    this.disposeButtonNode = () => {
      alignBox && alignBox.dispose();
      buttonAppearanceStrategy.dispose && buttonAppearanceStrategy.dispose();
      contentAppearanceStrategy && contentAppearanceStrategy.dispose && contentAppearanceStrategy.dispose();
      this._pressListener.dispose();
      this.baseColorProperty.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeButtonNode();
    super.dispose();
  }

  /**
   * Sets the base color, which is the main background fill color used for the button.
   * @param {Color|String} baseColor
   * @public
   */
  setBaseColor( baseColor ) { this.baseColorProperty.paint = baseColor; }

  set baseColor( baseColor ) { this.setBaseColor( baseColor ); }

  /**
   * Gets the base color for this button.
   * @returns {Color}
   * @public
   */
  getBaseColor() { return this.baseColorProperty.paint; }

  get baseColor() { return this.getBaseColor(); }

  /**
   * Manually click the button, as it would be clicked in response to alternative input. Recommended only for
   * accessibility usages. For the most part, PDOM button functionality should be managed by PressListener, this should
   * rarely be used.
   * @public
   */
  pdomClick() {
    this._pressListener.click();
  }

  /**
   * Is the button currently firing because of accessibility input coming from the PDOM?
   * @public (pdom)
   * @returns {boolean}
   */
  isPDOMClicking() {
    return this._pressListener.pdomClickingProperty.get();
  }
}


/**
 * FlatAppearanceStrategy is a value for ButtonNode options.buttonAppearanceStrategy. It makes a
 * button look flat, i.e. no shading or highlighting, with color changes on mouseover, press, etc.
 */
class FlatAppearanceStrategy {

  /*
   * @param {Node} buttonBackground - the Node for the button's background, sans content
   * @param {Property.<ButtonInteractionState>} interactionStateProperty
   * @param {Property.<ColorDef>} baseColorProperty
   * @param {Object} [options]
   */
  constructor( buttonBackground, interactionStateProperty, baseColorProperty, options ) {

    // Dynamic colors
    const baseBrighter4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.4 } );
    const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );

    // Various fills that are used to alter the button's appearance
    const upFill = baseColorProperty;
    const overFill = baseBrighter4;
    const downFill = baseDarker4;

    // If the stroke wasn't provided, set a default
    buttonBackground.stroke = ( typeof ( options.stroke ) === 'undefined' ) ? baseDarker4 : options.stroke;

    // Cache colors
    buttonBackground.cachedPaints = [ upFill, overFill, downFill ];

    // Change colors to match interactionState
    function interactionStateListener( interactionState ) {
      switch( interactionState ) {

        case ButtonInteractionState.IDLE:
          buttonBackground.fill = upFill;
          break;

        case ButtonInteractionState.OVER:
          buttonBackground.fill = overFill;
          break;

        case ButtonInteractionState.PRESSED:
          buttonBackground.fill = downFill;
          break;

        default:
          throw new Error( `unsupported interactionState: ${interactionState}` );
      }
    }

    // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
    // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
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

ButtonNode.FlatAppearanceStrategy = FlatAppearanceStrategy;

EnabledNode.mixInto( ButtonNode );

sun.register( 'ButtonNode', ButtonNode );
export default ButtonNode;