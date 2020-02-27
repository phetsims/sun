// Copyright 2016-2020, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import inherit from '../../../phet-core/js/inherit.js';
import Text from '../../../scenery/js/nodes/Text.js';
import ABSwitch from '../ABSwitch.js';
import BooleanToggleNode from '../BooleanToggleNode.js';
import HSlider from '../HSlider.js';
import sun from '../sun.js';

function ComponentHolder( createFunction ) {
  const self = this;
  this.dispose = function() {
    self.instance.dispose();
  };
  this.create = function() {
    self.instance = createFunction();
  };
}

const numberProperty = new Property( 0 );
const booleanProperty = new BooleanProperty( false );

const components = [
  new ComponentHolder( function() {
    return new HSlider( numberProperty, new Range( 0, 10 ) );
  } ),
  new ComponentHolder( function() {
    return new ABSwitch( booleanProperty, true, new Text( 'true' ), false, new Text( 'false' ) );
  } ),
  new ComponentHolder( function() {
    return new BooleanToggleNode( new Text( 'true' ), new Text( 'false' ), booleanProperty );
  } )
];

/**
 * @constructor
 */
function MemoryTestsScreenView() {
  ScreenView.call( this );
}

sun.register( 'MemoryTestsScreenView', MemoryTestsScreenView );

export default inherit( ScreenView, MemoryTestsScreenView, {
  step: function() {

    for ( let i = 0; i < components.length; i++ ) {
      const holder = components[ i ];

      // dispose first, then create and add at the end of the loop so components will be visible on the screen during
      // animation.
      holder.instance && this.removeChild( holder.instance );
      holder.instance && holder.dispose();

      holder.create();
      this.addChild( holder.instance );
    }
  }
} );