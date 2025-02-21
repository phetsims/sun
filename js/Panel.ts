// Copyright 2013-2025, University of Colorado Boulder

/**
 * Control panel around a content node.
 * Dynamically adjusts its size to fit its contents.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco (PhET Interactive Simulations)
 */

import { optionize3, type OptionizeDefaults } from '../../phet-core/js/optionize.js';
import ParallelDOM from '../../scenery/js/accessibility/pdom/ParallelDOM.js';
import LayoutConstraint from '../../scenery/js/layout/constraints/LayoutConstraint.js';
import Sizable, { type SizableOptions } from '../../scenery/js/layout/Sizable.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import assertNoAdditionalChildren from '../../scenery/js/util/assertNoAdditionalChildren.js';
import type TPaint from '../../scenery/js/util/TPaint.js';
import sun from './sun.js';

// valid values for options.align
const ALIGN_VALUES = [ 'left', 'center', 'right' ] as const;

export type PanelAlign = typeof ALIGN_VALUES[number];

type SelfOptions = {
  fill?: TPaint;
  stroke?: TPaint;

  // width of the background border
  lineWidth?: number;
  lineDash?: number[];

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
  minHeight?: number;
};

type SuperOptions = SizableOptions & NodeOptions;
export type PanelOptions = SelfOptions & SuperOptions;

const DEFAULT_OPTIONS: OptionizeDefaults<SelfOptions, SuperOptions> = {
  fill: 'white',
  stroke: 'black',
  lineWidth: 1,
  lineDash: [],
  xMargin: 5,
  yMargin: 5,
  cornerRadius: 10,
  resize: true,
  backgroundPickable: true,
  excludeInvisibleChildrenFromBounds: true,
  align: 'left',
  minWidth: 0,
  minHeight: 0,

  // pdom
  labelTagName: 'span', // A labelTagName ensures the accessibleName gets its own tag before child content.
  accessibleHelpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT // Help text comes first for Nodes that are content containers.
};
assert && Object.freeze( DEFAULT_OPTIONS );

export default class Panel extends Sizable( Node ) {

  private readonly constraint: PanelConstraint;

  // These are public for use by PanelConstraint only. They should otherwise be considered private.
  public readonly _content: Node;
  public readonly _backgroundContainer: Node;
  public readonly _background: Rectangle;

  public static readonly DEFAULT_PANEL_OPTIONS = DEFAULT_OPTIONS;

  public constructor( content: Node, providedOptions?: PanelOptions ) {

    const options = optionize3<PanelOptions, SelfOptions, SuperOptions>()( {}, DEFAULT_OPTIONS, providedOptions );

    assert && assert( _.includes( ALIGN_VALUES, options.align ), `invalid align: ${options.align}` );

    super();

    this._content = content;
    this._backgroundContainer = new Node();

    // correct size will be set by layout
    this._background = new Rectangle( 0, 0, 1, 1, {
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

    // Only do this AFTER adding as a child
    this.constraint = new PanelConstraint( this, options );
    this.constraint.updateLayout();

    // Don't update automatically if resize:false
    this.constraint.enabled = options.resize;

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    this.mutate( options );

    // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
    assert && assertNoAdditionalChildren( this );
  }

  /**
   * Get the background rectangle's stroke (can be overridden)
   */
  public getStroke(): TPaint {
    return this._background.stroke;
  }

  public get stroke(): TPaint { return this.getStroke(); }

  public set stroke( value: TPaint ) { this.setStroke( value ); }

  /**
   * Change the background rectangle's stroke (can be overridden)
   */
  public setStroke( stroke: TPaint ): void {
    this._background.stroke = stroke;

    // Since it depends on the stroke (if it's null, our minimum bounds get reduced)
    this.constraint && this.constraint.updateLayoutAutomatically();
  }

  /**
   * Get the background rectangle's fill (can be overridden)
   */
  public getFill(): TPaint {
    return this._background.fill;
  }

  public get fill(): TPaint { return this.getFill(); }

  public set fill( value: TPaint ) { this.setFill( value ); }

  /**
   * Change the background rectangle's fill (can be overridden)
   */
  public setFill( fill: TPaint ): void {
    this._background.fill = fill;
  }

  public override setExcludeInvisibleChildrenFromBounds( excludeInvisibleChildrenFromBounds: boolean ): void {
    super.setExcludeInvisibleChildrenFromBounds( excludeInvisibleChildrenFromBounds );
    this.constraint.updateLayoutAutomatically();
  }
}

class PanelConstraint extends LayoutConstraint {

  private readonly panel: Panel;
  private readonly minWidth: number;
  private readonly xMargin: number;
  private readonly yMargin: number;
  private readonly lineWidth: number;
  private readonly align: PanelAlign;
  private readonly minHeight: number;

  public constructor( panel: Panel, options: Required<SelfOptions> ) {
    super( panel );

    this.panel = panel;

    assert && assert( typeof options.minWidth === 'number', 'Panel minWidth should be a number' );
    assert && assert( typeof options.xMargin === 'number', 'Panel xMargin should be a number' );
    assert && assert( typeof options.yMargin === 'number', 'Panel yMargin should be a number' );
    assert && assert( typeof options.lineWidth === 'number', 'Panel lineWidth should be a number' );
    assert && assert( ALIGN_VALUES.includes( options.align ), `Panel align should be one of ${ALIGN_VALUES}` );

    this.minWidth = options.minWidth;
    this.minHeight = options.minHeight;
    this.xMargin = options.xMargin;
    this.yMargin = options.yMargin;
    this.lineWidth = options.lineWidth;
    this.align = options.align;

    this.panel.localPreferredWidthProperty.lazyLink( this._updateLayoutListener );
    this.panel.localPreferredHeightProperty.lazyLink( this._updateLayoutListener );

    this.addNode( panel._content );
  }

  protected override layout(): void {
    super.layout();

    const panel = this.panel;
    const content = panel._content;
    const background = panel._background;

    const hasValidContent = panel.isChildIncludedInLayout( content );

    // Bail out (and make the background invisible) if our bounds are invalid
    panel._backgroundContainer.children = hasValidContent ? [ background ] : [];
    if ( !hasValidContent ) {
      panel.localMinimumWidth = null;
      panel.localMinimumHeight = null;
      return;
    }

    const contentProxy = this.createLayoutProxy( content );

    // Should only happen when we are disconnected during disposal
    if ( !contentProxy ) {
      return;
    }

    // We only have to account for the lineWidth in our layout if we have a stroke
    const lineWidth = panel.stroke === null ? 0 : this.lineWidth;

    const minimumContentWidth = contentProxy.minimumWidth;
    const minimumContentHeight = contentProxy.minimumHeight;

    // Our minimum dimensions are directly determined by the content, margins and lineWidth
    // NOTE: options.minWidth does NOT include the stroke (e.g. lineWidth), left for backward compatibility.
    const minimumWidth = Math.max( this.minWidth, minimumContentWidth + ( 2 * this.xMargin ) ) + lineWidth;
    const minimumHeight = Math.max( this.minHeight, minimumContentHeight + ( 2 * this.yMargin ) ) + lineWidth;

    // Our resulting sizes (allow setting preferred width/height on the panel)
    const preferredWidth: number = Math.max( minimumWidth, panel.localPreferredWidth || 0 );
    const preferredHeight: number = Math.max( minimumHeight, panel.localPreferredHeight || 0 );

    // Determine the size available to our content
    contentProxy.preferredWidth = preferredWidth - lineWidth - 2 * this.xMargin;
    contentProxy.preferredHeight = preferredHeight - lineWidth - 2 * this.yMargin;

    background.setRect( 0, 0, preferredWidth - lineWidth, preferredHeight - lineWidth );

    // Align the content within the background. If the content width >= minWidth, then all alignments are equivalent.
    if ( this.align === 'center' ) {
      contentProxy.center = background.center;
    }
    else if ( this.align === 'left' ) {

      // Use background.rectWidth instead of background.width because they differ by the background lineWidth
      contentProxy.left = background.centerX - background.rectWidth / 2 + this.xMargin;
      contentProxy.centerY = background.centerY;
    }
    else { /* right */

      // Use background.rectWidth instead of background.width because they differ by the background lineWidth
      contentProxy.right = background.centerX + background.rectWidth / 2 - this.xMargin;
      contentProxy.centerY = background.centerY;
    }

    // Set minimums at the end
    panel.localMinimumWidth = minimumWidth;
    panel.localMinimumHeight = minimumHeight;

    contentProxy.dispose();
  }

  public override dispose(): void {
    this.panel.localPreferredWidthProperty.unlink( this._updateLayoutListener );
    this.panel.localPreferredHeightProperty.unlink( this._updateLayoutListener );

    super.dispose();
  }
}

sun.register( 'Panel', Panel );