// Copyright 2014-2021, University of Colorado Boulder

/**
 * Main file for the Sun library demo.
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import ScreenIcon from '../../joist/js/ScreenIcon.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../tandem/js/Tandem.js';
import ButtonsScreenView from './demo/ButtonsScreenView.js';
import ComponentsScreenView from './demo/ComponentsScreenView.js';
import DialogsScreenView from './demo/DialogsScreenView.js';
import sunStrings from './sunStrings.js';
import sunQueryParameters from './sunQueryParameters.js';

// empty model used for all demo screens
const MODEL = {};

const simOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};

/**
 * Creates a simple screen icon, a colored rectangle.
 * @param {ColorDef} color
 * @returns {ScreenIcon}
 */
function createScreenIcon( color ) {
  return new ScreenIcon(
    new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: color
    } )
  );
}

simLauncher.launch( () => {
  const componentsScreenTandem = Tandem.ROOT.createTandem( 'componentsScreen' );
  new Sim( sunStrings.sun.title, [

    // Buttons screen
    new Screen(
      () => MODEL,
      () => new ButtonsScreenView( {
        tandem: Tandem.OPT_OUT
      } ),
      {
        name: 'Buttons',
        backgroundColorProperty: new Property( sunQueryParameters.backgroundColor ),
        homeScreenIcon: createScreenIcon( 'red' ),
        tandem: Tandem.ROOT.createTandem( 'buttonsScreen' )
      }
    ),

    // Components screen
    new Screen(
      () => MODEL,
      () => new ComponentsScreenView( {
        tandem: componentsScreenTandem.createTandem( 'view' )
      } ),
      {
        name: 'Components',
        backgroundColorProperty: new Property( sunQueryParameters.backgroundColor ),
        homeScreenIcon: createScreenIcon( 'yellow' ),
        tandem: componentsScreenTandem
      }
    ),

    // Dialogs screen
    new Screen(
      () => MODEL,
      () => new DialogsScreenView( {
        tandem: Tandem.OPT_OUT
      } ),
      {
        name: 'Dialogs',
        backgroundColorProperty: new Property( sunQueryParameters.backgroundColor ),
        homeScreenIcon: createScreenIcon( 'purple' ),
        tandem: Tandem.ROOT.createTandem( 'dialogsScreen' )
      }
    )
  ], simOptions ).start();
} );