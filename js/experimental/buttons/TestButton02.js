// Copyright 2002-2014, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/experimental/buttons/RectangularPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );

  function TestButton02( options ) {
    RectangularPushButton.call( this, function() { console.log( 'TestButton02 pushed' );}, new Text( 'You\'re pushing it...', { fill: 'white'} ), options );
  }

  return inherit( RectangularPushButton, TestButton02 );
} );