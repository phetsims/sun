// Copyright 2019-2024, University of Colorado Boulder

/**
 * Node for an item in a combo box list.
 * Responsible for highlighting itself when the pointer is over it.
 * Typically instantiated by ComboBox, not by client code.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../kite/js/imports.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import optionize from '../../phet-core/js/optionize.js';
import { IndexedNodeIO, Node, NodeOptions, PressListener, Rectangle, TPaint, Voicing, VoicingOptions } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Property from '../../axon/js/Property.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import { ComboBoxItemNoNode } from './ComboBox.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';

type SelfOptions = {
  align?: 'left' | 'right' | 'center';

  // margin between the item and the highlight edge
  xMargin?: number;

  // highlight behind the item
  highlightFill?: TPaint;

  // corner radius for the highlight
  highlightCornerRadius?: number;

  comboBoxVoicingNameResponsePattern?: TReadOnlyProperty<string> | string;
};
type ParentOptions = VoicingOptions & NodeOptions;
export type ComboBoxListItemNodeOptions = SelfOptions & StrictOmit<ParentOptions, 'children' | 'innerContent'>;

export default class ComboBoxListItemNode<T> extends Voicing( Node ) {

  // when true, the next voicing focus listener will supply the response needed when opening the comboBox.
  // It will then set this back to false.
  private _supplyOpenResponseOnNextFocus: boolean;

  public readonly item: ComboBoxItemNoNode<T>;

  private readonly disposeComboBoxListItemNode: () => void;

  public constructor(
    item: ComboBoxItemNoNode<T>,
    node: Node,
    a11yNameProperty: TReadOnlyProperty<string | null>,
    highlightWidthProperty: TReadOnlyProperty<number>,
    highlightHeightProperty: TReadOnlyProperty<number>,
    providedOptions?: ComboBoxListItemNodeOptions
  ) {

    const options = optionize<ComboBoxListItemNodeOptions, SelfOptions, ParentOptions>()( {

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
      tandemNameSuffix: 'Item',

      // Together, these options make it possible to reorder the combo box items in studio, and save a customized
      // simulation with the new order.
      phetioType: IndexedNodeIO,
      phetioState: true,
      visiblePropertyOptions: { phetioFeatured: true }
    }, providedOptions );

    // @ts-expect-error convert Property into string
    options.comboBoxVoicingNameResponsePattern = options.comboBoxVoicingNameResponsePattern.get ?
      // @ts-expect-error convert Property into string
                                                 options.comboBoxVoicingNameResponsePattern.get() :
                                                 options.comboBoxVoicingNameResponsePattern;

    // Don't test the contents of strings when ?stringTest is enabled
    assert && assert( !!phet.chipper.queryParameters.stringTest ||
                      // @ts-expect-error is a string now.
                      options.comboBoxVoicingNameResponsePattern.includes( '{{value}}' ),
      'value needs to be filled in' );

    // Highlight that is shown when the pointer is over this item. This is not the a11y focus rectangle.
    const highlightRectangle = new Rectangle( {
      cornerRadius: options.highlightCornerRadius
    } );

    // Wrapper for the item's Node. Do not transform item.node because it is shared with ComboBoxButton!
    const itemNodeWrapper = new Node( {
      children: [ node ]
    } );

    // Adjust the size when the highlight size changes.
    const highlightWidthListener = ( width: number ) => {
      highlightRectangle.rectWidth = width;
      itemNodeWrapper.maxWidth = width;
    };
    highlightWidthProperty.link( highlightWidthListener );
    const highlightHeightListener = ( height: number ) => {
      highlightRectangle.rectHeight = height;
      itemNodeWrapper.maxHeight = height;
    };
    highlightHeightProperty.link( highlightHeightListener );

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

    options.children = [ highlightRectangle, itemNodeWrapper ];

    super( options );
    this._supplyOpenResponseOnNextFocus = false;

    const emptyA11yNameProperty = new DerivedProperty( [ a11yNameProperty ], ( a11yName: string | null ) => {
      return a11yName ? a11yName : '';
    } );

    // TODO: Allow comboBoxVoicingNameResponsePattern to change, see https://github.com/phetsims/sun/issues/865
    const patternProperty = typeof options.comboBoxVoicingNameResponsePattern === 'string' ?
                            new Property( options.comboBoxVoicingNameResponsePattern ) :
                            options.comboBoxVoicingNameResponsePattern;
    // TODO: It seems unlinks are missing, and the existing code was broken, see https://github.com/phetsims/sun/issues/865
    const patternStringProperty = new PatternStringProperty( patternProperty, {
      value: emptyA11yNameProperty
    }, { tandem: Tandem.OPT_OUT } );
    this.voicingNameResponse = patternStringProperty;

    const a11yNameListener = ( a11yName: string | null ) => {
      // pdom: get innerContent from the item
      this.innerContent = a11yName;
      this.voicingObjectResponse = a11yName;
    };
    a11yNameProperty.link( a11yNameListener );

    this.item = item;

    // pdom focus highlight is fitted to this Node's bounds, so that it doesn't overlap other items in the list box
    this.localBoundsProperty.link( localBounds => {
      this.focusHighlight = Shape.bounds( localBounds );
    } );

    const pressListener = new PressListener( {
      attach: false,
      tandem: Tandem.OPT_OUT
    } );
    this.addInputListener( pressListener );

    // Show highlight when pointer is over this item.
    // Change fill instead of visibility so that we don't end up with vertical pointer gaps in the list
    pressListener.looksOverProperty.link( pressed => {
      highlightRectangle.fill = pressed ? options.highlightFill : null;
    } );

    this.disposeComboBoxListItemNode = () => {
      pressListener.dispose();
      patternStringProperty.dispose();
      emptyA11yNameProperty.dispose();
      a11yNameProperty.unlink( a11yNameListener );
      highlightWidthProperty.unlink( highlightWidthListener );
      highlightHeightProperty.unlink( highlightHeightListener );
    };
  }

  /**
   * Ask for the voicing response for opening the ComboBox upon next focus, but only for the very next focus event.
   */
  public supplyOpenResponseOnNextFocus(): void {
    this._supplyOpenResponseOnNextFocus = true;
  }

  /**
   * Free memory references to avoid leaks.
   */
  public override dispose(): void {
    this.disposeComboBoxListItemNode();
    super.dispose();
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