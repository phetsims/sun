// Copyright 2020, University of Colorado Boulder

/**
 * Central class for the sun button hierarchy. This type factors out logic that applies to all sun buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import Node from '../../../scenery/js/nodes/Node.js';
import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import EnabledNode from '../EnabledNode.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';

class ButtonNode extends Node {

  /**
   * @param {ButtonModel} buttonModel
   * @param {Node} buttonBackground - the background of the button (like a circle or rectangle).
   * @param {Property} interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param {Object} [options] - this type does not mutate its options, but relies on the subtype to
   */
  constructor( buttonModel, buttonBackground, interactionStateProperty, options ) {

    options = merge( {
      tandem: Tandem.OPTIONAL,

      // Options that will be passed through to the main input listener (PressListener)
      listenerOptions: null,

      // {ColorDef} initial color of the button's background
      baseColor: ColorConstants.LIGHT_BLUE,

      // {string} default cursor
      cursor: 'pointer',

      // TODO: workaround for difficulty in mutate/instrumentation order of sun buttons,
      //  see https://github.com/phetsims/sun/issues/643 or https://github.com/phetsims/sun/issues/515
      phetioLinkEnabledElement: false,

      // Class that determines the button's appearance for the values of interactionStateProperty.
      // See ButtonNode.FlatAppearanceStrategy for an example of the interface required.
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
    }, options );

    options.listenerOptions = merge( {
      tandem: options.tandem.createTandem( 'pressListener' )
    }, options.listenerOptions );

    assert && options.enabledProperty && assert( options.enabledProperty === buttonModel.enabledProperty,
      'if options.enabledProperty is provided, it must === buttonModel.enabledProperty' );
    options.enabledProperty = buttonModel.enabledProperty;

    super( options );

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

    // @private - define a dispose function
    this.disposeButtonNode = () => {
      this.baseColorProperty.dispose();
      this._pressListener.dispose();
      buttonAppearanceStrategy.dispose && buttonAppearanceStrategy.dispose();
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
   * @param {Node} button - the Node for the button's shape, sans content
   * @param {Property.<boolean>} interactionStateProperty
   * @param {Property.<Color>} baseColorProperty
   * @param {Object} [options]
   */
  constructor( button, interactionStateProperty, baseColorProperty, options ) {

    // Dynamic colors
    const baseBrighter4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: 0.4 } );
    const baseDarker4 = new PaintColorProperty( baseColorProperty, { luminanceFactor: -0.4 } );

    // Various fills that are used to alter the button's appearance
    const upFill = baseColorProperty;
    const overFill = baseBrighter4;
    const downFill = baseDarker4;

    // If the stroke wasn't provided, set a default
    button.stroke = ( typeof ( options.stroke ) === 'undefined' ) ? baseDarker4 : options.stroke;

    // Cache colors
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