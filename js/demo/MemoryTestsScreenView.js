// Copyright 2016-2020, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import Text from '../../../scenery/js/nodes/Text.js';
import ABSwitch from '../ABSwitch.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import HSlider from '../HSlider.js';
import sun from '../sun.js';

class MemoryTestsScreenView extends ScreenView {

  constructor() {
    super();
    this.componentHolders = [
      new ComponentHolder( () => new HSlider( new Property( 0 ), new Range( 0, 10 ) ) ),
      new ComponentHolder( () => new ABSwitch( new BooleanProperty( false ), true, new Text( 'true' ), false, new Text( 'false' ) ) ),
      new ComponentHolder( () => new BooleanToggleNode( new Text( 'true' ), new Text( 'false' ), new BooleanProperty( false ) ) )
    ];
  }

  /**
   * @public
   */
  step() {
    for ( let i = 0; i < this.componentHolders.length; i++ ) {
      const componentHolder = this.componentHolders[ i ];

      // dispose first, then create and add at the end of the loop so components will be visible on the screen during
      // animation.
      if ( componentHolder.component ) {
        this.removeChild( componentHolder.component );
        componentHolder.disposeComponent();
      }

      componentHolder.createComponent();
      this.addChild( componentHolder.component );
    }
  }
}

class ComponentHolder {

  /**
   * @param {function:Node} createFunction
   */
  constructor( createFunction ) {

    // @private
    this.createFunction = createFunction;

    // @public (read-only)
    this.component = null;
  }

  // @public
  createComponent() {
    assert && assert( !this.component, 'component already exists' );
    this.component = this.createFunction();
  }

  // @public
  disposeComponent() {
    assert && assert( this.component, 'component does not exist' );
    this.component.dispose();
    this.component = null;

  }
}

sun.register( 'MemoryTestsScreenView', MemoryTestsScreenView );
export default MemoryTestsScreenView;