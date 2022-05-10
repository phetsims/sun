// Copyright 2019-2022, University of Colorado Boulder

/**
 * The button on a combo box box.  Displays the current selection on the button.
 * Typically instantiated by ComboBox, not by client code.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import { AriaHasPopUpMutator, HStrut, IPaint, Node, Path, PDOMBehaviorFunction, PDOMPeer } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import ButtonNode from './buttons/ButtonNode.js';
import RectangularPushButton, { RectangularPushButtonOptions } from './buttons/RectangularPushButton.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';
import VSeparator from './VSeparator.js';
import ComboBoxItem from './ComboBoxItem.js';
import IProperty from '../../axon/js/IProperty.js';
import nullSoundPlayer from '../../tambo/js/shared-sound-players/nullSoundPlayer.js';

// constants
const ALIGN_VALUES = [ 'left', 'center', 'right' ] as const;
const ARROW_DIRECTION_VALUES = [ 'up', 'down' ] as const;

export type ComboBoxButtonAlign = typeof ALIGN_VALUES[number];
export type ComboBoxButtonArrowDirection = typeof ARROW_DIRECTION_VALUES[number];

// The definition for how ComboBoxButton sets its accessibleName in the PDOM. See ComboBox.md for further style guide
// and documentation on the pattern.
const ACCESSIBLE_NAME_BEHAVIOR: PDOMBehaviorFunction = ( node, options, accessibleName ) => {
  options.labelTagName = 'span';
  options.labelContent = accessibleName;
  return options;
};

type SelfOptions = {
  align?: ComboBoxButtonAlign;
  arrowDirection?: ComboBoxButtonArrowDirection;
  arrowFill?: IPaint;

  // The pattern for the voicingNameResponse, with "{{value}}" provided to be filled in with
  // ComboBoxItem.a11yLabel.
  comboBoxVoicingNameResponsePattern?: string;
};

export type ComboBoxButtonOptions = SelfOptions & Omit<RectangularPushButtonOptions, 'children' | 'ariaLabelledbyAssociations'>;

export default class ComboBoxButton<T> extends RectangularPushButton {

  // set to true to block voicing to occur upon this button's next focus event.
  private _blockNextVoicingFocusListener: boolean;

  private readonly disposeComboBoxButton: () => void;

  // needed by methods
  private arrow: Path;
  private vSeparator: VSeparator;

  constructor( property: IProperty<T>, items: ComboBoxItem<T>[], providedOptions?: ComboBoxButtonOptions ) {

    const options = optionize<ComboBoxButtonOptions, SelfOptions, RectangularPushButtonOptions>()( {

      align: 'left',
      arrowDirection: 'down',
      arrowFill: 'black',

      comboBoxVoicingNameResponsePattern: SunConstants.VALUE_NAMED_PLACEHOLDER,

      // RectangularPushButton options
      cursor: 'pointer',
      baseColor: 'white',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      xMargin: 12,
      yMargin: 8,
      stroke: 'black',
      lineWidth: 1,
      soundPlayer: nullSoundPlayer, // disable default sound generation

      // PushButtonModel options
      enabledPropertyOptions: {
        phetioFeatured: false
      },
      visiblePropertyOptions: { phetioFeatured: false },

      // phet-io
      tandem: Tandem.OPTIONAL,

      // pdom
      containerTagName: 'div',
      accessibleNameBehavior: ACCESSIBLE_NAME_BEHAVIOR
    }, providedOptions );

    assert && assert( _.includes( ALIGN_VALUES, options.align ),
      `invalid align: ${options.align}` );
    assert && assert( _.includes( ARROW_DIRECTION_VALUES, options.arrowDirection ),
      `invalid arrowDirection: ${options.arrowDirection}` );

    // To improve readability
    const itemXMargin = options.xMargin;

    // Compute max item size
    const maxItemWidth = _.maxBy( items, ( item: ComboBoxItem<T> ) => item.node.width )!.node.width;
    const maxItemHeight = _.maxBy( items, ( item: ComboBoxItem<T> ) => item.node.height )!.node.height;

    // We want the arrow area to be square, see https://github.com/phetsims/sun/issues/453
    const arrowAreaSize = ( maxItemHeight + 2 * options.yMargin );

    // The arrow is sized to fit in the arrow area, empirically determined to be visually pleasing.
    const arrowHeight = 0.35 * arrowAreaSize; // height of equilateral triangle
    const arrowWidth = 2 * arrowHeight * Math.sqrt( 3 ) / 3; // side of equilateral triangle

    // Invisible horizontal struts that span the item area and arrow area. Makes layout more straightforward.
    const itemAreaStrut = new HStrut( maxItemWidth + 2 * itemXMargin );
    const arrowAreaStrut = new HStrut( arrowAreaSize, {
      left: itemAreaStrut.right
    } );

    // arrow that points up or down, to indicate which way the list pops up
    let arrowShape = null;
    if ( options.arrowDirection === 'up' ) {
      arrowShape = new Shape()
        .moveTo( 0, arrowHeight )
        .lineTo( arrowWidth / 2, 0 )
        .lineTo( arrowWidth, arrowHeight )
        .close();
    }
    else {
      arrowShape = new Shape()
        .moveTo( 0, 0 )
        .lineTo( arrowWidth, 0 )
        .lineTo( arrowWidth / 2, arrowHeight )
        .close();
    }
    const arrow = new Path( arrowShape, {
      fill: options.arrowFill,
      center: arrowAreaStrut.center
    } );

    // Wrapper for the selected item's Node.
    // Do not transform ComboBoxItem.node because it is shared with ComboBoxListItemNode.
    const itemNodeWrapper = new Node();

    // Vertical separator between the item and arrow that is the full height of the button.
    const vSeparator = new VSeparator( maxItemHeight + 2 * options.yMargin, {
      stroke: 'black',
      lineWidth: options.lineWidth,
      centerX: itemAreaStrut.right,
      centerY: itemAreaStrut.centerY
    } );

    // Margins are different in the item and button areas. And we want the vertical separator to extend
    // beyond the margin.  We've handled those margins above, so the actual margins propagated to the button
    // need to be zero.
    options.xMargin = 0;
    options.yMargin = 0;

    options.content = new Node( {
      children: [ itemAreaStrut, arrowAreaStrut, itemNodeWrapper, vSeparator, arrow ]
    } );

    super( options );

    this._blockNextVoicingFocusListener = false;

    this.voicingFocusListener = () => {

      // fire the listener only if we are not blocking the focus listener
      !this._blockNextVoicingFocusListener && this.defaultFocusListener();
      this._blockNextVoicingFocusListener = false;
    };

    const updateItemLayout = () => {
      if ( options.align === 'left' ) {
        itemNodeWrapper.left = itemAreaStrut.left + itemXMargin;
      }
      else if ( options.align === 'right' ) {
        itemNodeWrapper.right = itemAreaStrut.right - itemXMargin;
      }
      else {
        itemNodeWrapper.centerX = itemAreaStrut.centerX;
      }
      itemNodeWrapper.centerY = itemAreaStrut.centerY;
    };

    // When Property's value changes, show the corresponding item's Node on the button.
    let item: ComboBoxItem<T> | null = null;
    const propertyObserver = ( value: T ) => {

      // Remove bounds listener from previous item.node
      if ( item && item.node.boundsProperty.hasListener( updateItemLayout ) ) {
        item.node.boundsProperty.unlink( updateItemLayout );
      }

      // remove the node for the previous item
      itemNodeWrapper.removeAllChildren();

      // find the ComboBoxItem whose value matches the property's value
      item = _.find( items, ( item: ComboBoxItem<T> ) => item.value === value )!;
      assert && assert( item, `no item found for value: ${value}` );

      // add the associated node
      itemNodeWrapper.addChild( item!.node );

      // Update layout if bounds change, see https://github.com/phetsims/scenery-phet/issues/482
      item!.node.boundsProperty.lazyLink( updateItemLayout );

      updateItemLayout();

      // pdom
      this.innerContent = item!.a11yLabel;
      this.voicingNameResponse = StringUtils.fillIn( options.comboBoxVoicingNameResponsePattern, {
        value: item!.a11yLabel
      } );
    };
    property.link( propertyObserver );

    // Add aria-labelledby attribute to the button.
    // The button is aria-labelledby its own label sibling, and then (second) its primary sibling in the PDOM.
    // Order matters!
    this.ariaLabelledbyAssociations = [
      {
        otherNode: this,
        otherElementName: PDOMPeer.LABEL_SIBLING,
        thisElementName: PDOMPeer.PRIMARY_SIBLING
      },
      {
        otherNode: this,
        otherElementName: PDOMPeer.PRIMARY_SIBLING,
        thisElementName: PDOMPeer.PRIMARY_SIBLING
      }
    ];

    // signify to AT that this button opens a menu
    AriaHasPopUpMutator.mutateNode( this, 'listbox' );

    this.disposeComboBoxButton = () => {
      property.unlink( propertyObserver );
    };

    this.arrow = arrow;
    this.vSeparator = vSeparator;
  }

  /**
   * Sets the button to look like a value display instead of a combo box button.
   * See https://github.com/phetsims/sun/issues/451
   */
  public setDisplayOnly( displayOnly: boolean ): void {
    this.arrow.visible = !displayOnly;
    this.vSeparator.visible = !displayOnly;
  }

  /**
   * Call to block voicing from occurring upon this button's next focus event.
   * For use by ComboBox.
   */
  public blockNextVoicingFocusListener(): void {
    this._blockNextVoicingFocusListener = true;
  }

  public override dispose(): void {
    this.disposeComboBoxButton();
    super.dispose();
  }
}

sun.register( 'ComboBoxButton', ComboBoxButton );
