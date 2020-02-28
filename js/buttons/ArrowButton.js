// Copyright 2016-2020, University of Colorado Boulder

/**
 * Button with one or more arrows that point up, down, left or right.
 * Press and release immediately and the button fires on 'up'.
 * Press and hold for M milliseconds and the button will fire repeatedly every N milliseconds until released.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Shape from '../../../kite/js/Shape.js';
import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import Path from '../../../scenery/js/nodes/Path.js';
import sun from '../sun.js';
import RectangularPushButton from './RectangularPushButton.js';

// constants
const DEFAULT_ARROW_HEIGHT = 20;

/**
 * @param {string} direction 'up'|'down'|'left'|'right'
 * @param {function} callback
 * @param {Object} [options]
 * @constructor
 */
function ArrowButton( direction, callback, options ) {

  options = merge( {

    // options for the button
    cursor: 'pointer',
    baseColor: 'white',
    stroke: 'black',
    lineWidth: 1,
    cornerRadius: 4,
    xMargin: 7,
    yMargin: 5,
    touchAreaXDilation: 7,
    touchAreaYDilation: 7,

    // options for the arrows
    arrowHeight: DEFAULT_ARROW_HEIGHT, // from tip to base
    arrowWidth: DEFAULT_ARROW_HEIGHT * Math.sqrt( 3 ) / 2, // width of base
    arrowFill: 'black',
    arrowStroke: null,
    arrowLineWidth: 1,
    numberOfArrows: 1, // each arrow will have the same shape and styling
    arrowSpacing: -DEFAULT_ARROW_HEIGHT * ( 1 / 2 ), // spacing for each arrow such that they overlap slightly

    // options related to fire-on-hold feature
    fireOnHold: true,
    fireOnHoldDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
    fireOnHoldInterval: 100, // fire continuously at this interval (milliseconds)

    // callbacks
    startCallback: _.noop, // {function()} called when the pointer is pressed
    endCallback: _.noop // {function(over:boolean)} called when the pointer is released, {boolean} over indicates whether the pointer was over when released

  }, options );
  options.listener = callback;

  // arrow node
  const arrowShape = new Shape();
  for ( let i = 0; i < options.numberOfArrows; i++ ) {

    // offset for the base of the arrow, shifting the shape of the arrow when there are more than one
    const arrowOffset = i * ( options.arrowHeight + options.arrowSpacing );
    if ( direction === 'up' ) {
      arrowShape.moveTo( options.arrowHeight / 2, arrowOffset ).lineTo( options.arrowHeight, options.arrowWidth + arrowOffset ).lineTo( 0, options.arrowWidth + arrowOffset ).close();
    }
    else if ( direction === 'down' ) {
      arrowShape.moveTo( 0, arrowOffset ).lineTo( options.arrowHeight, arrowOffset ).lineTo( options.arrowHeight / 2, options.arrowWidth + arrowOffset ).close();
    }
    else if ( direction === 'left' ) {
      arrowShape.moveTo( arrowOffset, options.arrowHeight / 2 ).lineTo( options.arrowWidth + arrowOffset, 0 ).lineTo( options.arrowWidth + arrowOffset, options.arrowHeight ).close();
    }
    else if ( direction === 'right' ) {
      arrowShape.moveTo( arrowOffset, 0 ).lineTo( options.arrowWidth + arrowOffset, options.arrowHeight / 2 ).lineTo( arrowOffset, options.arrowHeight ).close();
    }
    else {
      throw new Error( 'unsupported direction: ' + direction );
    }
  }

  options.content = new Path( arrowShape, {
    fill: options.arrowFill,
    stroke: options.arrowStroke,
    lineWidth: options.arrowLineWidth,
    pickable: false
  } );

  RectangularPushButton.call( this, options );
}

sun.register( 'ArrowButton', ArrowButton );

inherit( RectangularPushButton, ArrowButton );
export default ArrowButton;