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

  // constants
  var BACKGROUND_COLOR = QueryStringMachine.get( 'backgroundColor', {
    type: 'string', // CSS color format, e.g. 'green', 'ff8c00', 'rgb(255,0,255)'
    defaultValue: 'white'
  } );

  var simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  var createScreenIcon = function( color ) {
    return new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, { fill: color } );
  };

  SimLauncher.launch( function() {
    new Sim( sunTitleString, [

      // Buttons screen
      new Screen(
        function() {return {};},
        function( model ) {return new ButtonsView();},
        {
          name: 'Buttons',
          backgroundColor: BACKGROUND_COLOR,
          homeScreenIcon: createScreenIcon( 'red' )
        }
      ),

      // Components screen
      new Screen(
        function() {return {};},
        function( model ) {return new ComponentsView();},
        {
          name: 'Components',
          backgroundColor: BACKGROUND_COLOR,
          homeScreenIcon: createScreenIcon( 'yellow' )
        }
      ),

      // Memory Test screen
      new Screen(
        function() {return {};},
        function( model ) {return new MemoryTestsView();},
        {
          name: 'Memory Tests',
          backgroundColor: BACKGROUND_COLOR,
          homeScreenIcon: createScreenIcon( 'blue' )
        }
      )
    ], simOptions ).start();
  } );
} );
