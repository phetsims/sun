// Copyright 2015-2022, University of Colorado Boulder

/**
 * An iOS-style page control. See the 'Navigation' section of the iOS Human Interface Guidelines.
 * A page control indicates the number of pages and which one is currently visible.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import IProperty from '../../axon/js/IProperty.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Circle, CircleOptions, IColor, Node, NodeOptions, PressListener, PressListenerEvent } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

type SelfOptions = {
  interactive?: boolean; // {boolean} whether the control is interactive

  // all dots
  orientation?: 'horizontal' | 'vertical';
  dotRadius?: number; // {number} radius of the dots
  lineWidth?: number;
  dotSpacing?: number; // {number} spacing between dots
  dotTouchAreaDilation?: number; // {number} how much to dilate the touchArea beyond the radius of a dot
  dotMouseAreaDilation?: number; // {number} how much to dilate the mouseArea beyond the radius of a dot

  // dots representing the current page
  currentPageFill?: IColor;
  currentPageStroke?: IColor;

  // dots representing all pages except the current page
  pageFill?: IColor;
  pageStroke?: IColor;
};

export type PageControlOptions = SelfOptions & Omit<NodeOptions, 'children'>;

class PageControl extends Node {

  private readonly disposePageControl: () => void;

  /**
   * @param numberOfPages - number of pages
   * @param pageNumberProperty - which page is currently visible
   * @param providedOptions
   */
  constructor( numberOfPages: number, pageNumberProperty: IProperty<number>, providedOptions: PageControlOptions ) {

    const options = optionize<PageControlOptions, SelfOptions, NodeOptions, 'tandem'>( {

      // SelfOptions
      interactive: false,
      orientation: 'horizontal',
      dotRadius: 3,
      lineWidth: 1,
      dotSpacing: 10,
      dotTouchAreaDilation: 0,
      dotMouseAreaDilation: 0,
      currentPageFill: 'black',
      currentPageStroke: null,
      pageFill: 'rgb( 200, 200, 200 )',
      pageStroke: null,

      // NodeOptions
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // validate options
    assert && assert( _.includes( [ 'horizontal', 'vertical' ], options.orientation ), `invalid orientation=${options.orientation}` );

    // To improve readability
    const isHorizontal = ( options.orientation === 'horizontal' );

    // Clicking on a dot goes to that page
    const pressListener = new PressListener( {
      press: ( event: PressListenerEvent ) => {
        if ( event.currentTarget instanceof DotNode ) {
          pageNumberProperty.value = event.currentTarget.pageNumber;
        }
      },
      tandem: options.tandem.createTandem( 'pressListener' )
    } );

    // Create a dot for each page.
    // For horizontal orientation, pages are ordered left-to-right.
    // For vertical orientation, pages are ordered top-to-bottom.
    const dotNodes: DotNode[] = [];
    for ( let pageNumber = 0; pageNumber < numberOfPages; pageNumber++ ) {

      // dot
      const dotCenter = ( pageNumber * ( 2 * options.dotRadius + options.dotSpacing ) );
      const dotNode = new DotNode( pageNumber, options.dotRadius, {
        fill: options.pageFill,
        stroke: options.pageStroke,
        lineWidth: options.lineWidth,
        x: isHorizontal ? dotCenter : 0,
        y: isHorizontal ? 0 : dotCenter
      } );
      dotNodes.push( dotNode );

      // pointer areas
      dotNode.touchArea = ( options.dotTouchAreaDilation === 0 ) ? null : Shape.circle( 0, 0, options.dotRadius + options.dotTouchAreaDilation );
      dotNode.mouseArea = ( options.dotMouseAreaDilation === 0 ) ? null : Shape.circle( 0, 0, options.dotRadius + options.dotMouseAreaDilation );

      // optional interactivity
      if ( options.interactive ) {
        dotNode.cursor = 'pointer';
        dotNode.addInputListener( pressListener );
      }
    }

    // Indicate which page is selected
    const pageNumberObserver = ( pageNumber: number, oldPageNumber: number | null ) => {

      // previous dot
      if ( oldPageNumber !== null ) {
        dotNodes[ oldPageNumber ].fill = options.pageFill;
        dotNodes[ oldPageNumber ].stroke = options.pageStroke;
      }

      // current dot
      dotNodes[ pageNumber ].fill = options.currentPageFill;
      dotNodes[ pageNumber ].stroke = options.currentPageStroke;
    };
    pageNumberProperty.link( pageNumberObserver );

    assert && assert( !options.children, 'PageControl sets children' );
    options.children = dotNodes;

    super( options );

    // @private
    this.disposePageControl = () => {
      pageNumberProperty.unlink( pageNumberObserver );
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposePageControl();
    super.dispose();
  }
}

/**
 * One of the dots in the page control, with an associated page number.
 */
class DotNode extends Circle {

  // the page number associated with this dot
  public readonly pageNumber: number;

  /**
   * @param {number} pageNumber - page number that the dot is associated with
   * @param {number} radius
   * @param {Object} [options]
   */
  constructor( pageNumber: number, radius: number, options: CircleOptions ) {
    super( radius, options );
    this.pageNumber = pageNumber; // @public (read-only)
  }
}

sun.register( 'PageControl', PageControl );
export default PageControl;