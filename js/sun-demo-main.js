// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main file for the Sun library demo.
 */
define( function( require ) {
  'use strict';

  // Imports
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ButtonsModel = require( 'SUN/demo/model/ButtonsModel' );
  var ButtonsView = require( 'SUN/demo/view/ButtonsView' );

  // Strings
  var simTitle = 'Sun demo';

  var simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  SimLauncher.launch( function() {
    // Create and start the sim
    //Create and start the sim
    new Sim( simTitle, [
      new Screen( simTitle, null,
        function() {return new ButtonsModel( ScreenView.DEFAULT_LAYOUT_BOUNDS.width, ScreenView.DEFAULT_LAYOUT_BOUNDS.height );},
        function( model ) {return new ButtonsView( model );},
        { backgroundColor: '#fff' }
      )
    ], simOptions ).start();
  } );
} );
