// Copyright 2013-2022, University of Colorado Boulder

/**
 * Convenience type for creating a group of Checkboxes with vertical orientation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import { HStrut, Node, VBox, VBoxOptions } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import Checkbox from './Checkbox.js';
import sun from './sun.js';
import Property from '../../axon/js/Property.js';

export type VerticalCheckboxGroupItem = {
  node: Node; // Label for the button
  property: Property<boolean>; // Property associated with the checkbox
  options?: any; // Item-specific options to be passed to the checkbox
  tandem?: Tandem; // optional tandem for PhET-iO
};

type SelfOptions = {
  checkboxOptions?: any;
  touchAreaXDilation?: number;
  mouseAreaXDilation?: number;
};

export type VerticalCheckboxGroupOptions = SelfOptions & StrictOmit<VBoxOptions, 'children'>;

export default class VerticalCheckboxGroup extends VBox {

  public constructor( items: VerticalCheckboxGroupItem[], providedOptions?: VerticalCheckboxGroupOptions ) {

    const options = optionize<VerticalCheckboxGroupOptions, SelfOptions, VBoxOptions>()( {

      // {Object|null} options passed to constructor of the Checkbox
      checkboxOptions: null,

      // dilation of pointer areas for each checkbox, y dimension is computed
      touchAreaXDilation: 5,
      mouseAreaXDilation: 5,

      // supertype options
      spacing: 10, // vertical spacing
      align: 'left',
      tandem: Tandem.OPTIONAL
    }, providedOptions );

    // Determine the max item width
    let maxItemWidth = 0;
    for ( let i = 0; i < items.length; i++ ) {
      maxItemWidth = Math.max( maxItemWidth, items[ i ].node.width );
    }

    // Create a checkbox for each item
    options.children = [];
    for ( let i = 0; i < items.length; i++ ) {

      const item = items[ i ];

      // Content for the checkbox. Add an invisible strut, so that checkboxes have uniform width.
      const content = new Node( {
        children: [ new HStrut( maxItemWidth ), item.node ]
      } );

      const checkbox = new Checkbox( item.property, content, merge( {}, options.checkboxOptions, item.options, {
        tandem: item.tandem || Tandem.OPTIONAL
      } ) );

      // set pointer areas, y dimensions are computed
      const yDilation = options.spacing / 2;
      checkbox.mouseArea = checkbox.localBounds.dilatedXY( options.mouseAreaXDilation, yDilation );
      checkbox.touchArea = checkbox.localBounds.dilatedXY( options.touchAreaXDilation, yDilation );

      options.children.push( checkbox );
    }

    super( options );
  }
}

sun.register( 'VerticalCheckboxGroup', VerticalCheckboxGroup );