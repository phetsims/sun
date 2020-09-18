// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NodeIO from '../../scenery/js/nodes/NodeIO.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import VoidIO from '../../tandem/js/types/VoidIO.js';
import sun from './sun.js';

const SliderIO = new IOType( 'SliderIO', {
  isValidValue: v => v instanceof phet.sun.Slider,
  documentation: 'A traditional slider component, with a knob and possibly tick marks',
  supertype: NodeIO,
  methods: {
    setMajorTicksVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.setMajorTicksVisible( visible );
      },
      documentation: 'Set whether the major tick marks should be shown',
      invocableForReadOnlyElements: false
    },

    setMinorTicksVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.setMinorTicksVisible( visible );
      },
      documentation: 'Set whether the minor tick marks should be shown',
      invocableForReadOnlyElements: false
    }
  }
} );

sun.register( 'SliderIO', SliderIO );
export default SliderIO;