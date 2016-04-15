// Copyright 2014-2015, University of Colorado Boulder

/**
 * Main file for the Sun library demo.
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonsView = require( 'SUN/demo/ButtonsView' );
  var ComponentsView = require( 'SUN/demo/ComponentsView' );
  var MemoryTestsView = require( 'SUN/demo/MemoryTestsView' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var sunTitleString = require( 'string!SUN/sun.title' );

  var simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  var createScreenIcon = function( color ) { return new Rectangle( 0, 0, 147, 100, { fill: color } ); };

  var backgroundColor = phet.chipper.getQueryParameter( 'backgroundColor' ) || 'white';

  SimLauncher.launch( function() {
    new Sim( sunTitleString, [
      new Screen( 'Buttons',
        createScreenIcon( 'red' ),
        function() {return {};},
        function( model ) {return new ButtonsView();},
        { backgroundColor: backgroundColor }
      ),
      new Screen( 'Components',
        createScreenIcon( 'yellow' ),
        function() {return {};},
        function( model ) {return new ComponentsView();},
        { backgroundColor: backgroundColor }
      ),
      new Screen( 'Memory Tests',
        createScreenIcon( 'blue' ),
        function() {return {};},
        function( model ) {return new MemoryTestsView();},
        { backgroundColor: backgroundColor }
      )
    ], simOptions ).start();
  } );
} );
