// Copyright 2014-2018, University of Colorado Boulder

/**
 * Main file for the Sun library demo.
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonsScreenView = require( 'SUN/demo/ButtonsScreenView' );
  var ComponentsScreenView = require( 'SUN/demo/ComponentsScreenView' );
  var DialogsScreenView = require( 'SUN/demo/DialogsScreenView' );
  var MemoryTestsScreenView = require( 'SUN/demo/MemoryTestsScreenView' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var sunQueryParameters = require( 'SUN/sunQueryParameters' );

  // strings
  var sunTitleString = require( 'string!SUN/sun.title' );

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
        function( model ) {return new ButtonsScreenView();},
        {
          name: 'Buttons',
          backgroundColorProperty: new Property( sunQueryParameters.backgroundColor ),
          homeScreenIcon: createScreenIcon( 'red' )
        }
      ),

      // Components screen
      new Screen(
        function() {return {};},
        function( model ) {return new ComponentsScreenView();},
        {
          name: 'Components',
          backgroundColorProperty: new Property( sunQueryParameters.backgroundColor ),
          homeScreenIcon: createScreenIcon( 'yellow' )
        }
      ),

      // Components screen
      new Screen(
        function() {return {};},
        function( model ) {return new DialogsScreenView();},
        {
          name: 'Dialogs',
          backgroundColorProperty: new Property( sunQueryParameters.backgroundColor ),
          homeScreenIcon: createScreenIcon( 'white' )
        }
      ),

      // Dialogs screen

      // Memory Test screen
      new Screen(
        function() {return {};},
        function( model ) {return new MemoryTestsScreenView();},
        {
          name: 'Memory Tests',
          backgroundColorProperty: new Property( sunQueryParameters.backgroundColor ),
          homeScreenIcon: createScreenIcon( 'blue' )
        }
      )
    ], simOptions ).start();
  } );
} );
