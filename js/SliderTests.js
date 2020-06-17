// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../axon/js/NumberProperty.js';
import Range from '../../dot/js/Range.js';
import phetioAPITest from '../../tandem/js/phetioAPITest.js';
import Tandem from '../../tandem/js/Tandem.js';
import Slider from './Slider.js';
import SliderIO from './SliderIO.js';

QUnit.module( 'Slider' );

QUnit.test( 'Slider PhET-iO API validation', assert => {
  const numberProperty = new NumberProperty( 0, { tandem: Tandem.GENERAL.createTandem( 'myNumberProperty' ) } );
  phetioAPITest( assert, SliderIO, 'slider', tandem => new Slider( numberProperty, new Range( 0, 10 ), {
    tandem: tandem
  } ) );
} );