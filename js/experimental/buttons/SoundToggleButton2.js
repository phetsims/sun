// Copyright 2002-2014, University of Colorado Boulder

/**
 * Button for toggling sound on and off.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var ToggleButton2 = require( 'SUN/experimental/buttons/ToggleButton2' );

  var X_WIDTH = 12; // Empirically determined.

  function SoundToggleButton2( property, options ) {
    var soundOffNode = new Node();
    soundOffNode.addChild( new FontAwesomeNode( 'volume_off' ) );
    var soundOffX = new Path( new Shape().moveTo( 0, 0 ).lineTo( X_WIDTH, X_WIDTH ).moveTo( 0, X_WIDTH ).lineTo( X_WIDTH, 0 ),
      {
        stroke: 'black',
        lineWidth: 3,
        left: soundOffNode.width + 5,
        centerY: soundOffNode.centerY
      } );
    soundOffNode.addChild( soundOffX );

    ToggleButton2.call( this,
      new FontAwesomeNode( 'volume_up' ),
      soundOffNode,
      property,
      _.extend( { baseColor: new Color( 227, 233, 128 ) }, options ) );
  }

  inherit( ToggleButton2, SoundToggleButton2 );

  return SoundToggleButton2;
} );