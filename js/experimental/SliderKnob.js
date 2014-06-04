// Copyright 2002-2014, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  // constants
  var DEFAULT_WIDTH = 20;
  var DEFAULT_HEIGHT = 40;

  /**
   * @param {Object} options See parent type for info about options not shown in this file
   * @constructor
   */
  function SliderKnob( options ) {

    options = _.extend( {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      baseColor: '#00bfff'
    }, options );

    options.xMargin = ( options.width - 2 ) / 2;
    options.yMargin = 5;
    options.content = new Line( 0, 0, 0, options.height - options.yMargin * 2, { stroke: 'white', lineWidth: 2 } );

    RectangularPushButton.call( this, options );
  }

  return inherit( RectangularPushButton, SliderKnob );
} );