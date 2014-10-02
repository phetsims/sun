// Copyright 2002-2013, University of Colorado Boulder

/**
 * Control panel around a content node.
 * Dynamically adjusts its size to fit its contents.
 *
 * @author Sam Reid
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {Node} content
   * @param {Object} [options]
   * @constructor
   */
  function Panel( content, options ) {

    var thisNode = this;

    // default options
    options = _.extend( {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1, // width of the background border
      xMargin: 5,
      yMargin: 5,
      cornerRadius: 10, // radius of the rounded corners on the background
      resize: true, // dynamically resize when content bounds change
      backgroundPickable: false
    }, options );

    Node.call( thisNode );

    // correct size will be set by updateBackground
    var background = new Rectangle( 0, 0, 1, 1, {
      lineWidth: options.lineWidth,
      pickable: options.backgroundPickable,
      lineDash: options.lineDash
    } );
    this.background = background;
    // update the fill and stroke
    this.setStroke( options.stroke );
    this.setFill( options.fill );

    this.addChild( background );
    this.addChild( content );

    // Adjust the background size to match the content.
    var updateBackground = function() {
      background.setRect( 0, 0, content.width + ( 2 * options.xMargin ), content.height + ( 2 * options.yMargin ), options.cornerRadius, options.cornerRadius );

      // Prevent oscillation and stack overflow due to numerical imprecision, see https://github.com/phetsims/sun/issues/110
      if ( background.center.distanceSquared( content.center ) > 1E-6 ) {
        content.center = background.center;
      }
    };
    if ( options.resize ) {
      content.addEventListener( 'bounds', function() {
        updateBackground();
      } );
    }
    updateBackground();

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    this.mutate( options );
  }

  inherit( Node, Panel, {

     // Change the background rectangle's stroke (can be overridden)
    setStroke: function( stroke ) {
      this.background.stroke = stroke;
    },

    // Get the background rectangle's stroke (can be overridden)
    getStroke: function() {
      return this.background.stroke;
    },

    // Getter/setter for background stroke
    set stroke( value ) { this.setStroke( value ); },
    get stroke() { return this.getStroke(); },


    // Change the background rectangle's fill (can be overridden)
    setFill: function( fill ) {
      this.background.fill = fill;
    },

    // Get the background rectangle's fill (can be overridden)
    getFill: function() {
      return this.background.fill;
    },

    // Getter/setter for background fill
    set fill( value ) { this.setFill( value ); },
    get fill() { return this.getFill(); }
  } );

  return Panel;
} );