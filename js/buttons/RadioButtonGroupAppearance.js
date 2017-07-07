// Copyright 2014-2015, University of Colorado Boulder

/**
 * Defines the appearance of the radio buttons, see RadioButtonGroup.js. This file is designed to be used by
 * RadioButtonGroup and RadioButtonGroupMember internally, so you should not need use it outside of these files.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var sun = require( 'SUN/sun' );

  // constants
  var DISABLED_OPACITY = 0.3;

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
  var DefaultRadioButtonsAppearance = function( button, interactionStateProperty, baseColorProperty, options ) {

    // TODO: Changes were made to the appearance strategies to support dynamic changes of the base color, see
    // https://github.com/phetsims/sun/issues/138.  This feature has not yet been implemented in this appearance
    // strategy, please add it if you need it.
    function handleBaseColorChanged() {
      assert && assert( false, 'Dynamic base color not yet implemented in this appearance strategy.' );
    }

    baseColorProperty.lazyLink( handleBaseColorChanged );

    // Set up variables needed to create the various fills and strokes
    var baseColor = Color.toColor( baseColorProperty.value );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var deselectedStroke = Color.toColor( options.deselectedStroke );

    // Create the fills and strokes used for various button states
    var disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    var overStroke = options.overStroke ? options.overStroke : deselectedStroke.colorUtilsDarker( 0.4 );
    var overFill = options.overFill ? options.overFill : baseColor.colorUtilsBrighter( 0.4 );
    var pressedFill = baseColor.colorUtilsDarker( 0.4 );

    button.cachedPaints = [
      baseColor, overFill, disabledBaseColor, pressedFill,
      options.deselectedStroke, overStroke, options.selectedStroke, disabledStroke
    ];

    function handleInteractionStateChanged( state ) {
      switch( state ) {

        case 'deselected':
          button.fill = baseColor;
          button.stroke = options.deselectedStroke;
          button.lineWidth = options.deselectedLineWidth;
          button.opacity = options.deselectedButtonOpacity;
          break;

        // mouseover for deselected buttons
        case 'over':
          button.fill = overFill;
          button.stroke = overStroke;
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

        default:
          throw new Error( 'unsupported state: ' + state );
      }
    }

    interactionStateProperty.link( handleInteractionStateChanged );

    // add dispose function
    this.dispose = function() {
      baseColorProperty.unlink( handleBaseColorChanged );
      interactionStateProperty.unlink( handleInteractionStateChanged );
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
  var ContentAppearanceStrategy = function( content, interactionStateProperty, options ) {

    // The button is not the parent of the content, therefore it is necessary to set the opacity on the content separately
    function handleInteractionStateChanged( state ) {
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

          default:
            throw new Error( 'unsupported state: ' + state );
        }
      }
    }

    interactionStateProperty.link( handleInteractionStateChanged );

    // add a disposal function
    this.dispose = function() {
      interactionStateProperty.unlink( handleInteractionStateChanged );
    };
  };

  var RadioButtonGroupAppearance = {
    defaultRadioButtonsAppearance: DefaultRadioButtonsAppearance,
    contentAppearanceStrategy: ContentAppearanceStrategy
  };

  sun.register( 'RadioButtonGroupAppearance', RadioButtonGroupAppearance );

  return RadioButtonGroupAppearance;

} );