//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Defines the appearance of the radio buttons, see RadioButtonGroup.js
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );

  // constants
  var DISABLED_OPACITY = 0.3;

  /**
   * Strategy for buttons that look flat, i.e. no shading or highlighting, but
   * that change color on mouseover, press, etc.
   *
   * @param {Node} button
   * @param {Property} interactionStateProperty
   * @param {Object} [options]
   * @constructor
   */
  var defaultRadioButtonsAppearance = function( button, interactionStateProperty, options ) {

    // Set up variables needed to create the various fills and strokes
    var baseColor = Color.toColor( options.baseColor );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var deselectedStroke = Color.toColor( options.deselectedStroke );

    // Create the fills and strokes used for various button states
    var disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    var overStroke = deselectedStroke.colorUtilsDarker( 0.4 );
    var overFill = baseColor.colorUtilsBrighter( 0.4 );
    var pressedFill = baseColor.colorUtilsDarker( 0.4 );

    interactionStateProperty.link( function( state ) {
      switch( state ) {

        case 'deselected':
          button.fill = baseColor;
          button.stroke = options.deselectedStroke;
          button.lineWidth = options.deselectedLineWidth;
          button.opacity = options.deselectedButtonOpacity;
          break;

        // mouseover for deselected buttons
        case 'over':
          button.fill = ( options.overFill ) ? options.overFill : overFill;
          button.stroke = ( options.overStroke ) ? options.overStroke : overStroke;
          button.lineWidth = ( options.overLineWidth ) ? options.overLineWidth : options.deselectedLineWidth;
          button.opacity = options.overButtonOpacity;
          break;

        case 'selected':
          button.fill = baseColor;
          button.stroke = options.selectedStroke;
          button.lineWidth = options.selectedLineWidth;
          button.opacity = options.selectedButtonOpacity;
          break;

        case 'disabled-deselected':
          button.fill = disabledBaseColor;
          button.stroke = disabledStroke;
          button.lineWidth = options.deselectedLineWidth;
          button.opacity = options.deselectedButtonOpacity;
          break;

        case 'disabled-selected':
          button.fill = disabledBaseColor;
          button.stroke = disabledStroke;
          button.lineWidth = options.selectedLineWidth;
          button.opacity = options.selectedButtonOpacity;
          break;

        case 'pressed':
          button.fill = pressedFill;
          button.stroke = options.deselectedStroke;
          button.lineWidth = options.deselectedLineWidth;
          button.opacity = options.selectedButtonOpacity;
          break;
      }
    } );
  };

  /**
   * Strategy for changing the button content opacity for each of the different states:
   * mouseover, selected, deselected, and disabled
   *
   * @param {Node} button
   * @param {Property} interactionStateProperty
   * @param {Object} [options]
   * @constructor
   */
  var contentAppearanceStrategy = function( content, interactionStateProperty, options ) {

    // The button is not the parent of the content, therefore it is necessary to set the opacity on
    // the content separately
    interactionStateProperty.link( function( state ) {
      if ( content !== null ) {
        switch( state ) {

          case 'deselected':
            content.opacity = options.deselectedContentOpacity;
            break;

          // mouseover for deselected buttons
          case 'over':
            content.opacity = options.overContentOpacity;
            break;

          case 'selected':
            content.opacity = options.selectedContentOpacity;
            break;

          case 'disabled-deselected':
            content.opacity = DISABLED_OPACITY;
            break;

          case 'disabled-selected':
            content.opacity = DISABLED_OPACITY;
            break;

          case 'pressed':
            content.opacity = options.deselectedContentOpacity;
            break;
        }
      }
    } );
  };

  return {
    defaultRadioButtonsAppearance: defaultRadioButtonsAppearance,
    contentAppearanceStrategy: contentAppearanceStrategy
  };

} );