// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  var BooleanIO = require( 'TANDEM/types/BooleanIO' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var sun = require( 'SUN/sun' );
  var VoidIO = require( 'TANDEM/types/VoidIO' );

  class SliderIO extends NodeIO {}

  SliderIO.methods = {

    setMajorTicksVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.phetioObject.setMajorTicksVisible( visible );
      },
      documentation: 'Set whether the major tick marks should be shown',
      invocableForReadOnlyElements: false
    },

    setMinorTicksVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.phetioObject.setMinorTicksVisible( visible );
      },
      documentation: 'Set whether the minor tick marks should be shown',
      invocableForReadOnlyElements: false
    }
  };
  SliderIO.documentation = 'A traditional slider component, with a knob and possibly tick marks';
  SliderIO.validator = { isValidValue: v => v instanceof phet.sun.Slider };
  SliderIO.typeName = 'SliderIO';
  ObjectIO.validateSubtype( SliderIO );

  return sun.register( 'SliderIO', SliderIO );
} );