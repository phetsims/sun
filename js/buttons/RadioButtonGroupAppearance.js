// Copyright 2014-2020, University of Colorado Boulder

/**
 * Defines the appearance of the radio buttons, see RadioButtonGroup.js. This file is designed to be used by
 * RadioButtonGroup and RadioButtonGroupMember internally, so you should not need use it outside of these files.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import PaintColorProperty from '../../../scenery/js/util/PaintColorProperty.js';
import sun from '../sun.js';
import SunConstants from '../SunConstants.js';
import RadioButtonInteractionState from './RadioButtonInteractionState.js';

/**
 * Strategy for buttons that look flat, i.e. no shading or highlighting, but
 * that change color on mouseover, press, etc.
 *
 * @param {Node} button
 * @param {Property} interactionStateProperty
 * @param {Property} baseColorProperty
 * @param {Object} [options]
 * @constructor
 */
const DefaultRadioButtonsAppearance = function( button, interactionStateProperty, baseColorProperty, options ) {

  // Create the fills and strokes used for various button states
  const disabledStroke = new PaintColorProperty( options.disabledBaseColor, {
    luminanceFactor: -0.4
  } );
  const overStroke = new PaintColorProperty( options.overStroke || options.deselectedStroke, {
    luminanceFactor: options.overStroke ? 0 : -0.4
  } );
  const overFill = new PaintColorProperty( options.overFill || baseColorProperty, {
    luminanceFactor: options.overFill ? 0 : 0.4
  } );
  const pressedFill = new PaintColorProperty( baseColorProperty, {
    luminanceFactor: -0.4
  } );

  button.cachedPaints = [
    baseColorProperty, overFill, options.disabledBaseColor, pressedFill,
    options.deselectedStroke, overStroke, options.selectedStroke, disabledStroke
  ];

  function handleInteractionStateChanged( state ) {
    switch( state ) {

      case RadioButtonInteractionState.DESELECTED:
        button.fill = baseColorProperty;
        button.stroke = options.deselectedStroke;
        button.lineWidth = options.deselectedLineWidth;
        button.opacity = options.deselectedButtonOpacity;
        break;

      // mouseover for deselected buttons
      case RadioButtonInteractionState.OVER:
        button.fill = overFill;
        button.stroke = overStroke;
        button.lineWidth = ( options.overLineWidth ) ? options.overLineWidth : options.deselectedLineWidth;
        button.opacity = options.overButtonOpacity;
        break;

      case RadioButtonInteractionState.SELECTED:
        button.fill = baseColorProperty;
        button.stroke = options.selectedStroke;
        button.lineWidth = options.selectedLineWidth;
        button.opacity = options.selectedButtonOpacity;
        break;

      case RadioButtonInteractionState.DISABLED_DESELECTED:
        button.fill = options.disabledBaseColor;
        button.stroke = disabledStroke;
        button.lineWidth = options.deselectedLineWidth;
        button.opacity = options.deselectedButtonOpacity;
        break;

      case RadioButtonInteractionState.DISABLED_SELECTED:
        button.fill = options.disabledBaseColor;
        button.stroke = disabledStroke;
        button.lineWidth = options.selectedLineWidth;
        button.opacity = options.selectedButtonOpacity;
        break;

      case RadioButtonInteractionState.PRESSED:
        button.fill = pressedFill;
        button.stroke = options.deselectedStroke;
        button.lineWidth = options.deselectedLineWidth;
        button.opacity = options.selectedButtonOpacity;
        break;

      default:
        throw new Error( 'unsupported state: ' + state );
    }
  }

  interactionStateProperty.link( handleInteractionStateChanged );

  // add dispose function
  this.dispose = function() {
    if ( interactionStateProperty.hasListener( handleInteractionStateChanged ) ) {
      interactionStateProperty.unlink( handleInteractionStateChanged );
    }
    disabledStroke.dispose();
    overStroke.dispose();
    overFill.dispose();
    pressedFill.dispose();
  };
};

/**
 * Strategy for changing the button content opacity for each of the different states:
 * mouseover, selected, deselected, and disabled
 *
 * @param {Node} content
 * @param {Property} interactionStateProperty
 * @param {Object} [options]
 * @constructor
 * @public
 */
const ContentAppearanceStrategy = function( content, interactionStateProperty, options ) {

  // The button is not the parent of the content, therefore it is necessary to set the opacity on the content separately
  function handleInteractionStateChanged( state ) {
    if ( content !== null ) {
      switch( state ) {

        case RadioButtonInteractionState.DESELECTED:
          content.opacity = options.deselectedContentOpacity;
          break;

        // mouseover for deselected buttons
        case RadioButtonInteractionState.OVER:
          content.opacity = options.overContentOpacity;
          break;

        case RadioButtonInteractionState.SELECTED:
          content.opacity = options.selectedContentOpacity;
          break;

        case RadioButtonInteractionState.DISABLED_DESELECTED:
          content.opacity = SunConstants.DISABLED_OPACITY;
          break;

        case RadioButtonInteractionState.DISABLED_SELECTED:
          content.opacity = SunConstants.DISABLED_OPACITY;
          break;

        case RadioButtonInteractionState.PRESSED:
          content.opacity = options.deselectedContentOpacity;
          break;

        default:
          throw new Error( 'unsupported state: ' + state );
      }
    }
  }

  interactionStateProperty.link( handleInteractionStateChanged );

  // add a disposal function
  this.dispose = function() {
    if ( interactionStateProperty.hasListener( handleInteractionStateChanged ) ) {
      interactionStateProperty.unlink( handleInteractionStateChanged );
    }
  };
};

const RadioButtonGroupAppearance = {
  defaultRadioButtonsAppearance: DefaultRadioButtonsAppearance,
  contentAppearanceStrategy: ContentAppearanceStrategy
};

sun.register( 'RadioButtonGroupAppearance', RadioButtonGroupAppearance );

export default RadioButtonGroupAppearance;