// Copyright 2015-2023, University of Colorado Boulder

/**
 * An iOS-style page control. See the 'Navigation' section of the iOS Human Interface Guidelines.
 * A page control indicates the number of pages and which one is currently visible.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TProperty from '../../axon/js/TProperty.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Circle, CircleOptions, FlowBox, LayoutOrientation, LayoutOrientationValues, Node, NodeOptions, PressListener, PressListenerEvent, TPaint } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../dot/js/Vector2.js';

type SelfOptions = {
  interactive?: boolean; // whether the control is interactive

  orientation?: LayoutOrientation;

  dotRadius?: number; // radius of the dots
  lineWidth?: number;
  dotSpacing?: number; // spacing between dots
  dotTouchAreaDilation?: number; // how much to dilate the touchArea beyond the radius of a dot
  dotMouseAreaDilation?: number; // how much to dilate the mouseArea beyond the radius of a dot

  // dots representing the current page
  currentPageFill?: TPaint;
  currentPageStroke?: TPaint;

  // dots representing all pages except the current page
  pageFill?: TPaint;
  pageStroke?: TPaint;
};

export type PageControlOptions = SelfOptions & StrictOmit<NodeOptions, 'children'>;

export default class PageControl extends Node {

  private readonly disposePageControl: () => void;

  /**
   * @param pageNumberProperty - which page is currently visible
   * @param numberOfPagesProperty - number of pages
   * @param providedOptions
   */
  public constructor( pageNumberProperty: TProperty<number>, numberOfPagesProperty: TReadOnlyProperty<number>, providedOptions?: PageControlOptions ) {

    const options = optionize<PageControlOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      interactive: false,
      orientation: 'horizontal',
      dotRadius: 3,
      lineWidth: 1,
      dotSpacing: 10,
      dotTouchAreaDilation: 4,
      dotMouseAreaDilation: 4,
      currentPageFill: 'black',
      currentPageStroke: null,
      pageFill: 'rgb( 200, 200, 200 )',
      pageStroke: null,

      // NodeOptions
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'PageControl',
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions );

    // validate options
    assert && assert( LayoutOrientationValues.includes( options.orientation ), `invalid orientation=${options.orientation}` );

    // Clicking on a dot goes to that page
    const pressListener = new PressListener( {
      press: ( event: PressListenerEvent ) => {
        if ( event.currentTarget instanceof DotNode ) {
          pageNumberProperty.value = event.currentTarget.pageNumber;
        }
      },
      tandem: options.tandem.createTandem( 'pressListener' )
    } );

    const dotOptions: CircleOptions = {
      lineWidth: options.lineWidth,
      mouseArea: ( options.dotMouseAreaDilation === 0 ) ? null : Shape.circle( 0, 0, options.dotRadius + options.dotMouseAreaDilation ),
      touchArea: ( options.dotTouchAreaDilation === 0 ) ? null : Shape.circle( 0, 0, options.dotRadius + options.dotTouchAreaDilation ),

      boundsMethod: 'unstroked', // For layout purposes, so we don't have to adjust spacings when things become stroked

      // optional interactivity
      cursor: options.interactive ? 'pointer' : null,
      inputListeners: options.interactive ? [ pressListener ] : []
    };

    const dotBox = new FlowBox( {
      orientation: options.orientation, // horizontal pages ordered left-to-right, vertical pages ordered top-to-bottom
      spacing: options.dotSpacing
    } );
    let dotNodes: DotNode[] = [];

    // Keep it centered
    dotBox.boundsProperty.link( () => { dotBox.center = Vector2.ZERO; } );

    // Dot fill/stroke
    const updateDotAppearance = ( pageNumber: number ) => {
      dotNodes.forEach( dotNode => {
        dotNode.fill = ( pageNumber === dotNode.pageNumber ) ? options.currentPageFill : options.pageFill;
        dotNode.stroke = ( pageNumber === dotNode.pageNumber ) ? options.currentPageStroke : options.pageStroke;
      } );
    };
    pageNumberProperty.link( updateDotAppearance );

    // Recreate the dots when the number of pages changes
    const recreateDotNodes = ( numberOfPages: number ) => {
      assert && assert( numberOfPages >= 1 );

      dotNodes = _.range( 0, numberOfPages ).map( pageNumber => new DotNode( pageNumber, options.dotRadius, dotOptions ) );
      dotBox.children = dotNodes;
      updateDotAppearance( pageNumberProperty.value ); // since they are recreated, update their appearance
    };
    numberOfPagesProperty.link( recreateDotNodes );

    options.children = [ dotBox ];

    super( options );

    this.disposePageControl = () => {
      pressListener.dispose();
      numberOfPagesProperty.unlink( recreateDotNodes );
      pageNumberProperty.unlink( updateDotAppearance );
    };
  }

  public override dispose(): void {
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

  public constructor( pageNumber: number, radius: number, options: CircleOptions ) {
    super( radius, options );

    this.pageNumber = pageNumber;
  }
}

sun.register( 'PageControl', PageControl );