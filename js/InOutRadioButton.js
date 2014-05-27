// Copyright 2002-2013, University of Colorado Boulder

/**
 * Radio button that looks pressed in or popped out.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var RadioButton = require( 'SUN/RadioButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param property
   * @param value the value that corresponds to this button, same type as property
   * @param {Node} content node that will be displayed on the button
   * @param {object} options
   * @constructor
   */
  function InOutRadioButton( property, value, content, options ) {

    options = _.extend( {
      motionXOffset: 2,
      motionYOffset: 2,
      shadowXOffset: 4,
      shadowYOffset: 4,
      cornerRadius: 10,
      shadowFill: 'black',
      xMargin: 5,
      yMargin: 5,
      stroke: 'black'
    }, options );

    // put content in a rounded rectangle
    var pressed = new Panel( content,
      {
        xMargin: options.xMargin,
        yMargin: options.yMargin,
        cornerRadius: options.cornerRadius,
        stroke: options.stroke
      } );
    var upButton = new Panel( content,
      {
        xMargin: options.xMargin,
        yMargin: options.yMargin,
        cornerRadius: options.cornerRadius,
        stroke: options.stroke
      } );

    // make the button appear to move
    upButton.x = -options.motionXOffset;
    upButton.y = -options.motionYOffset;

    // add a drop shadow to the unpressed state
    var unpressed = new Node( {children: [
      new Rectangle( upButton.x + options.shadowXOffset, upButton.y + options.shadowYOffset, upButton.width, upButton.height, options.cornerRadius, options.cornerRadius, { fill: options.shadowFill } ),
      upButton
    ]} );

    RadioButton.call( this, property, value, pressed, unpressed );
  }

  return inherit( RadioButton, InOutRadioButton );
} );