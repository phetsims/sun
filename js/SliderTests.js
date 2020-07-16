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
import SliderIO from './SliderIO.js';

QUnit.module( 'Slider' );

QUnit.test( 'Slider PhET-iO API validation', assert => {
  phetioAPITest( assert, {

    // Be as local and specific as possible.  Don't try to fill out the whole tree--just specify the fragment
    // relevant to Slider.  This will keep our tests local and prevent cross-repo dependencies.
    phetioType: SliderIO, // actual phetioType can be a subtype of this specification
    track: { // These nodes can be instrumented or empty inner nodes--irrelevant from this specification and testing.
      dragListener: {
        pressAction: {
          phetioFeatured: false // any phetio* key indicates the object must be instrumented and have this metadata
        }
      }
    }
  }, 'slider', tandem => new HSlider( new Property( 0 ), new Range( 0, 10 ), { tandem: tandem } ) );
} );