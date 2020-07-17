// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for Slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ActionIO from '../../axon/js/ActionIO.js';
import NumberPropertyIO from '../../axon/js/NumberPropertyIO.js';
import Property from '../../axon/js/Property.js';
import PropertyIO from '../../axon/js/PropertyIO.js';
import Range from '../../dot/js/Range.js';
import merge from '../../phet-core/js/merge.js';
import SceneryEventIO from '../../scenery/js/input/SceneryEventIO.js';
import NodeIO from '../../scenery/js/nodes/NodeIO.js';
import phetioAPITest from '../../tandem/js/phetioAPITest.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import HSlider from './HSlider.js';
import SliderIO from './SliderIO.js';

QUnit.module( 'Slider' );

class ObjectAPI {
  constructor( options ) {
    options = merge( {}, options );



    // this.phetioFeatured = options.phetioFeatured;
    // this.phetioReadOnly = options.phetioReadOnly;
    // this.phetioType = options.phetioType;

    // TODO: perhaps we can use PhetioObject.METADATA_KEYS to pluck the keys needed onto the actual ObjectAPI, instead
    // TODO: of exposing `options` publically as a pattern, https://github.com/phetsims/phet-io/issues/1657
    this.options = options;
  }
}

class PropertyAPI extends ObjectAPI {
  constructor( options ) {
    super( options );
  }
}

class NodeAPI extends ObjectAPI {
  constructor( options ) {

    options = merge( {
      phetioType: NodeIO,
      visiblePropertyOptions: {
        phetioType: PropertyIO( BooleanIO )
      },

      pickablePropertyOptions: {
        phetioType: PropertyIO( NullableIO( BooleanIO ) )
      },

      opacityPropertyOptions: {
        phetioType: NumberPropertyIO
      }
    }, options );
    super( options );

    this.visibleProperty = new PropertyAPI( options.visiblePropertyOptions );
    this.opacityProperty = new PropertyAPI( options.opacityPropertyOptions );
    this.pickableProperty = new PropertyAPI( options.pickablePropertyOptions );
  }
}

class TrackAPI extends NodeAPI {
  constructor( options ) {

    options = merge( {

      // All TrackAPIs have an unfeatured drag press action
      dragListenerOptions: {
        pressActionOptions: {
          phetioFeature: false
        }
      }
    }, options );

    super( options );

    this.dragListener = new DragListenerAPI( options.dragListenerOptions );
  }
}

class SliderAPI extends NodeAPI {
  constructor( options ) {

    options = merge( {
      phetioType: SliderIO
    }, options );

    super( options );

    this.track = new TrackAPI( {

      // TODO: this is now part of the API, but how to we tell phetioAPITest to test this arbitrarily deep tandem override for Slider, https://github.com/phetsims/phet-io/issues/1657
      dragListenerOptions: {
        pressActionOptions: {
          phetioFeature: true
        }
      }
    } );
  }
}

class ActionAPI extends ObjectAPI {
  constructor( options ) {
    options = merge( {
      phetioType: ActionIO( [] )
    }, options );
    super( options );
  }
}

class PressListenerAPI extends ObjectAPI {
  constructor( options ) {
    options = merge( {
      pressActionOptions: { phetioType: ActionIO( [ SceneryEventIO ] ) },
      releaseActionOptions: { phetioType: ActionIO( [ NullableIO( SceneryEventIO ) ] ) }
    }, options );

    super( options );
    this.pressAction = new ActionAPI( options.pressActionOptions );
    this.releaseAction = new ActionAPI( options.releaseActionOptions );
  }
}

class DragListenerAPI extends PressListenerAPI {
  constructor( options ) {
    options = merge( {
      dragActionOptions: {
        phetioType: ActionIO( [ SceneryEventIO ] )
      }
    }, options );
    super( options );

    this.dragAction = new ActionAPI( options.dragActionOptions );
  }
}

QUnit.test( 'Slider PhET-iO API validation', assert => {
  phetioAPITest( assert, new SliderAPI(), 'slider', tandem => new HSlider( new Property( 0 ), new Range( 0, 10 ), { tandem: tandem } ) );
} );