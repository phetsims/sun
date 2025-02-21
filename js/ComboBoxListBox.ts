// Copyright 2019-2025, University of Colorado Boulder

/**
 * The popup list box for a ComboBox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import type TProperty from '../../axon/js/TProperty.js';
import type TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import type IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import KeyboardUtils from '../../scenery/js/accessibility/KeyboardUtils.js';
import { type SpeakingOptions, type VoicingNode } from '../../scenery/js/accessibility/voicing/Voicing.js';
import SceneryEvent from '../../scenery/js/input/SceneryEvent.js';
import type TInputListener from '../../scenery/js/input/TInputListener.js';
import VBox from '../../scenery/js/layout/nodes/VBox.js';
import { extendsWidthSizable, isWidthSizable } from '../../scenery/js/layout/sizableTypeChecks.js';
import KeyboardListener from '../../scenery/js/listeners/KeyboardListener.js';
import type Node from '../../scenery/js/nodes/Node.js';
import type TPaint from '../../scenery/js/util/TPaint.js';
import multiSelectionSoundPlayerFactory from '../../tambo/js/multiSelectionSoundPlayerFactory.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../tambo/js/TSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioAction from '../../tandem/js/PhetioAction.js';
import Tandem from '../../tandem/js/Tandem.js';
import { type ComboBoxItemNoNode } from './ComboBox.js';
import ComboBoxListItemNode, { type ComboBoxListItemNodeOptions } from './ComboBoxListItemNode.js';
import Panel, { type PanelOptions } from './Panel.js';
import sun from './sun.js';

type SelfOptions = {

  // fill for the highlight behind items in the list
  highlightFill?: TPaint;

  // Options that apply to every ComboBoxItemNode created in the list
  comboBoxListItemNodeOptions?: ComboBoxListItemNodeOptions;

  // Sound generators for when combo box is opened and when it is closed with no change. Closing *with*
  // a change is covered by individual combo box items.
  openedSoundPlayer?: TSoundPlayer;
  closedNoChangeSoundPlayer?: TSoundPlayer;
};

export type ComboBoxListBoxOptions = SelfOptions & PanelOptions;

export default class ComboBoxListBox<T> extends Panel {

  // The container for list items which will be provided to the panel.
  private readonly content: Node;

  private readonly disposeComboBoxListBox: () => void;

  // We need a separate node to voice through because when a selection occurs, the list box is hidden, silencing any
  // voicing responses occurring through Nodes within this class. This selection node should be visible when a combo
  // box selection occurs, see https://github.com/phetsims/ratio-and-proportion/issues/474
  private readonly voiceOnSelectionNode: VoicingNode;

  // The selected list item node from the list box at the start of the fire action.  This is needed for sound generation
  // because the managed Property isn't always updated when the list box is closed.
  private selectionOnFireAction: ComboBoxListItemNode<T>;

  /**
   * @param property
   * @param items
   * @param nodes
   * @param hideListBoxCallback - called to hide the list box
   * @param focusButtonCallback - called to transfer focus to the combo box's button
   * @param voiceOnSelectionNode - Node to voice the response when selecting a combo box item.
   * @param tandem
   * @param providedOptions
   */
  public constructor(
    property: TProperty<T>,
    items: ComboBoxItemNoNode<T>[],
    nodes: Node[],
    hideListBoxCallback: () => void,
    focusButtonCallback: () => void,
    voiceOnSelectionNode: VoicingNode,
    tandem: Tandem,
    providedOptions?: ComboBoxListBoxOptions
  ) {

    assert && assert( items.length > 0, 'empty list box is not supported' );

    const options = optionize<ComboBoxListBoxOptions, SelfOptions, PanelOptions>()( {
      highlightFill: 'rgb( 245, 245, 245 )',
      comboBoxListItemNodeOptions: {},

      // Panel options
      xMargin: 12,
      yMargin: 8,
      backgroundPickable: true,

      // pdom
      tagName: 'ul',
      ariaRole: 'listbox',
      groupFocusHighlight: true,

      openedSoundPlayer: sharedSoundPlayers.get( 'generalOpen' ),
      closedNoChangeSoundPlayer: sharedSoundPlayers.get( 'generalClose' ),
      visiblePropertyOptions: { phetioReadOnly: true }

      // Not instrumented for PhET-iO because the list's position isn't valid until it has been popped up.
      // See https://github.com/phetsims/phet-io/issues/1102
    }, providedOptions );

    assert && assert( options.xMargin > 0 && options.yMargin > 0,
      `margins must be > 0, xMargin=${options.xMargin}, yMargin=${options.yMargin}` );

    //TODO sun#462 replace fireEmitter and selectionListener with a standard scenery listener
    // Pops down the list box and sets the property.value to match the chosen item.
    const fireAction = new PhetioAction<[ SceneryEvent<MouseEvent | TouchEvent | PointerEvent | KeyboardEvent> ]>( event => {

      const listItemNode = event.currentTarget as ComboBoxListItemNode<T>;
      assert && assert( listItemNode instanceof ComboBoxListItemNode, 'expected a ComboBoxListItemNode' ); // eslint-disable-line phet/no-simple-type-checking-assertions

      // Update the internal state to reflect the selected Node, but don't update the Property value yet because the
      // focus needs to be shifted first.
      this.selectionOnFireAction = listItemNode;

      const oldValue = property.value;

      // So that something related to the ComboBox has focus before changing Property value.
      // See https://github.com/phetsims/sun/issues/721
      focusButtonCallback();

      // It is now safe to set the value based on which item was chosen in the list box.
      property.value = this.selectionOnFireAction.item.value;

      // hide the list
      hideListBoxCallback();

      this.voiceOnNewSelection( property.value, oldValue, listItemNode );

      // prevent nodes (eg, controls) behind the list from receiving the event
      event.abort();
    }, {
      parameters: [ { phetioPrivate: true, valueType: SceneryEvent } ],

      // phet-io
      tandem: tandem.createTandem( 'fireAction' ),
      phetioEventType: EventType.USER
    } );

    //TODO sun#462 replace fireEmitter and selectionListener with a standard scenery listener
    // Handles selection from the list box.
    const selectionListener: TInputListener = {

      up( event ) {
        fireAction.execute( event );
      },

      // Handle keyup on each item in the list box, for a11y.
      keyup: event => {
        if ( event.domEvent && KeyboardUtils.isAnyKeyEvent( event.domEvent, [ KeyboardUtils.KEY_ENTER, KeyboardUtils.KEY_SPACE ] ) ) {
          fireAction.execute( event );
        }
      },

      // handle activation from an assistive device that may not use a keyboard (such as mobile VoiceOver)
      click: event => {
        fireAction.execute( event );
      }
    };

    // Compute max item size
    const maxItemWidthProperty = ComboBoxListBox.getMaxItemWidthProperty( nodes );
    const maxItemHeightProperty = ComboBoxListBox.getMaxItemHeightProperty( nodes );

    // Uniform dimensions for all highlighted items in the list, highlight overlaps margin by 50%
    const highlightWidthProperty = new DerivedProperty( [ maxItemWidthProperty ], width => width + options.xMargin );
    const highlightHeightProperty = new DerivedProperty( [ maxItemHeightProperty ], width => width + options.yMargin );

    // Create a node for each item in the list, and attach a listener.
    const listItemNodes: ComboBoxListItemNode<T>[] = [];
    items.forEach( ( item, index ) => {

      // Create the list item node
      const listItemNode = new ComboBoxListItemNode( item, nodes[ index ], highlightWidthProperty, highlightHeightProperty,
        combineOptions<ComboBoxListItemNodeOptions>( {
          align: options.align,
          highlightFill: options.highlightFill,
          highlightCornerRadius: options.cornerRadius,

          // highlight overlaps half of margins
          xMargin: 0.5 * options.xMargin,

          tandem: item.tandemName ? tandem.createTandem( item.tandemName ) : Tandem.OPTIONAL
        }, options.comboBoxListItemNodeOptions, item.comboBoxListItemNodeOptions ) );
      listItemNodes.push( listItemNode );

      listItemNode.addInputListener( selectionListener );
    } );

    const content = new VBox( {
      spacing: 0,
      excludeInvisibleChildrenFromBounds: true,
      children: listItemNodes
    } );

    super( content, combineOptions<PanelOptions>( {}, options, {
      // Adjust margins to account for highlight overlap
      xMargin: options.xMargin / 2,
      yMargin: options.yMargin / 2
    } ) );

    this.content = content;

    this.voiceOnSelectionNode = voiceOnSelectionNode;

    this.selectionOnFireAction = this.getListItemNode( property.value );

    // Create a set of default sound generators, one for each item, to use if the item doesn't provide its own.
    const defaultItemSelectedSoundPlayers = items.map( item =>
      multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( items.indexOf( item ) )
    );

    // variable for tracking whether the selected value was changed by the user
    let selectionWhenListBoxOpened: ComboBoxListItemNode<T>;

    // sound generation
    this.visibleProperty.lazyLink( visible => {

      if ( visible ) {

        // Play the 'opened' sound when the list box becomes visible.
        options.openedSoundPlayer.play();

        // Keep track of what was selected when the list box was presented.
        selectionWhenListBoxOpened = this.getListItemNode( property.value );
      }
      else {

        // Verify that the list box became visible before going invisible and the selected value was saved at that time.
        assert && assert( selectionWhenListBoxOpened, 'no Node for when list box was opened' );

        // Did the user change the selection in the list box?
        if ( selectionWhenListBoxOpened === this.selectionOnFireAction ) {

          // No change.  Play the sound that indicates this.
          options.closedNoChangeSoundPlayer.play();
        }
        else {

          // Play a sound for the selected item.
          const selectedItem = this.selectionOnFireAction.item;
          if ( selectedItem.soundPlayer ) {
            selectedItem.soundPlayer.play();
          }
          else {

            // The selected item didn't provide a sound player, so use a default based on its position within the list
            // of visible selections.  With multitouch, it's possible that the selected item may become invisible before
            // we attempt to play its sound, so play only if it's still visible.
            // See https://github.com/phetsims/fourier-making-waves/issues/244
            const selectionIndex = this.getVisibleListItemNodes().indexOf( this.selectionOnFireAction );
            if ( selectionIndex !== -1 ) {
              defaultItemSelectedSoundPlayers[ selectionIndex ].play();
            }
          }
        }
      }
    } );

    // pdom - listener that navigates listbox items and closes the box from keyboard input
    const keyboardListener = new KeyboardListener( {
      keys: [ 'escape', 'tab', 'shift+tab', 'arrowUp', 'arrowDown', 'home', 'end' ],
      fire: ( event, keysPressed ) => {
        const sceneryEvent = event!;
        assert && assert( sceneryEvent, 'event is required for this listener' );

        // Only visible item nodes can receive focus - using content children directly because PhET-iO may change their
        // order.
        const visibleItemNodes = this.getVisibleListItemNodes();

        if ( keysPressed === 'escape' || keysPressed === 'tab' || keysPressed === 'shift+tab' ) {

          // Escape and Tab hide the list box and return focus to the button
          hideListBoxCallback();
          focusButtonCallback();
        }
        else if ( keysPressed === 'arrowUp' || keysPressed === 'arrowDown' ) {
          const domEvent = event!;
          assert && assert( domEvent, 'domEvent is required for this listener' );

          // prevent "native" behavior so that Safari doesn't make an error sound with arrow keys in
          // full screen mode, see #210
          domEvent.preventDefault();

          // Up/down arrow keys move the focus between items in the list box
          const direction = keysPressed === 'arrowDown' ? 1 : -1;
          const focusedItemIndex = visibleItemNodes.indexOf( this.getFocusedItemNode() );
          assert && assert( focusedItemIndex > -1, 'how could we receive keydown without a focused list item?' );

          const nextIndex = focusedItemIndex + direction;
          visibleItemNodes[ nextIndex ] && visibleItemNodes[ nextIndex ].focus();
        }
        else if ( keysPressed === 'home' ) {
          visibleItemNodes[ 0 ].focus();
        }
        else if ( keysPressed === 'end' ) {
          visibleItemNodes[ visibleItemNodes.length - 1 ].focus();
        }
      }
    } );
    this.addInputListener( keyboardListener );

    this.disposeComboBoxListBox = () => {
      for ( let i = 0; i < listItemNodes.length; i++ ) {
        listItemNodes[ i ].dispose(); // to unregister tandem
      }

      this.removeInputListener( keyboardListener );
      keyboardListener.dispose();

      // Private to ComboBoxListBox, but we need to clean up tandem.
      fireAction.dispose();

      maxItemWidthProperty.dispose();
      maxItemHeightProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeComboBoxListBox();
    super.dispose();
  }

  /**
   * Sets the visibility of one or more items in the listbox that correspond to a value. Assumes that each item
   * in the listbox has a unique value.
   * @param value - the value associated with the ComboBoxItem
   * @param visible
   */
  public setItemVisible( value: T, visible: boolean ): void {
    this.getListItemNode( value ).visible = visible;
  }

  /**
   * Is the item that corresponds to a value visible when the listbox is popped up?
   * @param value - the value associated with the ComboBoxItem
   */
  public isItemVisible( value: T ): boolean {
    return this.getListItemNode( value ).visible;
  }

  /**
   * Returns all list item Nodes, as children of the list box content in the correct order which may have changed
   * from PhET-iO.
   */
  private getAllListItemNodes(): ComboBoxListItemNode<T>[] {
    return this.content.children as ComboBoxListItemNode<T>[];
  }

  /**
   * Returns an array containing all the visible list item Nodes in top-to-bottom order.
   */
  private getVisibleListItemNodes(): ComboBoxListItemNode<T>[] {
    return this.getAllListItemNodes().filter( child => child.visible );
  }

  /**
   * Gets the ComboBoxListItemNode that corresponds to a specified value. Assumes that values are unique.
   */
  private getListItemNode( value: T ): ComboBoxListItemNode<T> {
    const listItemNode = _.find( this.getAllListItemNodes(), ( listItemNode: ComboBoxListItemNode<T> ) => listItemNode.item.value === value )!;
    assert && assert( listItemNode, `no item found for value: ${value}` );
    assert && assert( listItemNode instanceof ComboBoxListItemNode, 'invalid listItemNode' ); // eslint-disable-line phet/no-simple-type-checking-assertions
    return listItemNode;
  }

  /**
   * Gets the item in the ComboBox that currently has focus.
   */
  private getFocusedItemNode(): ComboBoxListItemNode<T> {
    const listItemNode = _.find( this.getAllListItemNodes(), ( listItemNode: ComboBoxListItemNode<T> ) => listItemNode.focused )!;
    assert && assert( listItemNode, 'no item found that has focus' );
    assert && assert( listItemNode instanceof ComboBoxListItemNode, 'invalid listItemNode' ); // eslint-disable-line phet/no-simple-type-checking-assertions
    return listItemNode;
  }

  /**
   * Focuses the ComboBoxListItemNode that corresponds to a specified value. If the item for that value is not
   * visible, focus is placed on the first visible item.
   */
  public focusListItemNode( value: T ): void {
    let listItemNode: ComboBoxListItemNode<T> | undefined = this.getListItemNode( value );

    // If the item Node is not visible, just place focus on the first available item.
    if ( !listItemNode.visible ) {
      listItemNode = _.find( this.getAllListItemNodes(), ( listItemNode: ComboBoxListItemNode<T> ) => listItemNode.visible );
    }

    if ( listItemNode ) {
      listItemNode.supplyOpenResponseOnNextFocus();
      listItemNode.focus();
    }
  }

  /**
   * voice the response from selecting a new item Node. The response will differ depending on if the selection
   * changed the Property.
   */
  private voiceOnNewSelection( newValue: T, oldValue: T, listItemNode: ComboBoxListItemNode<T> ): void {
    const responseOptions: SpeakingOptions = {
      nameResponse: listItemNode.voicingNameResponse,
      objectResponse: null,
      contextResponse: listItemNode.voicingContextResponse,
      hintResponse: null
    };
    if ( oldValue === newValue ) {

      // If there is no change in value, then there is no context response
      responseOptions.contextResponse = null;
    }

    // Voice through this node since the listItemNode is about to be hidden (setting it to voicingVisible:false). See https://github.com/phetsims/ratio-and-proportion/issues/474
    this.voiceOnSelectionNode.voicingSpeakResponse( responseOptions );
  }

  public static getMaxItemWidthProperty( nodes: Node[] ): TReadOnlyProperty<number> {
    const widthProperties = _.flatten( nodes.map( node => {
      const properties: TReadOnlyProperty<IntentionalAny>[] = [ node.boundsProperty ];
      if ( extendsWidthSizable( node ) ) {
        properties.push( node.isWidthResizableProperty );
        properties.push( node.minimumWidthProperty );
      }
      return properties;
    } ) );
    return DerivedProperty.deriveAny( widthProperties, () => {
      return Math.max( ...nodes.map( node => isWidthSizable( node ) ? node.minimumWidth || 0 : node.width ) );
    } );
  }

  public static getMaxItemHeightProperty( nodes: Node[] ): TReadOnlyProperty<number> {
    const heightProperties = nodes.map( node => node.boundsProperty );
    return DerivedProperty.deriveAny( heightProperties, () => {
      return Math.max( ...nodes.map( node => node.height ) );
    } );
  }
}

sun.register( 'ComboBoxListBox', ComboBoxListBox );