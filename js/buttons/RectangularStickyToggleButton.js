// Copyright 2014-2017, University of Colorado Boulder

/**
 * A rectangular toggle button that switches the value of a property that can take on valueUp or valueDown.
 * It sticks in the down position when pressed, popping back up when pressed again.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var StickyToggleButtonInteractionStateProperty = require( 'SUN/buttons/StickyToggleButtonInteractionStateProperty' );
  var StickyToggleButtonModel = require( 'SUN/buttons/StickyToggleButtonModel' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} valueUp value when the toggle is in the 'up' position
   * @param {Object} valueDown value when the toggle is in the 'down' position
   * @param {Property} property axon property that can be either valueUp or valueDown.
   * @param {Object} [options]
   * @constructor
   */
  function RectangularStickyToggleButton( valueUp, valueDown, property, options ) {
    Tandem.indicateUninstrumentedCode();

    assert && assert( !options.phetioEventSource, 'phetioEventSource cannot be supplied in options' );
    var buttonModel = new StickyToggleButtonModel( valueUp, valueDown, property, _.extend( { phetioEventSource: this }, options ) );
    var stickyToggleButtonInteractionStateProperty = new StickyToggleButtonInteractionStateProperty( buttonModel );
    RectangularButtonView.call( this, buttonModel, stickyToggleButtonInteractionStateProperty, options );

    // @private
    this.disposeRectangularStickyToggleButton = function() {
      stickyToggleButtonInteractionStateProperty.dispose();
      buttonModel.dispose();
    };
  }

  sun.register( 'RectangularStickyToggleButton', RectangularStickyToggleButton );

  return inherit( RectangularButtonView, RectangularStickyToggleButton, {

    // @public
    dispose: function() {
      this.disposeRectangularStickyToggleButton();
      RectangularButtonView.prototype.dispose.call( this );
    }
  } );
} );