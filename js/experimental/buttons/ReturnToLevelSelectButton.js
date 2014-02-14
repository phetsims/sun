// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base type for a button with a s
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Includes
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RaisedEdgesButton = require( 'SUN/experimental/buttons/RaisedEdgesButton' );
  var Rectangle = require( 'SCENERY/nodes/rectangle' );

  // Constants
  var DEFAULT_WIDTH = 80;

  /**
   * @param {function} callback
   * @param {Object} options
   * @constructor
   */
  function ReturnToLevelSelectButton( callback, options ) {
    options = _.extend( {
      width: DEFAULT_WIDTH
    }, options );

    var root = new Node();
    for ( var i = 0; i < 3; i++ ) {
      var iconWidth = options.width * 0.25;
      var icon = new Rectangle( 0, 0, iconWidth, iconWidth, 2, 2, { fill: 'white', stroke: 'black', lineWidth: 1.5 } );
      icon.addChild( new Rectangle( 0, 0, iconWidth, iconWidth * 0.2, 4, 4,
        {
          fill: 'black',
          stroke: 'black',
          bottom: iconWidth
        } ) );
      icon.left = iconWidth * i * 1.2;
      root.addChild( icon );
    }

    options.xMargin = 7;
    options.yMargin = 7;
    RaisedEdgesButton.call( this, callback, root, options );
  }

  return inherit( RaisedEdgesButton, ReturnToLevelSelectButton );
} );