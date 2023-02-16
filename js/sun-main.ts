// Copyright 2014-2023, University of Colorado Boulder

/**
 * Main file for the Sun library demo.
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import ScreenIcon from '../../joist/js/ScreenIcon.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import { Color, TColor, Rectangle } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import ButtonsScreenView from './demo/buttons/ButtonsScreenView.js';
import ComponentsScreenView from './demo/components/ComponentsScreenView.js';
import DialogsScreenView from './demo/dialogs/DialogsScreenView.js';
import SunStrings from './SunStrings.js';
import sunQueryParameters from './sunQueryParameters.js';
import TModel from '../../joist/js/TModel.js';

// empty model used for all demo screens
class Model implements TModel {
  public reset(): void { /* nothing to do */ }
}

simLauncher.launch( () => {

  const screens = [
    new ButtonScreen( Tandem.ROOT.createTandem( 'buttonsScreen' ) ),
    new ComponentsScreen( Tandem.ROOT.createTandem( 'componentsScreen' ) ),
    new DialogsScreen( Tandem.ROOT.createTandem( 'dialogsScreen' ) )
  ];

  const sim = new Sim( SunStrings.sun.titleStringProperty, screens, {
    credits: {
      leadDesign: 'PhET Interactive Simulations'
    },
    phetioDesigned: true
  } );

  sim.start();
} );

class ButtonScreen extends Screen<Model, ButtonsScreenView> {
  public constructor( tandem: Tandem ) {
    super(
      () => new Model(),
      () => new ButtonsScreenView( { tandem: tandem.createTandem( 'view' ) } ), {
        name: new Property( 'Buttons' ),
        backgroundColorProperty: new Property( Color.toColor( sunQueryParameters.backgroundColor ) ),
        homeScreenIcon: createScreenIcon( 'red' ),
        tandem: tandem
      }
    );
  }
}

class ComponentsScreen extends Screen<Model, ComponentsScreenView> {
  public constructor( tandem: Tandem ) {
    super(
      () => new Model(),
      () => new ComponentsScreenView( { tandem: tandem.createTandem( 'view' ) } ),
      {
        name: new Property( 'Components' ),
        backgroundColorProperty: new Property( Color.toColor( sunQueryParameters.backgroundColor ) ),
        homeScreenIcon: createScreenIcon( 'yellow' ),
        tandem: tandem
      }
    );
  }
}

class DialogsScreen extends Screen<Model, DialogsScreenView> {
  public constructor( tandem: Tandem ) {
    super(
      () => new Model(),
      () => new DialogsScreenView( { tandem: tandem.createTandem( 'view' ) } ),
      {
        name: new Property( 'Dialogs' ),
        backgroundColorProperty: new Property( Color.toColor( sunQueryParameters.backgroundColor ) ),
        homeScreenIcon: createScreenIcon( 'purple' ),
        tandem: tandem
      }
    );
  }
}

/**
 * Creates a simple screen icon, a colored rectangle.
 */
function createScreenIcon( color: TColor ): ScreenIcon {
  return new ScreenIcon(
    new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: color
    } )
  );
}