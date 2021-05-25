// Copyright 2013-2021, University of Colorado Boulder

/**
 * Control panel around a content node.
 * Dynamically adjusts its size to fit its contents.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../phet-core/js/merge.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

// valid values for options.align
const ALIGN_VALUES = [ 'left', 'center', 'right' ];

const DEFAULT_OPTIONS = {
  fill: 'white',
  stroke: 'black',
  lineWidth: 1, // width of the background border
  xMargin: 5,
  yMargin: 5,
  cornerRadius: 10, // radius of the rounded corners on the background
  resize: true, // dynamically resize when content bounds change
  backgroundPickable: false,

  excludeInvisibleChildrenFromBounds: true,

  // {string} horizontal alignment of content in the pane, see ALIGN_VALUES
  // All alignments are equal when the content width >= minWidth
  // Left is the default alignment so when there are multiple panels, their content will left align, see #252
  align: 'left',

  minWidth: 0, // minimum width of the panel
  tandem: Tandem.OPTIONAL
};
assert && Object.freeze( DEFAULT_OPTIONS );

class Panel extends Node {

  /**
   * @param {Node} content
   * @param {Object} [options]
   */
  constructor( content, options ) {

    options = merge( {}, DEFAULT_OPTIONS, options );

    assert && assert( _.includes( ALIGN_VALUES, options.align ), `invalid align: ${options.align}` );

    super();

    const backgroundContainer = new Node();

    // @private {Rectangle} - correct size will be set by updateBackground
    this.background = new Rectangle( 0, 0, 1, 1, {
      lineWidth: options.lineWidth,
      pickable: options.backgroundPickable,
      lineDash: options.lineDash,
      cornerRadius: options.cornerRadius
    } );

    // update the fill and stroke
    this.setStroke( options.stroke );
    this.setFill( options.fill );

    this.addChild( backgroundContainer );
    this.addChild( content );

    // flag for preventing recursion
    let backgroundUpdateInProgress = false;

    // Adjust the background size to match the content.
    const updateBackground = () => {

      // Check that an update isn't already in progress, lest we end up with some nasty recursion.  For details, please
      // see https://github.com/phetsims/sun/issues/110 and https://github.com/phetsims/molecule-shapes/issues/130.
      if ( backgroundUpdateInProgress ) {
        return;
      }

      const hasValidContent = this.isChildIncludedInLayout( content );
      backgroundContainer.children = hasValidContent ? [ this.background ] : [];
      if ( !hasValidContent ) {
        // Bail out (and make the background invisible) if our bounds are invalid
        return;
      }

      backgroundUpdateInProgress = true;

      // size the background to fit the content
      const backgroundWidth = Math.max( options.minWidth, content.width + ( 2 * options.xMargin ) );
      this.background.setRect( 0, 0, backgroundWidth, content.height + ( 2 * options.yMargin ) );

      // Align the content within the background. If the content width >= minWidth, then all alignments are equivalent.
      if ( options.align === 'center' ) {
        content.center = this.background.center;
      }
      else if ( options.align === 'left' ) {

        // Use backgroundWidth instead of background.width because they differ by the background lineWidth
        content.left = this.background.centerX - backgroundWidth / 2 + options.xMargin;
        content.centerY = this.background.centerY;
      }
      else { /* right */

        // Use backgroundWidth instead of background.width because they differ by the background lineWidth
        content.right = this.background.centerX + backgroundWidth / 2 - options.xMargin;
        content.centerY = this.background.centerY;
      }

      // clear the recursion-prevention flag
      backgroundUpdateInProgress = false;
    };

    if ( options.resize ) {
      content.boundsProperty.lazyLink( updateBackground );
      content.visibleProperty.lazyLink( updateBackground );
    }
    updateBackground();

    // @private
    this.disposePanel = () => {
      if ( options.resize ) {
        content.boundsProperty.unlink( updateBackground );
        content.visibleProperty.unlink( updateBackground );
      }
    };

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    this.mutate( options );
  }

  get stroke() { return this.getStroke(); }

  set stroke( value ) { this.setStroke( value ); }

  set fill( value ) { this.setFill( value ); }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposePanel();
    super.dispose();
  }

  // @public - Change the background rectangle's stroke (can be overridden)
  setStroke( stroke ) {
    this.background.stroke = stroke;
  }

  // @public - Get the background rectangle's stroke (can be overridden)
  getStroke() {
    return this.background.stroke;
  }

  // @public - Change the background rectangle's fill (can be overridden)
  setFill( fill ) {
    this.background.fill = fill;
  }

  // @public - Get the background rectangle's fill (can be overridden)
  getFill() {
    return this.background.fill;
  }

  get fill() { return this.getFill(); }
}

// @public (read-only)
Panel.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

sun.register( 'Panel', Panel );
export default Panel;