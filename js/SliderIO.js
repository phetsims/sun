// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO type for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PropertyIO from '../../axon/js/PropertyIO.js';
import RangeIO from '../../dot/js/RangeIO.js';
import PressListenerIO from '../../scenery/js/listeners/PressListenerIO.js';
import NodeIO from '../../scenery/js/nodes/NodeIO.js';
import LinkedElementIO from '../../tandem/js/LinkedElementIO.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import ObjectIO from '../../tandem/js/types/ObjectIO.js';
import VoidIO from '../../tandem/js/types/VoidIO.js';
import sun from './sun.js';

class SliderIO extends NodeIO {}

SliderIO.methods = {

  setMajorTicksVisible: {
    returnType: VoidIO,
    parameterTypes: [ BooleanIO ],
    implementation: function( visible ) {
      this.phetioObject.setMajorTicksVisible( visible );
    },
    documentation: 'Set whether the major tick marks should be shown',
    invocableForReadOnlyElements: false
  },

  setMinorTicksVisible: {
    returnType: VoidIO,
    parameterTypes: [ BooleanIO ],
    implementation: function( visible ) {
      this.phetioObject.setMinorTicksVisible( visible );
    },
    documentation: 'Set whether the minor tick marks should be shown',
    invocableForReadOnlyElements: false
  }
};
SliderIO.documentation = 'A traditional slider component, with a knob and possibly tick marks';
SliderIO.validator = { isValidValue: v => v instanceof phet.sun.Slider };
SliderIO.typeName = 'SliderIO';

// TODO: experimental, do not use without consulting https://github.com/phetsims/phet-io/issues/1657
SliderIO.api = {
  enabledProperty: {
    phetioType: PropertyIO( BooleanIO ),
    phetioFeatured: true
  },
  enabledRangeProperty: {
    phetioType: PropertyIO( RangeIO )
  },
  track: {
    phetioType: NodeIO,
    dragListener: {

      // TODO: Make this be DragListenerIO, https://github.com/phetsims/phet-io/issues/1657
      // TODO: right now PressListenerIO isn't doing anything! https://github.com/phetsims/phet-io/issues/1657
      phetioType: PressListenerIO
    }
  },
  thumb: {
    phetioType: NodeIO,
    dragListener: {
      phetioType: PressListenerIO
    }
  },
  valueProperty: {
    phetioType: LinkedElementIO
  }
};
ObjectIO.validateSubtype( SliderIO );

sun.register( 'SliderIO', SliderIO );
export default SliderIO;