// Copyright 2013-2022, University of Colorado Boulder

/**
 * Convenience type for creating a group of Checkboxes with vertical orientation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { HStrut, Node, VBox, VBoxOptions } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import Checkbox, { CheckboxOptions } from './Checkbox.js';
import sun from './sun.js';
import Property from '../../axon/js/Property.js';
import GroupItemOptions, { getGroupItemNodes } from './GroupItemOptions.js';

export type VerticalCheckboxGroupItem = {
  property: Property<boolean>; // Property associated with the checkbox
  options?: StrictOmit<CheckboxOptions, 'tandem'>; // Item-specific options to be passed to the Checkbox constructor
} & GroupItemOptions; // additional options that are common to 'group items'

type SelfOptions = {
  checkboxOptions?: StrictOmit<CheckboxOptions, 'tandem'>;
  touchAreaXDilation?: number;
  mouseAreaXDilation?: number;
};

export type VerticalCheckboxGroupOptions = SelfOptions & StrictOmit<VBoxOptions, 'children'>;

export default class VerticalCheckboxGroup extends VBox {
  private readonly disposeVerticalCheckboxGroup: () => void;

  public constructor( items: VerticalCheckboxGroupItem[], providedOptions?: VerticalCheckboxGroupOptions ) {

    const options = optionize<VerticalCheckboxGroupOptions, StrictOmit<SelfOptions, 'checkboxOptions'>, VBoxOptions>()( {

      // dilation of pointer areas for each checkbox, y dimension is computed
      touchAreaXDilation: 5,
      mouseAreaXDilation: 5,

      // supertype options
      spacing: 10, // vertical spacing
      align: 'left',
      tandem: Tandem.REQUIRED
    }, providedOptions );

    const nodes = getGroupItemNodes( items, options.tandem );
    const checkboxes: Checkbox[] = [];

    // Determine the max item width
    let maxItemWidth = 0;
    for ( let i = 0; i < nodes.length; i++ ) {
      maxItemWidth = Math.max( maxItemWidth, nodes[ i ].width );
    }

    // Create a checkbox for each item
    options.children = [];
    for ( let i = 0; i < items.length; i++ ) {

      const item = items[ i ];
      const node = nodes[ i ];

      assert && assert( !node.hasPDOMContent,
        'Accessibility is provided by Checkbox and VerticalCheckboxGroupItem.options. ' +
        'Additional PDOM content in the provided Node could break accessibility.' );

      // Content for the checkbox. Add an invisible strut, so that checkboxes have uniform width.
      const content = new Node( {
        children: [ new HStrut( maxItemWidth ), node ]
      } );

      // set pointer areas, y dimensions are computed
      const yDilation = options.spacing / 2;

      // @ts-expect-error - runtime check to prevent prior pattern, see https://github.com/phetsims/sun/issues/794
      assert && assert( !item.tandem, 'Cannot specify tandem on item, use tandemName instead' );

      const checkbox = new Checkbox( item.property, content,
        combineOptions<CheckboxOptions>( {
          tandem: item.tandemName ? options.tandem.createTandem( item.tandemName ) :
                  Tandem.OPTIONAL,
          mouseAreaXDilation: options.mouseAreaXDilation,
          touchAreaXDilation: options.touchAreaXDilation,
          mouseAreaYDilation: yDilation,
          touchAreaYDilation: yDilation
        }, options.checkboxOptions, item.options ) );

      // For disposal
      checkboxes.push( checkbox );

      options.children.push( checkbox );
    }

    super( options );

    this.disposeVerticalCheckboxGroup = () => {
      checkboxes.forEach( checkbox => checkbox.dispose() );
      nodes.forEach( node => node.dispose() );
    };
  }

  public override dispose(): void {
    this.disposeVerticalCheckboxGroup();
    super.dispose();
  }
}

sun.register( 'VerticalCheckboxGroup', VerticalCheckboxGroup );