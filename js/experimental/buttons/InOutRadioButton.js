// Copyright 2002-2013, University of Colorado Boulder

/**
 * Radio button that looks pressed in or popped out.
 */
define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var RadioButton = require( 'SUN/RadioButton' );
  var InOutRadioButtonView = require( 'SUN/experimental/buttons/InOutRadioButtonView' );
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
      cursor: 'pointer'
    }, options );
    InOutRadioButtonView.call( this, content, property.valueEquals( value ), options );
  }

  return inherit( InOutRadioButtonView, InOutRadioButton );
} );