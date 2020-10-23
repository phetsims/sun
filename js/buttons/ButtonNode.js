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

class ButtonNode extends Node {

  /**
   * @param {ButtonModel} buttonModel
   * @param {Property} interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param {Object} [options] - this type does not mutate its options, but relies on the subtype to
   */
  constructor( buttonModel, interactionStateProperty, options ) {

    options = merge( {
      tandem: Tandem.OPTIONAL,

      // Options that will be passed through to the main input listener (PressListener)
      listenerOptions: null,

      // {ColorDef} initial color of the button's background
      baseColor: ColorConstants.LIGHT_BLUE,

      // {string} default cursor
      cursor: 'pointer',

      // TODO: workaround for difficulty in mutate/instrumentation order of sun buttons, see https://github.com/phetsims/sun/issues/643 or https://github.com/phetsims/sun/issues/515
      phetioLinkEnabledElement: false

    }, options );

    options.listenerOptions = merge( {
      tandem: options.tandem.createTandem( 'pressListener' )
    }, options.listenerOptions );

    super();

    // @protected
    this.buttonModel = buttonModel;

    assert && options.enabledProperty && assert( options.enabledProperty === this.buttonModel.enabledProperty,
      'a passed in enabledProperty should be the same as the ButtonModel\'s' );
    options.enabledProperty = this.buttonModel.enabledProperty;
    this.initializeEnabledNode( options );

    // Make the base color into a property so that the appearance strategy can update itself if changes occur.
    this.baseColorProperty = new PaintColorProperty( options.baseColor ); // @private

    // @private {PressListener}
    this._pressListener = buttonModel.createPressListener( options.listenerOptions );
    this.addInputListener( this._pressListener );

    // @private - define a dispose function
    this.disposeButtonNode = () => {
      this.baseColorProperty.dispose();
      this._pressListener.dispose();
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
   * accessibility usages. For the most part, a11y button functionality should be managed by PressListener, this should
   * rarely be used.
   * @public
   */
  a11yClick() {
    this._pressListener.click();
  }
}

EnabledNode.mixInto( ButtonNode );

sun.register( 'ButtonNode', ButtonNode );
export default ButtonNode;