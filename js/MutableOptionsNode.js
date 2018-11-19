// Copyright 2017-2018, University of Colorado Boulder

/**
 * Assists "changing" options for types of nodes where the node does not support modifying the option.
 * This will create a new copy of the node whenever the options change, and will swap it into place.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @constructor
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
   * @param {Function} nodeSubtype - The type of the node that we'll be constructing copies of.
   * @param {Array.<*>} parameters - Arbitrary initial parameters that will be passed to the type's constructor
   * @param {Object} staticOptions - Options passed in that won't change (will not unwrap properties)
   * @param {Object} dynamicOptions - Options passed in that will change. Should be a map from key names to
   *                                  Property.<*> values.
   * @param {Object} [wrapperOptions] - Node options passed to MutableOptionsNode itself (the wrapper).
   */
  function MutableOptionsNode( nodeSubtype, parameters, staticOptions, dynamicOptions, wrapperOptions ) {
    // Instrumentation will probably be more complicated?
    Tandem.indicateUninstrumentedCode();

    Node.call( this );

    // @public {Property.<Node|null>} [read-only] - Holds our current copy of the node (or null, so we don't have a
    //                                              specific initial value).
    this.nodeProperty = new Property( null );

    // @private {Function} - The constructor for our custom subtype
    this._type = function MutableOptionsNodeConstructor() {
      // Unwrap the properties in dynamicOptions
      var options = _.extend( _.mapValues( dynamicOptions, function( property ) {
        return property.value;
      } ), staticOptions );

      // NOTE: In the future, we won't need to subtype if we can rely on Reflect.construct:
      // return Reflect.construct( this.nodeSubtype, this.parameters.concat( [ options ] ) );
      nodeSubtype.apply( this, parameters.concat( [ options ] ) );
    };

    // Have our copies inherit directly (for now, use Reflect.construct when IE11 support is dropped?)
    inherit( nodeSubtype, this._type );

    // @private {Multilink} - Make a copy, and replace it when one of our dyanmic options changes.
    this.multilink = Property.multilink( _.values( dynamicOptions ), this.replaceCopy.bind( this ) );

    // Apply any options that make more sense on the wrapper (typically like positioning)
    this.mutate( wrapperOptions );
  }

  sun.register( 'MutableOptionsNode', MutableOptionsNode );

  return inherit( Node, MutableOptionsNode, {
    /**
     * Creates a copy of our type of node, and replaces any existing copy.
     * @private
     */
    replaceCopy: function() {
      var Type = this._type; // avoids our linter complaining about uncapitalized types with 'new'
      var newCopy = new Type();
      var oldCopy = this.nodeProperty.value;
      this.nodeProperty.value = newCopy;

      // Add first, so that there's a good chance we won't change bounds (depending on the type)
      this.addChild( newCopy );
      if ( oldCopy ) {
        this.removeChild( oldCopy );
        this.disposeCopy( oldCopy );
      }
    },

    /**
     * Attempt to dispose an instance of our node.
     * @private
     *
     * @param {Node} copy
     */
    disposeCopy: function( copy ) {
      copy.dispose && copy.dispose();
    },

    /**
     * Handles disposal.
     */
    dispose: function() {
      this.multilink.dispose();
      this.disposeCopy( this.nodeProperty.value );
      this.nodeProperty.dispose();
      Node.prototype.dispose.call( this );
    }
  } );
} );
