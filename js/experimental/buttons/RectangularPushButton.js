// Copyright 2002-2014, University of Colorado Boulder

/**
 * A very basic rectangular button.  While it is possible to use this type
 * directly to create buttons in a simulation, it is more intended as a base
 * type.
 */
define( function( require ) {
  'use strict';

  // Imports
  var AbstractButton = require( 'SUN/experimental/buttons/AbstractButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * Constructs a standard PhET rectangular push button.
   *
   * @param {Node} content - Scenery node that will be placed on the button, e.g. a text node.
   * @param {function} callback
   * @param {Object} options
   * @constructor
   */
  function RectangularPushButton( content, callback, options ) {
    options = _.extend(
      {
        // Defaults
        cursor: 'pointer',
        cornerRadius: 4,
        xMargin: 5,
        yMargin: 5,
        touchAreaExpansionFactor: 1.3,
        baseColor: 'rgb( 179, 218, 255 )', // TODO: Discuss if preference for Color, rgb strings, or handling of either.
        disabledBaseColor: 'rgb( 220, 220, 220 )',
        outlineWidth: 2
      }, options );

    var buttonNode = new Rectangle( 0, 0, content.width + options.xMargin * 2, content.height + options.yMargin * 2,
      options.cornerRadius, options.cornerRadius,
      {
        fill: options.baseColor
      } );
    content.centerX = buttonNode.width / 2;
    content.centerY = buttonNode.height / 2;
    buttonNode.addChild( content );

    // Invoke the superconstructor.
    AbstractButton.call( this, buttonNode, callback, options );

    // Monitor the properites in the base type and update the button
    // appearance accordingly.
    this.over.link( function( over ) {
      buttonNode.fill = over ? 'red' : options.baseColor;
      console.log( "over changed" );
    } );
  }

  return inherit( AbstractButton, RectangularPushButton, {
    //TODO prototypes
  } );
} );