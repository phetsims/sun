// Copyright 2019-2022, University of Colorado Boulder

/**
 * Node for an item in a combo box list.
 * Responsible for highlighting itself when the pointer is over it.
 * Typically instantiated by ComboBox, not by client code.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import { IndexedNodeIO, IPaint, Node, Rectangle, Voicing, VoicingOptions } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import ComboBoxItem from './ComboBoxItem.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';

type SelfOptions = {
  align?: 'left' | 'right' | 'center';

  // margin between the item and the highlight edge
  xMargin?: number;

  // highlight behind the item
  highlightFill?: IPaint;

  // corner radius for the highlight
  highlightCornerRadius?: number;

  comboBoxVoicingNameResponsePattern?: string;
};

export type ComboBoxListItemNodeOptions = SelfOptions & VoicingOptions;

export default class ComboBoxListItemNode<T> extends Voicing( Node, 0 ) {

  // when true, the next voicing focus listener will supply the response needed when opening the comboBox.
  // It will then set this back to false.
  private _supplyOpenResponseOnNextFocus: boolean;

  public readonly item: ComboBoxItem<T>;

  constructor( item: ComboBoxItem<T>, highlightWidth: number, highlightHeight: number, providedOptions?: ComboBoxListItemNodeOptions ) {

    assert && assert( item instanceof ComboBoxItem );

    const options = optionize<ComboBoxListItemNodeOptions, SelfOptions, VoicingOptions>()( {

      cursor: 'pointer',
      align: 'left',
      xMargin: 6,
      highlightFill: 'rgb( 245, 245, 245 )',
      highlightCornerRadius: 4,

      // pdom
      tagName: 'li',
      focusable: true,
      ariaRole: 'option',

      // the `li` with ariaRole `option` does not get click events on iOS VoiceOver, so position
      // elements so they receive pointer events
      positionInPDOM: true,

      // voicing
      voicingFocusListener: () => this.comboBoxListItemNodeVoicingFocusListener(),
      comboBoxVoicingNameResponsePattern: SunConstants.VALUE_NAMED_PLACEHOLDER,

      // phet-io
      tandem: Tandem.REQUIRED,

      // Together, these options make it possible to reorder the combo box items in studio, and save a customized
      // simulation with the new order.
      phetioType: IndexedNodeIO,
      phetioState: true,
      visiblePropertyOptions: { phetioFeatured: true }
    }, providedOptions );

    // Don't test the contents of strings when ?stringTest is enabled
    // @ts-ignore chipper query parameters
    assert && assert( !!phet.chipper.queryParameters.stringTest ||
                      options.comboBoxVoicingNameResponsePattern.includes( '{{value}}' ),
      'value needs to be filled in' );

    // pdom: get innerContent from the item
    assert && assert( options.innerContent === undefined, 'ComboBoxListItemNode sets innerContent' );
    options.innerContent = item.a11yLabel;
    options.voicingObjectResponse = item.a11yLabel;
    options.voicingNameResponse = StringUtils.fillIn( options.comboBoxVoicingNameResponsePattern, {
      value: item.a11yLabel
    } );

    // Highlight that is shown when the pointer is over this item. This is not the a11y focus rectangle.
    const highlightRectangle = new Rectangle( 0, 0, highlightWidth, highlightHeight, {
      cornerRadius: options.highlightCornerRadius
    } );

    // Wrapper for the item's Node. Do not transform item.node because it is shared with ComboBoxButton!
    const itemNodeWrapper = new Node( {
      children: [ item.node ],
      maxWidth: highlightWidth,
      maxHeight: highlightHeight
    } );

    // Assume that item.node may change (as in ComboBoxDisplay) and adjust layout dynamically.
    // See https://github.com/phetsims/scenery-phet/issues/482
    const updateItemLayout = () => {
      if ( options.align === 'left' ) {
        itemNodeWrapper.left = highlightRectangle.left + options.xMargin;
      }
      else if ( options.align === 'right' ) {
        itemNodeWrapper.right = highlightRectangle.right - options.xMargin;
      }
      else {
        itemNodeWrapper.centerX = highlightRectangle.centerX;
      }
      itemNodeWrapper.centerY = highlightRectangle.centerY;
    };
    itemNodeWrapper.boundsProperty.lazyLink( updateItemLayout );
    updateItemLayout();

    assert && assert( !options.children, 'ComboBoxListItemNode sets children' );
    options.children = [ highlightRectangle, itemNodeWrapper ];

    super( options );
    this._supplyOpenResponseOnNextFocus = false;

    this.item = item;

    // pdom focus highlight is fitted to this Node's bounds, so that it doesn't overlap other items in the list box
    this.focusHighlight = Shape.bounds( this.localBounds );

    // Show highlight when pointer is over this item.
    // Change fill instead of visibility so that we don't end up with vertical pointer gaps in the list
    this.addInputListener( {
      enter() { highlightRectangle.fill = options.highlightFill; },
      exit() { highlightRectangle.fill = null; }
    } );

  }

  /**
   * Ask for the voicing response for opening the ComboBox upon next focus, but only for the very next focus event.
   */
  public supplyOpenResponseOnNextFocus(): void {
    this._supplyOpenResponseOnNextFocus = true;
  }

  /**
   * A custom focus listener for this type, with conditional support for providing a normal focus vs an "open" response.
   */
  private comboBoxListItemNodeVoicingFocusListener(): void {
    this.voicingSpeakFullResponse( {
      nameResponse: this._supplyOpenResponseOnNextFocus ? this.voicingNameResponse : null,
      objectResponse: this._supplyOpenResponseOnNextFocus ? null : this.voicingObjectResponse,
      contextResponse: null,
      hintResponse: this._supplyOpenResponseOnNextFocus ? this.voicingHintResponse : null
    } );
    this._supplyOpenResponseOnNextFocus = false;
  }
}

sun.register( 'ComboBoxListItemNode', ComboBoxListItemNode );
