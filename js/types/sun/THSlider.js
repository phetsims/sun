// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TBoolean = require( 'PHET_IO/types/TBoolean' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var TTandemDragHandler = require( 'PHET_IO/types/tandem/scenery/input/TTandemDragHandler' );
  var TVoid = require( 'PHET_IO/types/TVoid' );

  var THSliderTrack = phetioInherit( TNode, 'THSliderTrack', function( sliderTrack, phetioID ) {
    TNode.call( this, sliderTrack, phetioID );
    assertInstanceOf( sliderTrack, phet.sun.HSliderTrack );
  }, {}, {
    api: {
      trackInputListener: TTandemDragHandler
    },
    documentation: 'The track for a knob of a traditional slider'
  } );

  var THSlider = phetioInherit( TNode, 'THSlider', function( slider, phetioID ) {
    TNode.call( this, slider, phetioID );
    assertInstanceOf( slider, phet.sun.HSlider );
  }, {
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
    api: {
      sliderTrack: THSliderTrack,
      thumbInputListener: TTandemDragHandler
    },
    documentation: 'A traditional slider component, with a knob and possibly tick marks'
  } );

  phetioNamespace.register( 'THSlider', THSlider );

  return THSlider;
} );