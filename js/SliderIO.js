// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanIO = require( 'TANDEM/types/BooleanIO' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var VoidIO = require( 'TANDEM/types/VoidIO' );

  /**
   * @param {Slider} slider
   * @param {string} phetioID
   * @constructor
   */
  function SliderIO( slider, phetioID ) {
    NodeIO.call( this, slider, phetioID );
  }

  phetioInherit( NodeIO, 'SliderIO', SliderIO, {

    setMajorTicksVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.instance.setMajorTicksVisible( visible );
      },
      documentation: 'Set whether the major tick marks should be shown',
      invocableForReadOnlyElements: false
    },

    setMinorTicksVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.instance.setMinorTicksVisible( visible );
      },
      documentation: 'Set whether the minor tick marks should be shown',
      invocableForReadOnlyElements: false
    }
  }, {
    documentation: 'A traditional slider component, with a knob and possibly tick marks',
    validator: { isValidValue: v => v instanceof phet.sun.Slider }
  } );

  sun.register( 'SliderIO', SliderIO );

  return SliderIO;
} );