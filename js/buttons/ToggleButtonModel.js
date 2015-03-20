// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for a toggle button that changes value on each "up" event when the button is released.
 *
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonModel = require( 'SUN/buttons/ButtonModel' );

  /**
   * @param {Object} valueA one possible value for the toggle
   * @param {Object} valueB the other value for the toggle
   * @param {Property} valueProperty axon property that can be either valueA or valueB.
   *        (Would have preferred to call this `property` but it would clash with the property function name.)
   * @param {object} [options]
   * @constructor
   */
  function ToggleButtonModel( valueA, valueB, valueProperty, options ) {

    options = _.extend( {
      componentID: null
    }, options );

    var thisModel = this;

    this.componentID = options.componentID;

    this.valueA = valueA;
    this.valueB = valueB;
    this.valueProperty = valueProperty;

    ButtonModel.call( this );

    // Behaves like a push button (with fireOnDown:false), but toggles its state when the button is released.
    this.property( 'down' ).link( function( down ) {
      if ( thisModel.enabled && thisModel.over ) {
        if ( !down ) {
          thisModel.toggle();
        }
      }
    } );
  }

  return inherit( ButtonModel, ToggleButtonModel, {
    toggle: function() {
      assert && assert( this.valueProperty.value === this.valueA || this.valueProperty.value === this.valueB );
      var messageIndex = arch && arch.start( 'user', this.componentID, 'fire' );
      if ( this.valueProperty.value === this.valueA ) {
        this.valueProperty.value = this.valueB;
      }
      else {
        this.valueProperty.value = this.valueA;
      }
      arch && arch.end( messageIndex );
    }
  } );
} );