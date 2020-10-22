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
import sun from '../sun.js';

class ButtonNode extends Node {

  /**
   * @param {ButtonModel} buttonModel
   * @param {Object} [options] - this type does not mutate its options, but relies on the subtype to
   */
  constructor( buttonModel, options ) {

    options = merge( {
      tandem: Tandem.OPTIONAL,

      // Options that will be passed through to the main input listener (PressListener)
      listenerOptions: null

    }, options );

    options.listenerOptions = merge( {
      tandem: options.tandem.createTandem( 'pressListener' )
    }, options.listenerOptions );

    super();

    // @protected
    this.buttonModel = buttonModel;

    // Make the base color into a property so that the appearance strategy can update itself if changes occur.
    this.baseColorProperty = new PaintColorProperty( options.baseColor ); // @private

    // @private {PressListener}
    this._pressListener = buttonModel.createListener( options.listenerOptions );
    this.addInputListener( this._pressListener );

    // TODO: EnabledNode will make this useless
    // PDOM - indicate to screen readers that the button is not clickable
    const updatePDOMEnabled = enabled => {
      this.setAccessibleAttribute( 'aria-disabled', !enabled );
    };
    buttonModel.enabledProperty.link( updatePDOMEnabled );

    // @private - define a dispose function
    this.disposeButtonNode = () => {
      this._pressListener.dispose();
      if ( buttonModel.enabledProperty.hasListener( updatePDOMEnabled ) ) {
        buttonModel.enabledProperty.unlink( updatePDOMEnabled );
      }
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
   * Sets the enabled state.
   * @param {boolean} value
   * @public
   */
  setEnabled( value ) {
    assert && assert( typeof value === 'boolean', 'ButtonNode.enabled must be a boolean value' );
    this.buttonModel.enabledProperty.set( value );
  }

  set enabled( value ) { this.setEnabled( value ); }

  /**
   * Gets the enabled state.
   * @returns {boolean}
   * @public
   */
  getEnabled() { return this.buttonModel.enabledProperty.get(); }

  get enabled() { return this.getEnabled(); }

  /**
   *
   /**
   * Gets a reference to the model's enabledProperty.
   * @returns {Property.<boolean>}
   * @public
   */
  getEnabledProperty() {
    return this.buttonModel.enabledProperty;
  }

  /**
   * ES5 getter for the model's enabledProperty. This is a bit of intentional obfuscation to make sun buttons
   * have an enabledProperty API that is similar to other UI components.
   * See https://github.com/phetsims/sun/issues/515#issuecomment-713870207
   * @returns {Property.<boolean>}
   */
  get enabledProperty() { return this.getEnabledProperty(); }

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

  // @public
  addListener( listener ) {
    this.buttonModel.addListener( listener );
  }

  // @public
  removeListener( listener ) {
    this.buttonModel.removeListener( listener );
  }

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

sun.register( 'ButtonNode', ButtonNode );
export default ButtonNode;