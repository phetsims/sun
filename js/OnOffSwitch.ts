// Copyright 2014-2022, University of Colorado Boulder

/**
 * OnOffSwitch is a switch for toggling between true (on) and false (off).
 * The off position is on the left, the on position is on the right.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import IProperty from '../../axon/js/IProperty.js';
import optionize from '../../phet-core/js/optionize.js';
import sun from './sun.js';
import ToggleSwitch, { ToggleSwitchOptions } from './ToggleSwitch.js';

type SelfOptions = {};

export type OnOffSwitchOptions = SelfOptions & ToggleSwitchOptions;

export default class OnOffSwitch extends ToggleSwitch<boolean> {

  constructor( property: IProperty<boolean>, providedOptions: OnOffSwitchOptions ) {

    const options = optionize<OnOffSwitchOptions, SelfOptions, ToggleSwitchOptions>()( {
      trackFillLeft: 'white', // track fill when property.value === false
      trackFillRight: 'rgb( 0, 200, 0 )' // track fill when property.value === true
    }, providedOptions );

    super( property, false, true, options );
  }
}

sun.register( 'OnOffSwitch', OnOffSwitch );