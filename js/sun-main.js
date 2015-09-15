// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main file for the Sun library demo.
 */
define( function( require ) {
  'use strict';

  // Imports
  var ButtonsDemoView = require( 'SUN/demo/ButtonsDemoView' );
  var ComponentsView = require( 'SUN/demo/ComponentsView' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // Strings
  var title = require( 'string!SUN/sun.title' );

  var simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  var createScreenIcon = function( color ) { return new Rectangle( 0, 0, 147, 100, { fill: color } ); };

  var backgroundColor = phet.chipper.getQueryParameter( 'backgroundColor' ) || 'white';

  SimLauncher.launch( function() {
    new Sim( title, [
      new Screen( 'Buttons',
        createScreenIcon( 'red' ),
        function() {return {};},
        function( model ) {return new ButtonsDemoView();},
        { backgroundColor: backgroundColor }
      ),
      new Screen( 'Components',
        createScreenIcon( 'yellow' ),
        function() {return {};},
        function( model ) {return new ComponentsView();},
        { backgroundColor: backgroundColor }
      )
    ], simOptions ).start();
  } );
} );
