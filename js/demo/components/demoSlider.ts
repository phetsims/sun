// Copyright 2022, University of Colorado Boulder

/**
 * Demos for HSlider and VSlider
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Slider from '../../Slider.js';
import HSlider, { HSliderOptions } from '../../HSlider.js';
import VSlider from '../../VSlider.js';
import Checkbox from '../../Checkbox.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Font, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import { SunDemoOptions } from '../DemosScreenView.js';

const CHECKBOX_FONT = new Font( { size: 20 } );

// Used by demoHSlider and demoVSlider
function demoSlider( layoutBounds: Bounds2, orientation: 'horizontal' | 'vertical', providedOptions?: SunDemoOptions ): Node {

  const options = combineOptions<SunDemoOptions>( {
    center: layoutBounds.center,
    tandem: Tandem.REQUIRED,
    phetioDesigned: true
  }, providedOptions );

  const property = new Property( 0 );
  const range = new Range( 0, 100 );
  const tickLabelOptions = { font: new Font( { size: 16 } ) };

  const enabledRangeProperty = new Property( new Range( 0, 100 ) );

  let slider: Slider;
  if ( orientation === 'horizontal' ) {
    slider = new HSlider( property, range, optionize<SunDemoOptions, EmptySelfOptions, HSliderOptions>()( {
      trackSize: new Dimension2( 300, 5 ),

      // Demonstrate larger x dilation.
      thumbTouchAreaXDilation: 30,
      thumbTouchAreaYDilation: 15,
      thumbMouseAreaXDilation: 10,
      thumbMouseAreaYDilation: 5,
      enabledRangeProperty: enabledRangeProperty,

      phetioEnabledPropertyInstrumented: false
    }, options ) );
  }
  else {
    slider = new VSlider( property, range, optionize<SunDemoOptions, EmptySelfOptions, HSliderOptions>()( {
      trackSize: new Dimension2( 5, 300 ),

      // Demonstrate larger y dilation, to verify that VSlider is handling things correctly.
      thumbTouchAreaXDilation: 15,
      thumbTouchAreaYDilation: 30,
      thumbMouseAreaXDilation: 5,
      thumbMouseAreaYDilation: 10,
      enabledRangeProperty: enabledRangeProperty,

      phetioEnabledPropertyInstrumented: false
    }, options ) );
  }

  // Settable
  const enabledProperty = new BooleanProperty( true );
  slider.enabledProperty = enabledProperty;

  // major ticks
  slider.addMajorTick( range.min, new Text( range.min, tickLabelOptions ) );
  slider.addMajorTick( range.getCenter(), new Text( range.getCenter(), tickLabelOptions ) );
  slider.addMajorTick( range.max, new Text( range.max, tickLabelOptions ) );

  // minor ticks
  slider.addMinorTick( range.min + 0.25 * range.getLength() );
  slider.addMinorTick( range.min + 0.75 * range.getLength() );

  // show/hide major ticks
  const majorTicksVisibleProperty = new Property( true );
  majorTicksVisibleProperty.link( visible => {
    slider.majorTicksVisible = visible;
  } );
  const majorTicksCheckbox = new Checkbox( majorTicksVisibleProperty,
    new Text( 'Major ticks visible', { font: CHECKBOX_FONT } ), {
      tandem: Tandem.OPT_OUT,
      left: slider.left,
      top: slider.bottom + 40
    } );

  // show/hide minor ticks
  const minorTicksVisibleProperty = new Property( true );
  minorTicksVisibleProperty.link( visible => {
    slider.minorTicksVisible = visible;
  } );
  const minorTicksCheckbox = new Checkbox( minorTicksVisibleProperty,
    new Text( 'Minor ticks visible', { font: CHECKBOX_FONT } ), {
      tandem: Tandem.OPT_OUT,
      left: slider.left,
      top: majorTicksCheckbox.bottom + 40
    } );

  // Checkbox to enable/disable slider
  const enabledCheckbox = new Checkbox( enabledProperty,
    new Text( 'Enable slider', { font: CHECKBOX_FONT } ), {
      tandem: Tandem.OPT_OUT,
      left: slider.left,
      top: minorTicksCheckbox.bottom + 40
    } );

  // restrict enabled range of slider
  const restrictedRangeProperty = new Property( false );
  restrictedRangeProperty.link( restrictedRange => {
    enabledRangeProperty.value = restrictedRange ? new Range( 25, 75 ) : new Range( 0, 100 );
  } );

  const enabledRangeCheckbox = new Checkbox( restrictedRangeProperty,
    new Text( 'Enable Range [25, 75]', { font: CHECKBOX_FONT } ), {
      tandem: Tandem.OPT_OUT,
      left: slider.left,
      top: enabledCheckbox.bottom + 40
    } );

  // If the user is holding down the thumb outside of the enabled range, and the enabled range expands, the value should
  // adjust to the new extremum of the range, see https://github.com/phetsims/mean-share-and-balance/issues/29
  const animateEnabledRangeProperty = new BooleanProperty( false );
  const animateEnabledRangeCheckbox = new Checkbox( animateEnabledRangeProperty, new Text( 'Animate Enabled Range', { font: CHECKBOX_FONT } ), {
    tandem: Tandem.OPT_OUT,
    left: slider.left,
    top: enabledRangeCheckbox.bottom + 40
  } );

  const enabledRangeStep = 0.1;
  stepTimer.addListener( () => {
    if ( animateEnabledRangeProperty.value && enabledRangeProperty.value.min < enabledRangeProperty.value.max - enabledRangeStep ) {
      enabledRangeProperty.value = new Range( Math.max( enabledRangeProperty.value.min + enabledRangeStep, 0 ), 75 );
    }
  } );

  // All of the controls related to the slider
  const controls = new VBox( {
    align: 'left',
    spacing: 30,
    children: [ majorTicksCheckbox, minorTicksCheckbox, enabledCheckbox, enabledRangeCheckbox, animateEnabledRangeCheckbox ]
  } );

  // Position the control based on the orientation of the slider
  const boxOptions = {
    spacing: 60,
    children: [ slider, controls ],
    center: layoutBounds.center
  };
  return ( orientation === 'horizontal' ) ? new VBox( boxOptions ) : new HBox( boxOptions );
}

// Creates a demo for HSlider
export function demoHSlider( layoutBounds: Bounds2, options?: SunDemoOptions ): Node {
  return demoSlider( layoutBounds, 'horizontal', options );
}

// Creates a demo for VSlider
export function demoVSlider( layoutBounds: Bounds2, options?: SunDemoOptions ): Node {
  return demoSlider( layoutBounds, 'vertical', options );
}