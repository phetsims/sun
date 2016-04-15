// Copyright 2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Property = require( 'AXON/Property' );
  var HSlider = require( 'SUN/HSlider' );
  var ABSwitch = require( 'SUN/ABSwitch' );
  var Text = require( 'SCENERY/nodes/Text' );

  var sun = require( 'SUN/sun' );

  function ComponentHolder( createFunction ) {
    var componentHolder = this;
    this.dispose = function() {
      componentHolder.instance.dispose();
    };
    this.create = function() {
      componentHolder.instance = createFunction();
    };
  }

  var numberProperty = new Property( 0 );
  var booleanProperty = new Property( false );

  var components = [
    new ComponentHolder( function() {
      return new HSlider( numberProperty, { min: 0, max: 10 } );
    } ),
    new ComponentHolder( function() {
      return new ABSwitch( booleanProperty, true, new Text( 'true' ), false, new Text( 'false' ) );
    } )
  ];

  function MemoryTestsView() {
    ScreenView.call( this );
  }

  sun.register( 'MemoryTestsView', MemoryTestsView );

  return inherit( ScreenView, MemoryTestsView, {
    step: function() {

      for ( var i = 0; i < components.length; i++ ) {
        var holder = components[ i ];

        // dispose first, then remove so they will be visible on the screen during animation.
        holder.instance && this.removeChild( holder.instance );
        holder.instance && holder.dispose();

        holder.create();
        this.addChild( holder.instance );
      }
      console.log( 'create' );
    }
  } );
} );