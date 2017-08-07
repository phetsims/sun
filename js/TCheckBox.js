// Copyright 2016, University of Colorado Boulder

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
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TFunctionWrapper = require( 'ifphetio!PHET_IO/types/TFunctionWrapper' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/toEventOnEmit' );
  var TVoid = require( 'ifphetio!PHET_IO/types/TVoid' );

  /**
   * Wrapper type for phet/sun's CheckBox class.
   * @param checkBox
   * @param phetioID
   * @constructor
   */
  function TCheckBox( checkBox, phetioID ) {
    assertInstanceOf( checkBox, phet.sun.CheckBox );
    TNode.call( this, checkBox, phetioID );

    toEventOnEmit(
      checkBox.startedCallbacksForToggledEmitter,
      checkBox.endedCallbacksForToggledEmitter,
      'user',
      phetioID,
      this.constructor,
      'toggled',
      function( oldValue, newValue ) {
        return {
          oldValue: oldValue,
          newValue: newValue
        };
      } );
  }

  phetioInherit( TNode, 'TCheckBox', TCheckBox, {

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

  sun.register( 'TCheckBox', TCheckBox );

  return TCheckBox;
} );

