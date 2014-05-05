// Copyright 2002-2013, University of Colorado Boulder

/**
 * Radio button that looks pressed in or popped out.
 *
 * TODO: Implement me
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var InOutRadioButtonView = require( 'SUN/buttons/InOutRadioButtonView' );

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

//    this.buttonModel = new PushButtonModel( { } );
//    this.addInputListener( this.buttonModel );
  }

  return inherit( InOutRadioButtonView, InOutRadioButton );
} );