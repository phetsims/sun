// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for AccordionBox
 *
 * @author John Blanco
 */

import NodeIO from '../../scenery/js/nodes/NodeIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import sun from './sun.js';

const AccordionBoxIO = new IOType( 'AccordionBoxIO', {
  isValidValue: v => v instanceof phet.sun.AccordionBox,
  supertype: NodeIO,
  events: [ 'expanded', 'collapsed' ]
} );

sun.register( 'AccordionBoxIO', AccordionBoxIO );
export default AccordionBoxIO;