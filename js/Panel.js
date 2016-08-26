// Copyright 2013-2015, University of Colorado Boulder

/**
 * Control panel around a content node.
 * Dynamically adjusts its size to fit its contents.
 *
 * @author Sam Reid
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var sun = require( 'SUN/sun' );

  // phet-io modules
  var TPanel = require( 'ifphetio!PHET_IO/types/sun/TPanel' );

  // valid values for options.align
  var ALIGN_VALUES = [ 'left', 'center', 'right' ];

  var DEFAULT_OPTIONS = {
    fill: 'white',
    stroke: 'black',
    lineWidth: 1, // width of the background border
    xMargin: 5,
    yMargin: 5,
    cornerRadius: 10, // radius of the rounded corners on the background
    resize: true, // dynamically resize when content bounds change
    backgroundPickable: false,
    align: 'left', // {string} horizontal alignment of content in the pane, see ALIGN_VALUES
    minWidth: 0, // minimum width of the panel
    tandem: null
  };
  assert && Object.freeze( DEFAULT_OPTIONS );

  /**
   * @param {Node} content
   * @param {Object} [options]
   * @constructor
   */
  function Panel( content, options ) {

    var thisNode = this;

    options = _.extend( {}, DEFAULT_OPTIONS, options );
    assert && assert( _.contains( ALIGN_VALUES, options.align ), 'invalid align: ' + options.align );

    Node.call( thisNode );

    // correct size will be set by updateBackground
    var background = new Rectangle( 0, 0, 1, 1, {
      lineWidth: options.lineWidth,
      pickable: options.backgroundPickable,
      lineDash: options.lineDash
    } );
    this.background = background; // @private
    // update the fill and stroke
    this.setStroke( options.stroke );
    this.setFill( options.fill );

    this.addChild( background );
    this.addChild( content );

    // flag for preventing recursion
    var backgroundUpdateInProgress = false;

    // Adjust the background size to match the content.
    var updateBackground = function() {

      // Check that an update isn't already in progress, lest we end up with some nasty recursion.  For details, please
      // see https://github.com/phetsims/sun/issues/110 and https://github.com/phetsims/molecule-shapes/issues/130.
      if ( backgroundUpdateInProgress ) {
        return;
      }

      // Bail out (and make the background invisible) if our bounds are invalid
      background.visible = content.bounds.isValid();
      if ( !background.visible ) {
        return;
      }

      backgroundUpdateInProgress = true;

      // size the background to fit the content
      var backgroundWidth = Math.max( options.minWidth, content.width + ( 2 * options.xMargin ) );
      background.setRect( 0, 0, backgroundWidth, content.height + ( 2 * options.yMargin ), options.cornerRadius, options.cornerRadius );

      // Align the content within the background. If the content width < minWidth, then all alignments are equivalent.
      if ( options.align === 'center' ) {
        content.center = background.center;
      }
      else if ( options.align === 'left' ) {

        // Use backgroundWidth instead of background.width because they differ by the background lineWidth
        content.left = background.centerX - backgroundWidth / 2 + options.xMargin;
        content.centerY = background.centerY;
      }
      else { /* right */

        // Use backgroundWidth instead of background.width because they differ by the background lineWidth
        content.right = background.centerX + backgroundWidth / 2 - options.xMargin;
        content.centerY = background.centerY;
      }

      // clear the recursion-prevention flag
      backgroundUpdateInProgress = false;
    };

    if ( options.resize ) {
      content.addEventListener( 'bounds', function() {
        updateBackground();
      } );
    }
    updateBackground();

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    this.mutate( options );

    options.tandem && options.tandem.addInstance( this, TPanel );
  }

  sun.register( 'Panel', Panel );

  inherit( Node, Panel, {

    // @public - Change the background rectangle's stroke (can be overridden)
    setStroke: function( stroke ) {
      this.background.stroke = stroke;
    },

    // @public - Get the background rectangle's stroke (can be overridden)
    getStroke: function() {
      return this.background.stroke;
    },

    // @public - Getter/setter for background stroke
    set stroke( value ) { this.setStroke( value ); },
    get stroke() { return this.getStroke(); },

    // @public - Change the background rectangle's fill (can be overridden)
    setFill: function( fill ) {
      this.background.fill = fill;
    },

    // @public - Get the background rectangle's fill (can be overridden)
    getFill: function() {
      return this.background.fill;
    },

    // @public - Getter/setter for background fill
    set fill( value ) { this.setFill( value ); },
    get fill() { return this.getFill(); }
  }, {

    // @static @public (read-only)
    DEFAULT_OPTIONS: DEFAULT_OPTIONS
  } );

  return Panel;
} );