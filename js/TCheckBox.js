// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var TNode = require( 'SCENERY/nodes/TNode' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var FunctionIO = require( 'ifphetio!PHET_IO/types/FunctionIO' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   * Wrapper type for phet/sun's CheckBox class.
   * @param checkBox
   * @param phetioID
   * @constructor
   */
  function TCheckBox( checkBox, phetioID ) {
    assert && assertInstanceOf( checkBox, phet.sun.CheckBox );
    TNode.call( this, checkBox, phetioID );
  }

  phetioInherit( TNode, 'TCheckBox', TCheckBox, {

    link: {
      returnType: VoidIO,
      parameterTypes: [ FunctionIO( VoidIO, [ BooleanIO ] ) ],
      implementation: function( listener ) {
        this.instance.checkBoxValueProperty.link( listener );
      },
      documentation: 'Link a listener to the underlying checked PropertyIO.  The listener receives an immediate callback ' +
                     'with the current value (true/false)'
    },

    setChecked: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( checked ) {
        this.instance.checkBoxValueProperty.set( checked );
      },
      documentation: 'Sets whether the checkbox is checked or not'
    },

    isChecked: {
      returnType: BooleanIO,
      parameterTypes: [],
      implementation: function() {
        return this.instance.checkBoxValueProperty.get();
      },
      documentation: 'Returns true if the checkbox is checked, false otherwise'
    }
  }, {
    documentation: 'A traditional checkbox',
    events: [ 'toggled' ]
  } );

  sun.register( 'TCheckBox', TCheckBox );

  return TCheckBox;
} );

