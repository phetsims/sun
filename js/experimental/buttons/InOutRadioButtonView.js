// Copyright 2002-2014, University of Colorado Boulder

/**
 * View part of an InOutRadioButton, not wired up for listening to input events.
 * Normally the InOutRadioButton which is wired up for listening to input events.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Panel = require( 'SUN/Panel' );

  function InOutRadioButtonView( contentNode, booleanProperty, options ) {
    options = _.extend( {
      xMargin: 5,
      yMargin: 5,
      shadowOffsetX: 4,
      shadowOffsetY: 4
    }, options );

    var buttonPanel = new Panel( contentNode, {
      xMargin: options.xMargin,
      yMargin: options.yMargin
    } );
    var shadow = new Panel( new Rectangle( 0, 0, contentNode.width, contentNode.height ), {
      fill: 'black',
      stroke: null,
      x: options.shadowOffsetX,
      y: options.shadowOffsetY,
      xMargin: options.xMargin,
      yMargin: options.yMargin
    } );

    Node.call( this, options );
    this.addChild( shadow );
    this.addChild( buttonPanel );
  }

  return inherit( Node, InOutRadioButtonView );
} );
