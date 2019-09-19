// Copyright 2014-2018, University of Colorado Boulder

/**
 * Main file for the Sun library demo.
 */
define( require => {
  'use strict';

  // modules
  const ButtonsScreenView = require( 'SUN/demo/ButtonsScreenView' );
  const ComponentsScreenView = require( 'SUN/demo/ComponentsScreenView' );
  const DialogsScreenView = require( 'SUN/demo/DialogsScreenView' );
  const MemoryTestsScreenView = require( 'SUN/demo/MemoryTestsScreenView' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Screen = require( 'JOIST/Screen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const sunQueryParameters = require( 'SUN/sunQueryParameters' );

  // strings
  const sunTitleString = require( 'string!SUN/sun.title' );

  const simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  const createScreenIcon = function( color ) {
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
