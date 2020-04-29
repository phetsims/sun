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
import compareAPIs from '../../tandem/js/compareAPIs.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import Slider from './Slider.js';

QUnit.module( 'Slider' );

// TODO: we may not keep this style of api validation for common code components, see https://github.com/phetsims/phet-io/issues/1648
QUnit.test( 'Slider PhET-iO API validation', assert => {
  assert.ok( true, 'always pass to support phet brand' );

  if ( Tandem.PHET_IO_ENABLED ) {

    // Access through namespace since it was dynamic module import
    const phetioEngine = phet.phetio.phetioEngine;

    assert.ok( phetioEngine instanceof PhetioObject, 'should have phetioEngine' );

    // launch to make sure tandem registration fires listeners
    Tandem.launch();

    const beforeMetadata = phet.phetio.phetioEngine.getPhetioElementsMetadata();

    // IIFE to avoid side effect from new operator
    ( () => new Slider( new NumberProperty( 0 ), new Range( 0, 10 ), {
      tandem: Tandem.GENERAL.createTandem( 'slider' )
    } ) )();

    const actualAPI = phet.phetio.phetioEngine.getPhetioElementsMetadata();

    // Clear out pre-existing things
    _.keys( beforeMetadata ).forEach( key => {
      if ( actualAPI.hasOwnProperty( key ) ) {
        delete actualAPI[ key ];
      }
    } );

    // TODO: better way to generate desired API  https://github.com/phetsims/phet-io/issues/1648
    // console.log( JSON.stringify( actualAPI, null, 2 ) );

    /* eslint-disable */
    const desiredAPI = {
      "sun.general.slider.enabledProperty": {
        "phetioTypeName": "PropertyIO<BooleanIO>",
        "phetioDocumentation": "",
        "phetioState": true,
        "phetioReadOnly": false,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": true
      },
      "sun.general.slider.enabledRangeProperty": {
        "phetioTypeName": "PropertyIO<RangeIO>",
        "phetioDocumentation": "Sliders support two ranges: the outer range which specifies the min and max of the track and the enabledRangeProperty, which determines how low and high the thumb can be dragged within the track.",
        "phetioState": true,
        "phetioReadOnly": false,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.track.trackInputListener.isDraggingProperty": {
        "phetioTypeName": "PropertyIO<BooleanIO>",
        "phetioDocumentation": "Indicates whether the object is dragging",
        "phetioState": false,
        "phetioReadOnly": true,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.track.trackInputListener.dragStartAction": {
        "phetioTypeName": "ActionIO<Vector2IO>",
        "phetioDocumentation": "A function that executes. The arguments are:<br/><ol><li>point: Vector2IO - the position of the drag start in view coordinates</li></ol>",
        "phetioState": false,
        "phetioReadOnly": true,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.track.trackInputListener.dragAction": {
        "phetioTypeName": "ActionIO<Vector2IO>",
        "phetioDocumentation": "A function that executes. The arguments are:<br/><ol><li>point: Vector2IO - the position of the drag in view coordinates</li></ol>",
        "phetioState": false,
        "phetioReadOnly": true,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": true,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.track.trackInputListener.dragEndAction": {
        "phetioTypeName": "ActionIO<Vector2IO>",
        "phetioDocumentation": "A function that executes. The arguments are:<br/><ol><li>point: Vector2IO - the position of the drag end in view coordinates</li></ol>",
        "phetioState": false,
        "phetioReadOnly": true,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.track.trackInputListener": {
        "phetioTypeName": "ObjectIO",
        "phetioDocumentation": "",
        "phetioState": false,
        "phetioReadOnly": true,
        "phetioEventType": "USER",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.thumb.pickableProperty": {
        "phetioTypeName": "PropertyIO<NullableIO<BooleanIO>>",
        "phetioDocumentation": "Sets whether the node will be pickable (and hence interactive), see the NodeIO documentation for more details",
        "phetioState": true,
        "phetioReadOnly": false,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.thumb.opacityProperty": {
        "phetioTypeName": "NumberPropertyIO",
        "phetioState": true,
        "phetioReadOnly": false,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.thumb": {
        "phetioTypeName": "NodeIO",
        "phetioDocumentation": "",
        "phetioState": false,
        "phetioReadOnly": false,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.thumb.visibleProperty": {
        "phetioTypeName": "PropertyIO<BooleanIO>",
        "phetioDocumentation": "Controls whether the Node will be visible (and interactive), see the NodeIO documentation for more details.",
        "phetioState": true,
        "phetioReadOnly": false,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.thumbInputListener.isDraggingProperty": {
        "phetioTypeName": "PropertyIO<BooleanIO>",
        "phetioDocumentation": "Indicates whether the object is dragging",
        "phetioState": false,
        "phetioReadOnly": true,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.thumbInputListener.dragStartAction": {
        "phetioTypeName": "ActionIO<Vector2IO>",
        "phetioDocumentation": "A function that executes. The arguments are:<br/><ol><li>point: Vector2IO - the position of the drag start in view coordinates</li></ol>",
        "phetioState": false,
        "phetioReadOnly": true,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.thumbInputListener.dragAction": {
        "phetioTypeName": "ActionIO<Vector2IO>",
        "phetioDocumentation": "A function that executes. The arguments are:<br/><ol><li>point: Vector2IO - the position of the drag in view coordinates</li></ol>",
        "phetioState": false,
        "phetioReadOnly": true,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": true,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.thumbInputListener.dragEndAction": {
        "phetioTypeName": "ActionIO<Vector2IO>",
        "phetioDocumentation": "A function that executes. The arguments are:<br/><ol><li>point: Vector2IO - the position of the drag end in view coordinates</li></ol>",
        "phetioState": false,
        "phetioReadOnly": true,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.thumbInputListener": {
        "phetioTypeName": "ObjectIO",
        "phetioDocumentation": "",
        "phetioState": false,
        "phetioReadOnly": true,
        "phetioEventType": "USER",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.pickableProperty": {
        "phetioTypeName": "PropertyIO<NullableIO<BooleanIO>>",
        "phetioDocumentation": "Sets whether the node will be pickable (and hence interactive), see the NodeIO documentation for more details",
        "phetioState": true,
        "phetioReadOnly": false,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.opacityProperty": {
        "phetioTypeName": "NumberPropertyIO",
        "phetioDocumentation": "Opacity of the parent NodeIO, between 0 (invisible) and 1 (fully visible)",
        "phetioState": true,
        "phetioReadOnly": false,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider": {
        "phetioTypeName": "SliderIO",
        "phetioDocumentation": "",
        "phetioState": false,
        "phetioReadOnly": false,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": false
      },
      "sun.general.slider.visibleProperty": {
        "phetioTypeName": "PropertyIO<BooleanIO>",
        "phetioDocumentation": "Controls whether the Node will be visible (and interactive), see the NodeIO documentation for more details.",
        "phetioState": true,
        "phetioReadOnly": false,
        "phetioEventType": "MODEL",
        "phetioHighFrequency": false,
        "phetioPlayback": false,
        "phetioStudioControl": true,
        "phetioDynamicElement": false,
        "phetioIsArchetype": false,
        "phetioFeatured": true
      }
    };
    /* eslint-enable */

    const report = compareAPIs( desiredAPI, actualAPI );
    assert.ok( report.length === 0, 'error report should be empty: \n\n' + report.join( '\n' ) );

    // TODO: many issues listed below for https://github.com/phetsims/phet-io/issues/1648
    // TODO: Make it easy to generate tests like this.  Like `grunt create-api-for-component Slider` > creates a test like this one.
    // TODO: Move compareAPIs to a separate module so it can be used at sim validation time and also for diff wrapper.  Will need to be UMD or wrappers will need to support ES6 modules.
    // TODO: Run unit tests automatically in pre-commit hooks
  }
} );