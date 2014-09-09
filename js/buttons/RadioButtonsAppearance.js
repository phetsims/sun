//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Defines the appearance of the radio buttons, see RadioButtons.js
 * TODO: The appearance should be customizable
 * TODO: There is much duplicated here, and copied from RectangularButtonView.  We should find a way to consolidate.
 *
 * @author Sam Reid (PhET Interactive Simulations)
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
   * @param {Object} options
   * @constructor
   */
  RadioButtonsAppearance.flatAppearanceStrategyDeselected = function( button, interactionStateProperty, options ) {

    // Set up variables needed to create the various gradient fills
    var baseColor = Color.toColor( options.baseColor );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var disabledStroke = null;
    if ( options.stroke ) {
      disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    }

    // Create the fills used for various button states
    var upFill = baseColor;
    var overFill = baseColor.colorUtilsBrighter( 0.4 );
    var downFill = baseColor.colorUtilsDarker( 0.4 );
    var disabledFill = disabledBaseColor;
    var disabledPressedFillVertical = disabledFill;

    button.opacity = 0.7;

    interactionStateProperty.link( function( state ) {
      switch( state ) {

        case 'idle':
          button.fill = upFill;
          button.stroke = options.stroke;
          break;

        case 'over':
          button.fill = overFill;
          button.stroke = options.stroke;
          break;

        case 'pressed':
          button.fill = downFill;
          button.stroke = options.stroke;
          break;

        case 'disabled':
          button.fill = disabledFill;
          button.stroke = disabledStroke;
          break;

        case 'disabled-pressed':
          button.fill = disabledPressedFillVertical;
          button.stroke = disabledStroke;
          break;
      }
    } );
  };

  /**
   * Strategy for buttons that look flat, i.e. no shading or highlighting, but
   * that change color on mouseover, press, etc.
   *
   * @param {Node} button
   * @param {Property} interactionStateProperty
   * @param {Object} options
   * @constructor
   */
  RadioButtonsAppearance.flatAppearanceStrategyWithBorder = function( button, interactionStateProperty, options ) {

    // Set up variables needed to create the various gradient fills
    var baseColor = Color.toColor( options.baseColor );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var disabledStroke = null;
    if ( options.stroke || true ) {
      disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    }

    // Create the fills used for various button states
    var upFill = baseColor;
    var overFill = baseColor.colorUtilsBrighter( 0.4 );
    var downFill = baseColor.colorUtilsDarker( 0.4 );
    var disabledFill = disabledBaseColor;
    var disabledPressedFillVertical = disabledFill;

    interactionStateProperty.link( function( state ) {
      switch( state ) {

        case 'idle':
          button.fill = upFill;
          button.stroke = options.stroke;
          break;

        case 'over':
          button.fill = overFill;
          button.stroke = options.stroke;
          break;

        case 'pressed':
          button.fill = downFill;
          button.stroke = options.stroke;
          break;

        case 'disabled':
          button.fill = disabledFill;
          button.stroke = disabledStroke;
          break;

        case 'disabled-pressed':
          button.fill = disabledPressedFillVertical;
          button.stroke = disabledStroke;
          break;
      }
    } );
  };


  return inherit( Object, RadioButtonsAppearance, {}, {



  } );
} );