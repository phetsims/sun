// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for AccordionBox
 *
 * @author John Blanco
 */

import NodeIO from '../../scenery/js/nodes/NodeIO.js';
import ObjectIO from '../../tandem/js/types/ObjectIO.js';
import sun from './sun.js';

class AccordionBoxIO extends NodeIO {}

AccordionBoxIO.documentation = 'A traditional accordionBox';
AccordionBoxIO.events = [ 'expanded', 'collapsed' ];
AccordionBoxIO.validator = { isValidValue: v => v instanceof phet.sun.AccordionBox };
AccordionBoxIO.typeName = 'AccordionBoxIO';
ObjectIO.validateIOType( AccordionBoxIO );

sun.register( 'AccordionBoxIO', AccordionBoxIO );
export default AccordionBoxIO;