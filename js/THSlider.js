// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
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
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   * Wrapper type for phet/sun's HSlider class.
   * @param slider
   * @param phetioID
   * @constructor
   */
  function THSlider( slider, phetioID ) {
    assert && assertInstanceOf( slider, phet.sun.HSlider );
    TNode.call( this, slider, phetioID );
  }

  phetioInherit( TNode, 'THSlider', THSlider, {

    setMajorTicksVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.instance.setMajorTicksVisible( visible );
      },
      documentation: 'Set whether the major tick marks should be shown'
    },

    setMinorTicksVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.instance.setMinorTicksVisible( visible );
      },
      documentation: 'Set whether the minor tick marks should be shown'
    }
  }, {
    documentation: 'A traditional slider component, with a knob and possibly tick marks'
  } );

  sun.register( 'THSlider', THSlider );

  return THSlider;
} );