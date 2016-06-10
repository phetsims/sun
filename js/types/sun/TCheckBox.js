// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TBoolean = require( 'PHET_IO/api/TBoolean' );
  var TFunctionWrapper = require( 'PHET_IO/api/TFunctionWrapper' );
  var TNode = require( 'PHET_IO/api/scenery/nodes/TNode' );
  var toEventOnStatic = require( 'PHET_IO/events/toEventOnStatic' );
  var TVoid = require( 'PHET_IO/api/TVoid' );

  var TCheckBox = phetioInherit( TNode, 'TCheckBox', function( checkBox, phetioID ) {
    assertInstanceOf( checkBox, phet.sun.CheckBox );
    TNode.call( this, checkBox, phetioID );

    toEventOnStatic( checkBox, 'CallbacksForToggled', 'user', phetioID, 'toggled', function( oldValue, newValue ) {
      return {
        oldValue: oldValue,
        newValue: newValue
      };
    } );
  }, {
    link: {
      returnType: TVoid,
      parameterTypes: [ TFunctionWrapper( TVoid, [ TBoolean ] ) ],
      implementation: function( listener ) {
        this.instance.checkBoxValueProperty.link( listener );
      },
      documentation: 'Link a listener to the underlying checked TProperty.  The listener receives an immediate callback ' +
                     'with the current value (true/false)'
    },
    setChecked: {
      returnType: TVoid,
      parameterTypes: [ TBoolean ],
      implementation: function( checked ) {
        this.instance.checkBoxValueProperty.set( checked );
      },
      documentation: 'Sets whether the checkbox is checked or not'
    },
    isChecked: {
      returnType: TBoolean,
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

  phetioNamespace.register( 'TCheckBox', TCheckBox );

  return TCheckBox;
} );

