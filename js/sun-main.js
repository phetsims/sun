// Copyright 2014-2020, University of Colorado Boulder

/**
 * Main file for the Sun library demo.
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import ButtonsScreenView from './demo/ButtonsScreenView.js';
import ComponentsScreenView from './demo/ComponentsScreenView.js';
import DialogsScreenView from './demo/DialogsScreenView.js';
import MemoryTestsScreenView from './demo/MemoryTestsScreenView.js';
import sunStrings from './sunStrings.js';
import sunQueryParameters from './sunQueryParameters.js';

const sunTitleString = sunStrings.sun.title;

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