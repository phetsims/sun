// Copyright 2016-2020, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import merge from '../../../phet-core/js/merge.js';
import Text from '../../../scenery/js/nodes/Text.js';
import ABSwitch from '../ABSwitch.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import HSlider from '../HSlider.js';
import sun from '../sun.js';

class MemoryTestsScreenView extends ScreenView {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      // {number} how many iterations of the test will be done on each call to step
      iterationsPerStep: 1
    }, options );

    super();

    // @private
    this.iterationsPerStep = options.iterationsPerStep;

    // @private {Node[]}
    this.components = [];
  }

  /**
   * @public
   */
  step() {

    for ( let i = 0; i < this.iterationsPerStep; i++ ) {

      // Dispose of all components, which also removes them from the scenegraph.
      // Do this at the beginning of the loop so that components added at the end of the loop are displayed.
      this.components.forEach( component => component.dispose() );

      // Create components.
      this.components = this.createComponents();

      // Add components to the scenegraph at a random location
      this.components.forEach( component => {
        component.x = phet.joist.random.nextIntBetween( 0, this.layoutBounds.width );
        component.y = phet.joist.random.nextIntBetween( 0, this.layoutBounds.height );
        this.addChild( component );
      } );
    }
  }

  /**
   * Creates sun UI components. Add the components that you want to test here.
   * @returns {Node[]}
   * @protected
   */
  createComponents() {
    return [
      new HSlider( new Property( 0 ), new Range( 0, 10 ) ),
      new ABSwitch( new BooleanProperty( false ), true, new Text( 'true' ), false, new Text( 'false' ) ),
      new BooleanToggleNode( new Text( 'true' ), new Text( 'false' ), new BooleanProperty( false ) )
    ];
  }
}

sun.register( 'MemoryTestsScreenView', MemoryTestsScreenView );
export default MemoryTestsScreenView;