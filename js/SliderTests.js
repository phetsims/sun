// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Range from '../../dot/js/Range.js';
import phetioAPITest from '../../tandem/js/phetioAPITest.js';
import HSlider from './HSlider.js';
import SliderAPI from './SliderAPI.js';

QUnit.module( 'Slider' );

QUnit.test( 'Slider PhET-iO API validation', assert => {
  phetioAPITest( assert, new SliderAPI(), 'slider', tandem => new HSlider( new Property( 0 ), new Range( 0, 10 ), { tandem: tandem } ) );
} );