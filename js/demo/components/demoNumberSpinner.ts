// Copyright 2022, University of Colorado Boulder

/**
 * Demo for NumberSpinner
 */

import NumberSpinner, { NumberSpinnerOptions } from '../../NumberSpinner.js';
import Checkbox from '../../Checkbox.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Property from '../../../../axon/js/Property.js';
import { Font, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

export default function demoNumberSpinner( layoutBounds: Bounds2 ): Node {

  const valueProperty = new Property( 0 );
  const valueRangeProperty = new Property( new Range( -5, 5 ) );
  const enabledProperty = new Property( true );

  // options for all spinners
  const spinnerOptions: NumberSpinnerOptions = {
    enabledProperty: enabledProperty,
    deltaValue: 0.1,
    touchAreaXDilation: 20,
    touchAreaYDilation: 10,
    mouseAreaXDilation: 10,
    mouseAreaYDilation: 5,
    numberDisplayOptions: {
      decimalPlaces: 1,
      align: 'center',
      xMargin: 10,
      yMargin: 3,
      minBackgroundWidth: 100,
      textOptions: {
        font: new Font( { size: 28 } )
      }
    }
  };

  // Demonstrate each value of options.arrowsPosition
  const spinnerLeftRight = new NumberSpinner( valueProperty, valueRangeProperty,
    combineOptions<NumberSpinnerOptions>( {}, spinnerOptions, {
      arrowsPosition: 'leftRight',
      numberDisplayOptions: {
        valuePattern: '{{value}} bottles of beer on the wall'
      }
    } ) );

  const spinnerTopBottom = new NumberSpinner( valueProperty, valueRangeProperty,
    combineOptions<NumberSpinnerOptions>( {}, spinnerOptions, {
      arrowsPosition: 'topBottom',
      arrowsScale: 0.65
    } ) );

  const spinnerBothRight = new NumberSpinner( valueProperty, valueRangeProperty,
    combineOptions<NumberSpinnerOptions>( {}, spinnerOptions, {
      arrowsPosition: 'bothRight',
      numberDisplayOptions: {
        yMargin: 10,
        align: 'right'
      }
    } ) );

  const spinnerBothBottom = new NumberSpinner( valueProperty, valueRangeProperty,
    combineOptions<NumberSpinnerOptions>( {}, spinnerOptions, {
      arrowsPosition: 'bothBottom',
      numberDisplayOptions: {
        backgroundFill: 'pink',
        backgroundStroke: 'red',
        backgroundLineWidth: 3,
        align: 'left'
      },
      arrowButtonFill: 'lightblue',
      arrowButtonStroke: 'blue',
      arrowButtonLineWidth: 0.2
    } ) );

  const enabledCheckbox = new Checkbox( enabledProperty, new Text( 'enabled', { font: new Font( { size: 20 } ) } ) );

  return new VBox( {
    children: [ spinnerTopBottom, spinnerBothRight, spinnerBothBottom, spinnerLeftRight, enabledCheckbox ],
    spacing: 40,
    center: layoutBounds.center
  } );
}