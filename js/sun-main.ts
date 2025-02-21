// Copyright 2014-2025, University of Colorado Boulder

/**
 * Main file for the Sun library demo.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import ScreenIcon from '../../joist/js/ScreenIcon.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import type TModel from '../../joist/js/TModel.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Color from '../../scenery/js/util/Color.js';
import type TColor from '../../scenery/js/util/TColor.js';
import Tandem from '../../tandem/js/Tandem.js';
import ButtonsScreenView from './demo/buttons/ButtonsScreenView.js';
import ComponentsScreenView from './demo/components/ComponentsScreenView.js';
import DialogsScreenView from './demo/dialogs/DialogsScreenView.js';
import sunQueryParameters from './sunQueryParameters.js';
import SunStrings from './SunStrings.js';

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
        name: SunStrings.screen.buttonsStringProperty,
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
        name: SunStrings.screen.componentsStringProperty,
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
        name: SunStrings.screen.dialogsStringProperty,
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