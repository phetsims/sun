// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   * Wrapper type for phet/sun's HSlider class.
   * @param slider
   * @param phetioID
   * @constructor
   */
  function HSliderIO( slider, phetioID ) {
    assert && assertInstanceOf( slider, phet.sun.HSlider );
    NodeIO.call( this, slider, phetioID );
  }

  phetioInherit( NodeIO, 'HSliderIO', HSliderIO, {

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

  sun.register( 'HSliderIO', HSliderIO );

  return HSliderIO;
} );