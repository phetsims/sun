// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO type for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NodeIO from '../../scenery/js/nodes/NodeIO.js';
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
ObjectIO.validateSubtype( SliderIO );

sun.register( 'SliderIO', SliderIO );
export default SliderIO;