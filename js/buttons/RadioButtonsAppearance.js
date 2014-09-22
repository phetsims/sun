//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Defines the appearance of the radio buttons, see RadioButtonGroup.js
 * TODO: The appearance should be customizable
 * TODO: There is much duplicated here, and copied from RectangularButtonView.  We should find a way to consolidate.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );

  /**
   *
   * @constructor
   */
  function RadioButtonsAppearance() {
  }

  /**
   * Strategy for buttons that look flat, i.e. no shading or highlighting, but
   * that change color on mouseover, press, etc.
   *
   * @param {Node} button
   * @param {Property} interactionStateProperty
   * @param {Object} [options]
   * @constructor
   */
  RadioButtonsAppearance.defaultRadioButtonsAppearance = function( button, interactionStateProperty, options ) {

    // Set up variables needed to create the various fills and strokes
    var baseColor = Color.toColor( options.baseColor );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var deselectedStroke = Color.toColor( options.deselectedStroke );

    // Create the fills and strokes used for various button states
    var disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    var overStroke = deselectedStroke.colorUtilsDarker( 0.4 );
    var overFill = baseColor.colorUtilsBrighter( 0.4 );

    interactionStateProperty.link( function( state ) {
      switch( state ) {

        // deselected
        case 'idle':
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

        // selected
        case 'pressed':
          button.fill = baseColor;
          button.stroke = options.selectedStroke;
          button.lineWidth = options.selectedLineWidth;
          button.opacity = options.selectedButtonOpacity;
          break;

        // disabled and deselected
        case 'disabled':
          button.fill = disabledBaseColor;
          button.stroke = disabledStroke;
          button.lineWidth = options.deselectedLineWidth;
          button.opacity = options.deselectedButtonOpacity;
          break;

        // disabled and selected
        case 'disabled-pressed':
          button.fill = disabledBaseColor;
          button.stroke = disabledStroke;
          button.lineWidth = options.selectedLineWidth;
          button.opacity = options.selectedButtonOpacity;
          break;
      }
    } );
  };

  RadioButtonsAppearance.contentAppearanceStrategy = function( content, interactionStateProperty, options ) {

    // for some reason setting the opacity on the buttons directly seems to have no effect if the content in an
    // image. Therefore, there is an option to set the content opacity here in addition to the button opacity in
    // defaultRadioButtonsAppearance.
    interactionStateProperty.link( function( state ) {
      switch( state ) {

        // deselected
        case 'idle':
          content.opacity = options.deselectedContentOpacity;
          break;

        // mouseover for deselected buttons
        case 'over':
          content.opacity = options.overContentOpacity;
          break;

        // selected
        case 'pressed':
          content.opacity = options.selectedContentOpacity;
          break;

        // disabled and deselected
        case 'disabled':
          content.opacity = options.deselectedContentOpacity;
          break;

        // disabled and selected
        case 'disabled-pressed':
          content.opacity = options.selectedContentOpacity;
          break;
      }
    } );
  };

  return inherit( Object, RadioButtonsAppearance, {}, {
  } );
} );