// Copyright 2014-2020, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a property that can take on valueUp or valueDown.
 * It sticks in the down position when pressed, popping back up when pressed again.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import sun from '../sun.js';
import RectangularButtonView from './RectangularButtonView.js';
import StickyToggleButtonInteractionStateProperty from './StickyToggleButtonInteractionStateProperty.js';
import StickyToggleButtonModel from './StickyToggleButtonModel.js';

class RectangularStickyToggleButton extends RectangularButtonView {

  /**
   * @param {Object} valueUp value when the toggle is in the 'up' position
   * @param {Object} valueDown value when the toggle is in the 'down' position
   * @param {Property} property axon property that can be either valueUp or valueDown.
   * @param {Object} [options]
   */
  constructor( valueUp, valueDown, property, options ) {

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new StickyToggleButtonModel( valueUp, valueDown, property, options );
    const stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( buttonModel );

    super( buttonModel, stickyToggleButtonInteractionStateProperty, options );

    // @private - dispose items specific to this instance
    this.disposeRectangularStickyToggleButton = () => {
      buttonModel.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeRectangularStickyToggleButton();
    super.dispose();
  }
}

sun.register( 'RectangularStickyToggleButton', RectangularStickyToggleButton );
export default RectangularStickyToggleButton;