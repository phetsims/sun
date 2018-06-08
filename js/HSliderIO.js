// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for HSlider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var sun = require( 'SUN/sun' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   * @param {HSlider} hslider
   * @param {string} phetioID
   * @constructor
   */
  function HSliderIO( hslider, phetioID ) {
    assert && assertInstanceOf( hslider, phet.sun.HSlider );
    NodeIO.call( this, hslider, phetioID );
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