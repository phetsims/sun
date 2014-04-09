// Copyright 2002-2014, University of Colorado Boulder

/**
 * An interactive round push button.  This is the file in which the appearance
 * and behavior are brought together.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var RoundButtonView = require( 'SUN/experimental/buttons/RoundButtonView' );
  var PushButtonModel = require( 'SUN/experimental/buttons/PushButtonModel' );
  var ButtonListener = require( 'SUN/experimental/buttons/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Node} content - Node to put on surface of button, could be text, icon, or whatever
   * @param {Object} options
   * @constructor
   */
  function RoundPushButton( content, options ) {

    options = _.extend( {content: content}, options );

    //Safe to pass through options to the pushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    var buttonModel = new PushButtonModel( options );
    RoundButtonView.call( this, buttonModel, options );
    this.addInputListener( new ButtonListener( buttonModel ) );
  }

  return inherit( RoundButtonView, RoundPushButton );
} );