// Copyright 2016-2018, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ABSwitch = require( 'SUN/ABSwitch' );
  var BooleanToggleNode = require( 'SUN/BooleanToggleNode' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var sun = require( 'SUN/sun' );
  var Text = require( 'SCENERY/nodes/Text' );

  function ComponentHolder( createFunction ) {
    var self = this;
    this.dispose = function() {
      self.instance.dispose();
    };
    this.create = function() {
      self.instance = createFunction();
    };
  }

  var numberProperty = new Property( 0 );
  var booleanProperty = new Property( false );

  var components = [
    new ComponentHolder( function() {
      return new HSlider( numberProperty, new Range( 0, 10 ) );
    } ),
    new ComponentHolder( function() {
      return new ABSwitch( booleanProperty, true, new Text( 'true' ), false, new Text( 'false' ) );
    } ),
    new ComponentHolder( function() {
      return new BooleanToggleNode( new Text( 'true' ), new Text( 'false' ), booleanProperty );
    } )
  ];

  /**
   * @constructor
   */
  function MemoryTestsScreenView() {
    ScreenView.call( this );
  }

  sun.register( 'MemoryTestsScreenView', MemoryTestsScreenView );

  return inherit( ScreenView, MemoryTestsScreenView, {
    step: function() {

      for ( var i = 0; i < components.length; i++ ) {
        var holder = components[ i ];

        // dispose first, then create and add at the end of the loop so components will be visible on the screen during
        // animation.
        holder.instance && this.removeChild( holder.instance );
        holder.instance && holder.dispose();

        holder.create();
        this.addChild( holder.instance );
      }
      console.log( 'create' );
    }
  } );
} );