// Copyright 2002-2014, University of Colorado Boulder

/**
 * A rectangular push button.  This is the file in which the appearance
 * and behavior are brought together.
 *
 * This class inherits from RectangularButtonView, which contains all of the
 * code that defines the button's appearance, and adds the button's behavior
 * by hooking up a button model.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/experimental/buttons/RectangularButtonView' );
  var PushButtonModel = require( 'SUN/experimental/buttons/PushButtonModel' );

  /**
   * @param {Node} content - Node to put on surface of button, could be text, icon, or whatever
   * @param {Object} options
   * @constructor
   */
  function RectangularPushButton( content, options ) {

    options = _.extend( {content: content}, options );

    // Safe to pass through options to the pushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    RectangularButtonView.call( this, new PushButtonModel( options ), options );
  }

  return inherit( RectangularButtonView, RectangularPushButton );
} );