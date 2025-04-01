// Copyright 2019-2025, University of Colorado Boulder

/**
 * The button on a combo box box.  Displays the current selection on the button.
 * Typically instantiated by ComboBox, not by client code.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import Property from '../../axon/js/Property.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import type TProperty from '../../axon/js/TProperty.js';
import type TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Shape from '../../kite/js/Shape.js';
import optionize from '../../phet-core/js/optionize.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import AriaHasPopUpMutator from '../../scenery/js/accessibility/pdom/AriaHasPopUpMutator.js';
import { type AccessibleNameBehaviorFunction } from '../../scenery/js/accessibility/pdom/ParallelDOM.js';
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import GridBox from '../../scenery/js/layout/nodes/GridBox.js';
import Line from '../../scenery/js/nodes/Line.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import type TPaint from '../../scenery/js/util/TPaint.js';
import nullSoundPlayer from '../../tambo/js/nullSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import ButtonNode from './buttons/ButtonNode.js';
import RectangularPushButton, { type RectangularPushButtonOptions } from './buttons/RectangularPushButton.js';
import { type ComboBoxItemNoNode } from './ComboBox.js';
import ComboBoxListBox from './ComboBoxListBox.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';

// constants
const ALIGN_VALUES = [ 'left', 'center', 'right' ] as const;
const ARROW_DIRECTION_VALUES = [ 'up', 'down' ] as const;

export type ComboBoxButtonAlign = typeof ALIGN_VALUES[number];
export type ComboBoxButtonArrowDirection = typeof ARROW_DIRECTION_VALUES[number];

// The definition for how ComboBoxButton sets its accessibleName in the PDOM. See ComboBox.md for further style guide
// and documentation on the pattern.
const ACCESSIBLE_NAME_BEHAVIOR: AccessibleNameBehaviorFunction = ( node, options, accessibleName ) => {
  options.labelContent = accessibleName;
  return options;
};

type SelfOptions = {
  align?: ComboBoxButtonAlign;
  arrowDirection?: ComboBoxButtonArrowDirection;
  arrowFill?: TPaint;

  // The pattern for the voicingNameResponse, with "{{value}}" provided to be filled in with
  // ComboBoxItem.a11yName.
  comboBoxVoicingNameResponsePattern?: TReadOnlyProperty<string> | string;

  localPreferredWidthProperty?: TReadOnlyProperty<number | null>;
  localMinimumWidthProperty?: TProperty<number | null>; // Will only be set
};

export type ComboBoxButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'children' | 'ariaLabelledbyAssociations'>;

export default class ComboBoxButton<T> extends RectangularPushButton {

  // set to true to block voicing to occur upon this button's next focus event.
  private _blockNextVoicingFocusListener: boolean;

  private readonly disposeComboBoxButton: () => void;

  // needed by methods
  private arrow: Path;
  private separatorLine: Line;

  public constructor(
    property: TProperty<T>,
    items: ComboBoxItemNoNode<T>[],
    nodes: Node[],
    providedOptions?: ComboBoxButtonOptions
  ) {

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
      phetioEnabledPropertyInstrumented: false,
      phetioVisiblePropertyInstrumented: false,

      localPreferredWidthProperty: new TinyProperty( null ),
      localMinimumWidthProperty: new TinyProperty( null ),

      // pdom
      containerTagName: 'div',
      labelTagName: 'p', // NOTE: A `span` causes duplicate name-speaking with VO+safari in https://github.com/phetsims/ratio-and-proportion/issues/532
      accessibleNameBehavior: ACCESSIBLE_NAME_BEHAVIOR
    }, providedOptions );

    assert && assert( _.includes( ALIGN_VALUES, options.align ),
      `invalid align: ${options.align}` );
    assert && assert( _.includes( ARROW_DIRECTION_VALUES, options.arrowDirection ),
      `invalid arrowDirection: ${options.arrowDirection}` );

    // To improve readability
    const itemXMargin = options.xMargin;
    const itemYMargin = options.yMargin;

    // Compute max item size
    const maxItemWidthProperty = ComboBoxListBox.getMaxItemWidthProperty( nodes );
    const maxItemHeightProperty = ComboBoxListBox.getMaxItemHeightProperty( nodes );

    const arrow = new Path( null, {
      fill: options.arrowFill
    } );

    // Wrapper for the selected item's Node.
    // Do not transform ComboBoxItem.node because it is shared with ComboBoxListItemNode.


    const matchingItem = _.find( items, item => item.value === property.value )!;
    const index = items.indexOf( matchingItem );
    assert && assert( index >= 0, 'Current value of property is not in list of items', property.value );
    const itemNodeWrapper = new Node( {
      layoutOptions: {
        yMargin: itemYMargin,
        grow: 1,
        xAlign: options.align
      },
      children: [
        nodes[ index ]
      ]
    } );

    // Line separator between the item and arrow that is the full height of the button.
    // We cannot use VSeparator here, because it is incompatible with GridConstraints.
    // y2 is set during a multilink according to the item height property.
    const separatorLine = new Line( 0, 0, 0, 0, {
      stroke: 'black',
      lineWidth: options.lineWidth
    } );

    options.content = new GridBox( {
      rows: [ [
        itemNodeWrapper,
        separatorLine,
        arrow
      ] ]
    } );

    // Update the drop-down arrow.  No dispose is needed since the dependencies are locally owned.
    Multilink.multilink( [ maxItemWidthProperty, maxItemHeightProperty ], ( maxItemWidth, maxItemHeight ) => {

      const fullHeight = maxItemHeight + 2 * itemYMargin;

      // We want the arrow area to be square, see https://github.com/phetsims/sun/issues/453
      const arrowAreaSize = fullHeight;

      // The arrow is sized to fit in the arrow area, empirically determined to be visually pleasing.
      const arrowHeight = 0.35 * arrowAreaSize; // height of equilateral triangle
      const arrowWidth = 2 * arrowHeight * Math.sqrt( 3 ) / 3; // side of equilateral triangle

      const leftMargin = itemXMargin;
      const middleMargin = itemXMargin - options.lineWidth / 2; // Compensation for the separator having width
      const rightMargin = -options.lineWidth / 2; // Compensation for the separator having width

      // arrow that points up or down, to indicate which way the list pops up
      const createArrowShape = ( direction: 'up' | 'down', width: number, height: number ) => {
        if ( direction === 'up' ) {
          return new Shape()
            .moveTo( 0, height )
            .lineTo( width / 2, 0 )
            .lineTo( width, height )
            .close();
        }
        else {
          return new Shape()
            .moveTo( 0, 0 )
            .lineTo( width, 0 )
            .lineTo( width / 2, height )
            .close();
        }
      };

      arrow.shape = createArrowShape( options.arrowDirection, arrowWidth, arrowHeight );
      arrow.mutateLayoutOptions( {
        minContentWidth: arrowAreaSize,
        minContentHeight: arrowAreaSize
      } );

      itemNodeWrapper.mutateLayoutOptions( {
        minContentWidth: maxItemWidth,
        minContentHeight: maxItemHeight,
        leftMargin: leftMargin,
        rightMargin: middleMargin
      } );

      separatorLine.y2 = fullHeight;
      separatorLine.mutateLayoutOptions( {
        rightMargin: rightMargin
      } );
    } );

    // Margins are different in the item and button areas. And we want the vertical separator to extend
    // beyond the margin.  We've handled those margins above, so the actual margins propagated to the button
    // need to be zero.
    options.xMargin = 0;
    options.yMargin = 0;

    super( options );

    // Provide our minimum width back up to the ComboBox (or creator)
    this.minimumWidthProperty.link( minimumWidth => {
      options.localMinimumWidthProperty.value = minimumWidth;
    } );

    // Hook our ComboBox's preferredWidth up to ours
    const preferredWidthListener = ( preferredWidth: number | null ) => {
      this.preferredWidth = preferredWidth;
    };
    options.localPreferredWidthProperty.link( preferredWidthListener );

    this._blockNextVoicingFocusListener = false;

    this.voicingFocusListener = () => {

      // fire the listener only if we are not blocking the focus listener
      !this._blockNextVoicingFocusListener && this.defaultFocusListener();
      this._blockNextVoicingFocusListener = false;
    };

    // Keep track for disposal
    let voicingPatternstringProperty: TReadOnlyProperty<string> | null = null;

    const itemProperty = new DerivedProperty( [ property ], value => {
      const item = _.find( items, item => item.value === value )!;
      assert && assert( item, `no item found for value: ${value}` );
      return item;
    } );

    const nodeProperty = new DerivedProperty( [ itemProperty ], item => {
      return nodes[ items.indexOf( item ) ];
    } );

    // Show the corresponding item's Node on the button.
    nodeProperty.link( node => {
      // remove the node for the previous item
      itemNodeWrapper.removeAllChildren();

      // add the associated node
      itemNodeWrapper.addChild( node );
    } );

    // Update the button's accessible name when the item changes.
    itemProperty.link( item => {

      // pdom - Don't use accessibleName here! This is for the selection, but the button's accessibleName is the static label.
      this.innerContent = item.accessibleName || null;

      const patternProperty = typeof options.comboBoxVoicingNameResponsePattern === 'string' ?
                              new Property( options.comboBoxVoicingNameResponsePattern ) :
                              options.comboBoxVoicingNameResponsePattern;

      voicingPatternstringProperty && voicingPatternstringProperty.dispose();
      // TODO: DO NOT have this getting recreated, we can simply create one up front, see https://github.com/phetsims/sun/issues/865
      this.voicingNameResponse = voicingPatternstringProperty = new PatternStringProperty( patternProperty, {
        value: item.accessibleName || ''
      }, { tandem: Tandem.OPT_OUT } );
    } );

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

    this.setAriaHasPopUp( true );

    this.disposeComboBoxButton = () => {
      maxItemWidthProperty.dispose();
      maxItemHeightProperty.dispose();

      itemProperty.dispose();
      options.localPreferredWidthProperty.unlink( preferredWidthListener );

      voicingPatternstringProperty && voicingPatternstringProperty.dispose();
    };

    this.arrow = arrow;
    this.separatorLine = separatorLine;
  }

  private setAriaHasPopUp( value: boolean ): void {

    // signify to AT that this button opens a menu
    AriaHasPopUpMutator.mutateNode( this, value ? 'listbox' : false );
  }

  /**
   * Sets the button to look like a value display instead of a combo box button.
   * See https://github.com/phetsims/sun/issues/451
   */
  public setDisplayOnly( displayOnly: boolean ): void {
    this.arrow.visible = !displayOnly;
    this.separatorLine.visible = !displayOnly;

    this.tagName = displayOnly ? 'p' : 'button';
    this.setAriaHasPopUp( !displayOnly );
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