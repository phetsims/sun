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
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TVoid = require( 'ifphetio!PHET_IO/types/TVoid' );

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
      returnType: TVoid,
      parameterTypes: [ TBoolean ],
      implementation: function( visible ) {
        this.instance.setMajorTicksVisible( visible );
      },
      documentation: 'Set whether the major tick marks should be shown'
    },

    setMinorTicksVisible: {
      returnType: TVoid,
      parameterTypes: [ TBoolean ],
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