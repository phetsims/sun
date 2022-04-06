// Copyright 2013-2022, University of Colorado Boulder

/**
 * Control panel around a content node.
 * Dynamically adjusts its size to fit its contents.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco (PhET Interactive Simulations)
 */

import optionize from '../../phet-core/js/optionize.js';
import { HeightSizable, HeightSizableSelfOptions, IPaint, isHeightSizable, isWidthSizable, NodeOptions, WidthSizableSelfOptions } from '../../scenery/js/imports.js';
import { LayoutConstraint } from '../../scenery/js/imports.js';
import { WidthSizable } from '../../scenery/js/imports.js';
import { Node } from '../../scenery/js/imports.js';
import { Rectangle } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

// valid values for options.align
const ALIGN_VALUES = [ 'left', 'center', 'right' ] as const;

export type PanelAlign = typeof ALIGN_VALUES[number];

const DEFAULT_OPTIONS = {
  fill: 'white',
  stroke: 'black',
  lineWidth: 1,
  xMargin: 5,
  yMargin: 5,
  cornerRadius: 10,
  resize: true,
  backgroundPickable: true,
  excludeInvisibleChildrenFromBounds: true,
  align: 'left',
  minWidth: 0,
  tandem: Tandem.OPTIONAL
} as const;
assert && Object.freeze( DEFAULT_OPTIONS );

type SelfOptions = {
  fill?: IPaint;
  stroke?: IPaint;

  // width of the background border
  lineWidth?: number;

  xMargin?: number;
  yMargin?: number;

  // radius of the rounded corners on the background
  cornerRadius?: number;

  // dynamically resize when content bounds change
  resize?: boolean;

  backgroundPickable?: boolean;

  // horizontal alignment of content in the pane, see ALIGN_VALUES
  // All alignments are equal when the content width >= minWidth
  // Left is the default alignment so when there are multiple panels, their content will left align, see #252
  align?: PanelAlign;

  // minimum width of the panel (lineWidth will add to this)
  minWidth?: number;
};

type SuperOptions = WidthSizableSelfOptions & HeightSizableSelfOptions & NodeOptions;
export type PanelOptions = SelfOptions & SuperOptions;

export default class Panel extends WidthSizable( HeightSizable( Node ) ) {

  _content: Node; // (internal)
  _backgroundContainer: Node; // (internal)
  background: Rectangle; // (internal)
  private _constraint: PanelConstraint;

  constructor( content: Node, providedOptions?: PanelOptions ) {

    const options = optionize<PanelOptions, SelfOptions, SuperOptions>( {}, DEFAULT_OPTIONS, providedOptions );

    assert && assert( _.includes( ALIGN_VALUES, options.align ), `invalid align: ${options.align}` );

    super();

    this._content = content;
    this._backgroundContainer = new Node();

    // correct size will be set by layout
    this.background = new Rectangle( 0, 0, 1, 1, {
      lineWidth: options.lineWidth,
      pickable: options.backgroundPickable,
      lineDash: options.lineDash,
      cornerRadius: options.cornerRadius
    } );

    // update the fill and stroke (before layout)
    this.setStroke( options.stroke );
    this.setFill( options.fill );

    this.addChild( this._backgroundContainer );
    this.addChild( content );

    this._constraint = new PanelConstraint( this, options );
    this._constraint.updateLayout();

    // Don't update automatically if resize:false
    this._constraint.enabled = options.resize;

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    this.mutate( options );
  }

  /**
   * Get the background rectangle's stroke (can be overridden)
   */
  getStroke(): IPaint {
    return this.background.stroke;
  }

  get stroke(): IPaint { return this.getStroke(); }

  /**
   * Change the background rectangle's stroke (can be overridden)
   */
  setStroke( stroke: IPaint ) {
    this.background.stroke = stroke;
  }

  set stroke( value: IPaint ) { this.setStroke( value ); }

  /**
   * Get the background rectangle's fill (can be overridden)
   */
  getFill(): IPaint {
    return this.background.fill;
  }

  get fill(): IPaint { return this.getFill(); }

  /**
   * Change the background rectangle's fill (can be overridden)
   */
  setFill( fill: IPaint ) {
    this.background.fill = fill;
  }

  set fill( value: IPaint ) { this.setFill( value ); }

  override setExcludeInvisibleChildrenFromBounds( excludeInvisibleChildrenFromBounds: boolean ) {
    super.setExcludeInvisibleChildrenFromBounds( excludeInvisibleChildrenFromBounds );

    this._constraint.updateLayoutAutomatically();
  }

  public override dispose(): void {
    this._constraint.dispose();
    super.dispose();
  }

  static override DEFAULT_OPTIONS = DEFAULT_OPTIONS;
}

class PanelConstraint extends LayoutConstraint {

  private panel: Panel;
  private minWidth: number;
  private xMargin: number;
  private yMargin: number;
  private lineWidth: number;
  private align: PanelAlign;

  constructor( panel: Panel, options: Required<SelfOptions> ) {
    super( panel );

    this.panel = panel;

    assert && assert( typeof options.minWidth === 'number', 'Panel minWidth should be a number' );
    assert && assert( typeof options.xMargin === 'number', 'Panel xMargin should be a number' );
    assert && assert( typeof options.yMargin === 'number', 'Panel yMargin should be a number' );
    assert && assert( typeof options.lineWidth === 'number', 'Panel lineWidth should be a number' );
    assert && assert( ALIGN_VALUES.includes( options.align ), `Panel align should be one of ${ALIGN_VALUES}` );

    this.minWidth = options.minWidth;
    this.xMargin = options.xMargin;
    this.yMargin = options.yMargin;
    this.lineWidth = options.lineWidth;
    this.align = options.align;

    this.panel.preferredWidthProperty.lazyLink( this._updateLayoutListener );
    this.panel.preferredHeightProperty.lazyLink( this._updateLayoutListener );

    this.addNode( panel._content );
  }

  protected override layout(): void {
    super.layout();

    const panel = this.panel;
    const content = panel._content;
    const background = panel.background;

    const hasValidContent = panel.isChildIncludedInLayout( content );
    panel._backgroundContainer.children = hasValidContent ? [ background ] : [];

    if ( !hasValidContent ) {
      // Bail out (and make the background invisible) if our bounds are invalid
      panel.minimumWidth = null;
      panel.minimumHeight = null;
      return;
    }

    const contentWidth = ( isWidthSizable( content ) && content.minimumWidth !== null ) ? content.minimumWidth : content.width;
    const contentHeight = ( isHeightSizable( content ) && content.minimumHeight !== null ) ? content.minimumHeight : content.height;

    // Our minimum dimensions are directly determined by the content, margins and lineWidth
    // NOTE: options.minWidth does NOT include the stroke (e.g. lineWidth), left for backward compatibility.
    const minimumWidth = Math.max( this.minWidth, contentWidth + ( 2 * this.xMargin ) ) + this.lineWidth;
    const minimumHeight = contentHeight + ( 2 * this.yMargin ) + this.lineWidth;

    // Our resulting sizes (allow setting preferred width/height on the panel)
    const preferredWidth = panel.preferredWidth === null ? minimumWidth : panel.preferredWidth;
    const preferredHeight = panel.preferredHeight === null ? minimumHeight : panel.preferredHeight;

    // Determine the size available to our content
    if ( isWidthSizable( content ) ) {
      content.preferredWidth = preferredWidth - this.lineWidth - 2 * this.xMargin;
    }
    if ( isHeightSizable( content ) ) {
      content.preferredHeight = preferredHeight - this.lineWidth - 2 * this.yMargin;
    }

    background.setRect( 0, 0, preferredWidth - this.lineWidth, preferredHeight - this.lineWidth );

    // Align the content within the background. If the content width >= minWidth, then all alignments are equivalent.
    if ( this.align === 'center' ) {
      content.center = background.center;
    }
    else if ( this.align === 'left' ) {

      // Use background.rectWidth instead of background.width because they differ by the background lineWidth
      content.left = background.centerX - background.rectWidth / 2 + this.xMargin;
      content.centerY = background.centerY;
    }
    else { /* right */

      // Use background.rectWidth instead of background.width because they differ by the background lineWidth
      content.right = background.centerX + background.rectWidth / 2 - this.xMargin;
      content.centerY = background.centerY;
    }

    // Set minimums at the end
    panel.minimumWidth = minimumWidth;
    panel.minimumHeight = minimumHeight;
  }

  public override dispose(): void {
    this.panel.preferredWidthProperty.unlink( this._updateLayoutListener );
    this.panel.preferredHeightProperty.unlink( this._updateLayoutListener );
    super.dispose();
  }
}

sun.register( 'Panel', Panel );
