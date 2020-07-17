// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Property from '../../axon/js/Property.js';
import PropertyIO from '../../axon/js/PropertyIO.js';
import Range from '../../dot/js/Range.js';
import phetioAPITest from '../../tandem/js/phetioAPITest.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import HSlider from './HSlider.js';
import SliderAPI from './SliderAPI.js';

QUnit.module( 'Slider' );

QUnit.test( 'Slider PhET-iO API validation', assert => {
  phetioAPITest( assert, new SliderAPI(), 'slider',
    tandem => {
      return new HSlider( new Property( 0, {
          phetioType: PropertyIO( NumberIO ),
          tandem: tandem.createTandem( 'otherValueProperty' )
        } ),
        new Range( 0, 10 ), { tandem: tandem } );
    } );
} );

QUnit.test( 'Slider PhET-iO API validation, provided enabledProperty', assert => {
  phetioAPITest( assert, new SliderAPI(), 'slider',

    tandem => new HSlider( new Property( 0, {
        phetioType: PropertyIO( NumberIO ),
        tandem: tandem.createTandem( 'otherValue2Property' )
      } ),
      new Range( 0, 10 ), {
        tandem: tandem,
        enabledProperty: new BooleanProperty( false, { tandem: tandem.createTandem( 'otherEnabled2Property' ), phetioFeatured: true } )
      } ) );
} );