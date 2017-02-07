// Copyright 2014-2015, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property that can take on valueUp or valueDown.  It
 * sticks in the down position when pressed, popping back up when pressed
 * again.
 *
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var StickyToggleButtonInteractionStateProperty = require( 'SUN/buttons/StickyToggleButtonInteractionStateProperty' );
  var StickyToggleButtonModel = require( 'SUN/buttons/StickyToggleButtonModel' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  // phet-io modules
  var TToggleButton = require( 'ifphetio!PHET_IO/types/sun/buttons/TToggleButton' );

  /**
   * @param {Object} valueUp value when the toggle is in the 'up' position
   * @param {Object} valueDown value when the toggle is in the 'down' position
   * @param {Property} property axon property that can be either valueUp or valueDown.
   * @param {Object} [options]
   * @constructor
   */
  function RoundStickyToggleButton( valueUp, valueDown, property, options ) {

    options = _.extend( { tandem: Tandem.tandemRequired() }, options );

    var tandem = options.tandem;
    options.tandem = options.tandem.createSupertypeTandem();

    var buttonModel = new StickyToggleButtonModel( valueUp, valueDown, property );
    RoundButtonView.call( this, buttonModel, new StickyToggleButtonInteractionStateProperty( buttonModel ), options );

    tandem.addInstance( this, TToggleButton( property.phetioValueType ) );
  }

  sun.register( 'RoundStickyToggleButton', RoundStickyToggleButton, {

    // @public
    dispose: function() {
      //TODO implement this, see sun#212
    }
  } );

  return inherit( RoundButtonView, RoundStickyToggleButton );
} );