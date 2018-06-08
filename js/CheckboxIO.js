// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for Checkbox
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var sun = require( 'SUN/sun' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var FunctionIO = require( 'ifphetio!PHET_IO/types/FunctionIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   * @param {Checkbox} checkbox
   * @param {string} phetioID
   * @constructor
   */
  function CheckboxIO( checkbox, phetioID ) {
    assert && assertInstanceOf( checkbox, phet.sun.Checkbox );
    NodeIO.call( this, checkbox, phetioID );
  }

  phetioInherit( NodeIO, 'CheckboxIO', CheckboxIO, {

    link: {
      returnType: VoidIO,
      parameterTypes: [ FunctionIO( VoidIO, [ BooleanIO ] ) ],
      implementation: function( listener ) {
        this.instance.checkboxValueProperty.link( listener );
      },
      documentation: 'Link a listener to the underlying checked PropertyIO.  The listener receives an immediate callback ' +
                     'with the current value (true/false)'
    },

    setChecked: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( checked ) {
        this.instance.checkboxValueProperty.set( checked );
      },
      documentation: 'Sets whether the checkbox is checked or not'
    },

    isChecked: {
      returnType: BooleanIO,
      parameterTypes: [],
      implementation: function() {
        return this.instance.checkboxValueProperty.get();
      },
      documentation: 'Returns true if the checkbox is checked, false otherwise'
    }
  }, {
    documentation: 'A user interface component that shows if something is selected (checked) or unselected (unchecked)',
    events: [ 'toggled' ]
  } );

  sun.register( 'CheckboxIO', CheckboxIO );

  return CheckboxIO;
} );
