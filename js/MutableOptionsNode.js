// Copyright 2017-2022, University of Colorado Boulder

/**
 * Assists "changing" options for types of nodes where the node does not support modifying the option.
 * This will create a new copy of the node whenever the options change, and will swap it into place.
 *
 * Given a type that has an option that can only be provided on construction (e.g. 'color' option for NumberPicker),
 * MutableOptionsNode can act like a mutable form of that Node. For example, if you have a color property:
 *
 * var colorProperty = new Property( 'red' );
 *
 * You can create a NumberPicker equivalent:
 *
 * var pickerContainer = new MutableOptionsNode( NumberPicker, [ arg1, arg2 ], {
 *   font: new PhetFont( 30 ) // normal properties that are passed in directly
 * }, {
 *   color: colorProperty // values wrapped with Property. When these change, a new NumberPicker is created and swapped.
 * }, {
 *   // Options passed to the wrapper node.
 * } );
 *
 * Now pickerContainer will have a child that is a NumberPicker, and pickerContainer.nodeProperty will point to the
 * current NumberPicker instance. The NumberPicker above will be created with like:
 *
 * new NumberPicker( arg1, arg2, {
 *   font: new PhetFont( 30 ),
 *   color: colorProperty.value
 * } )
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Multilink from '../../axon/js/Multilink.js';
import Property from '../../axon/js/Property.js';
import merge from '../../phet-core/js/merge.js';
import { Node } from '../../scenery/js/imports.js';
import sun from './sun.js';

/**
 * @deprecated Not a good fit for PhET-iO. Please design your component so that the item is mutable.
 */
class MutableOptionsNode extends Node {

  /**
   * @param {Function} nodeSubtype - The type of the node that we'll be constructing copies of.
   * @param {Array.<*>} parameters - Arbitrary initial parameters that will be passed to the type's constructor
   * @param {Object} staticOptions - Options passed in that won't change (will not unwrap properties)
   * @param {Object} dynamicOptions - Options passed in that will change. Should be a map from key names to
   *                                  Property.<*> values.
   * @param {Object} [wrapperOptions] - Node options passed to MutableOptionsNode itself (the wrapper).
   */
  constructor( nodeSubtype, parameters, staticOptions, dynamicOptions, wrapperOptions ) {
    super();

    // @public {Property.<Node|null>} [read-only] - Holds our current copy of the node (or null, so we don't have a
    //                                              specific initial value).
    this.nodeProperty = new Property( null );

    // @private {function} - The constructor for our custom subtype, unwraps the Properties in dynamicOptions.
    this._constructInstance = () => Reflect.construct( nodeSubtype, [
      ...parameters,
      merge( _.mapValues( dynamicOptions, property => property.value ), staticOptions ) // options
    ] );

    // @private {Multilink} - Make a copy, and replace it when one of our dyanmic options changes.
    this.multilink = Multilink.multilink( _.values( dynamicOptions ), this.replaceCopy.bind( this ) );

    // Apply any options that make more sense on the wrapper (typically like positioning)
    this.mutate( wrapperOptions );
  }

  /**
   * Creates a copy of our type of node, and replaces any existing copy.
   * @private
   */
  replaceCopy() {
    const newCopy = this._constructInstance();
    const oldCopy = this.nodeProperty.value;
    this.nodeProperty.value = newCopy;

    // Add first, so that there's a good chance we won't change bounds (depending on the type)
    this.addChild( newCopy );
    if ( oldCopy ) {
      this.removeChild( oldCopy );
      this.disposeCopy( oldCopy );
    }
  }

  /**
   * Attempt to dispose an instance of our node.
   * @private
   *
   * @param {Node} copy
   */
  disposeCopy( copy ) {
    copy.dispose && copy.dispose();
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.multilink.dispose();
    this.disposeCopy( this.nodeProperty.value );
    this.nodeProperty.dispose();
    super.dispose();
  }
}

sun.register( 'MutableOptionsNode', MutableOptionsNode );
export default MutableOptionsNode;