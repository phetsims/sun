// Copyright 2013-2021, University of Colorado Boulder

/**
 * Convenience type for creating a group of Checkboxes with vertical orientation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import HStrut from '../../scenery/js/nodes/HStrut.js';
import Node from '../../scenery/js/nodes/Node.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import Tandem from '../../tandem/js/Tandem.js';
import Checkbox from './Checkbox.js';
import sun from './sun.js';

class VerticalCheckboxGroup extends VBox {

  /**
   * @param {Object[]} items - Each item describes a checkbox, and is an object with these properties:
   *    node: {Node}, // label for the button
   *    property: {Property.<boolean>}, // Property associated with the button
   *    [options]: {Object}, // Item specific options to be passed to the checkbox
   *    [tandem]: {Tandem} // optional tandem for PhET-iO
   * @param {Object} [options]
   */
  constructor( items, options ) {

    options = merge( {

      // {Object|null} options passed to constructor of the Checkbox
      checkboxOptions: null,

      // dilation of pointer areas for each checkbox, y dimension is computed
      touchAreaXDilation: 5,
      mouseAreaXDilation: 5,

      // supertype options
      spacing: 10, // vertical spacing
      align: 'left',
      tandem: Tandem.OPTIONAL
    }, options );

    // Verify that the client hasn't set options that we will be overwriting.
    assert && assert( !options.children, 'VerticalCheckboxGroup sets children' );

    // Determine the max item width
    let maxItemWidth = 0;
    for ( let i = 0; i < items.length; i++ ) {
      maxItemWidth = Math.max( maxItemWidth, items[ i ].node.width );
    }

    // Create a checkbox for each item
    assert && assert( !options.children, 'VerticalCheckboxGroup sets children' );
    options.children = [];
    for ( let i = 0; i < items.length; i++ ) {

      const item = items[ i ];

      // Content for the checkbox. Add an invisible strut, so that checkboxes have uniform width.
      const content = new Node( {
        children: [ new HStrut( maxItemWidth ), item.node ]
      } );

      const checkbox = new Checkbox( content, item.property, merge( {}, options.checkboxOptions, item.options, {
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
export default VerticalCheckboxGroup;