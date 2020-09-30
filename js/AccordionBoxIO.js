// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for AccordionBox
 *
 * @author John Blanco
 */

import Node from '../../scenery/js/nodes/Node.js';
import IOType from '../../tandem/js/types/IOType.js';
import sun from './sun.js';

const AccordionBoxIO = new IOType( 'AccordionBoxIO', {
  isValidValue: v => v instanceof phet.sun.AccordionBox,
  supertype: Node.NodeIO,
  events: [ 'expanded', 'collapsed' ]
} );

sun.register( 'AccordionBoxIO', AccordionBoxIO );
export default AccordionBoxIO;