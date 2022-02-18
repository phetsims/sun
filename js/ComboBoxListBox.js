// Copyright 2019-2022, University of Colorado Boulder

/**
 * The popup list box for a ComboBox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Action from '../../axon/js/Action.js';
import merge from '../../phet-core/js/merge.js';
import { KeyboardUtils } from '../../scenery/js/imports.js';
import { SceneryEvent } from '../../scenery/js/imports.js';
import { VBox } from '../../scenery/js/imports.js';
import multiSelectionSoundPlayerFactory from '../../tambo/js/multiSelectionSoundPlayerFactory.js';
import generalCloseSoundPlayer from '../../tambo/js/shared-sound-players/generalCloseSoundPlayer.js';
import generalOpenSoundPlayer from '../../tambo/js/shared-sound-players/generalOpenSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import ComboBoxListItemNode from './ComboBoxListItemNode.js';
import Panel from './Panel.js';
import sun from './sun.js';

class ComboBoxListBox extends Panel {

  /**
   * @param {Property} property
   * @param {ComboBoxItem[]} items
   * @param {function} hideListBoxCallback - called to hide the list box
   * @param {function():} focusButtonCallback - called to transfer focus to the combo box's button
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( property, items, hideListBoxCallback, focusButtonCallback, tandem, options ) {

    options = merge( {

      // {Color|string} fill for the highlight behind items in the list
      highlightFill: 'rgb( 245, 245, 245 )',

      // Panel options
      xMargin: 12,
      yMargin: 8,
      backgroundPickable: true,

      // Options that apply to every item Node created in the list
      comboBoxListItemNodeOptions: {},

      // pdom
      tagName: 'ul',
      ariaRole: 'listbox',
      groupFocusHighlight: true,
      focusable: true,

      // {SoundPlayer} - Sound generators for when combo box is opened and when it is closed with no change. Closing *with*
      // a change is covered by individual combo box items.
      openedSoundPlayer: generalOpenSoundPlayer,
      closedNoChangeSoundPlayer: generalCloseSoundPlayer,
      visiblePropertyOptions: { phetioReadOnly: true }

      // Not instrumented for PhET-iO because the list's position isn't valid until it has been popped up.
      // See https://github.com/phetsims/phet-io/issues/1102
    }, options );

    assert && assert( options.xMargin > 0 && options.yMargin > 0,
      `margins must be > 0, xMargin=${options.xMargin}, yMargin=${options.yMargin}` );

    //TODO sun#462 replace fireEmitter and selectionListener with a standard scenery listener
    // Pops down the list box and sets the property.value to match the chosen item.
    const fireAction = new Action( event => {

      const oldValue = property.value;

      const listItemNode = event.currentTarget;
      assert && assert( listItemNode instanceof ComboBoxListItemNode, 'expected a ComboBoxListItemNode' );

      // So that something related to the ComboBox has focus before changing Property value.
      focusButtonCallback();

      // set value based on which item was chosen in the list box
      property.value = listItemNode.item.value;

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
    const selectionListener = {

      up( event ) {
        fireAction.execute( event );
      },

      // Handle keyup on each item in the list box, for a11y.
      //TODO sun#447, scenery#931 we're using keyup because keydown fires continuously
      keyup: event => {
        if ( KeyboardUtils.isAnyKeyEvent( event.domEvent, [ KeyboardUtils.KEY_ENTER, KeyboardUtils.KEY_SPACE ] ) ) {
          fireAction.execute( event );
        }
      },

      // handle activation from an assistive device that may not use a keyboard (such as mobile VoiceOver)
      click: event => {
        fireAction.execute( event );
      }
    };

    // Compute max item dimensions
    const maxItemWidth = _.maxBy( items, item => item.node.width ).node.width;
    const maxItemHeight = _.maxBy( items, item => item.node.height ).node.height;

    // Uniform dimensions for all highlighted items in the list, highlight overlaps margin by 50%
    const highlightWidth = maxItemWidth + options.xMargin;
    const highlightHeight = maxItemHeight + options.yMargin;

    // Create a node for each item in the list, and attach a listener.
    const listItemNodes = []; // {ComboBoxListItemNode[]}
    items.forEach( ( item, index ) => {

      // Create the list item node
      const listItemNode = new ComboBoxListItemNode( item, highlightWidth, highlightHeight, merge( {
        align: options.align,
        highlightFill: options.highlightFill,
        highlightCornerRadius: options.cornerRadius,

        // highlight overlaps half of margins
        xMargin: 0.5 * options.xMargin,
        left: 0.5 * options.xMargin,
        top: ( 0.5 * options.yMargin ) + ( index * highlightHeight ),
        tandem: item.tandemName ? tandem.createTandem( item.tandemName ) : Tandem.OPTIONAL
      }, options.comboBoxListItemNodeOptions ) );
      listItemNodes.push( listItemNode );

      listItemNode.addInputListener( selectionListener );
    } );

    const content = new VBox( {
      spacing: 0,
      excludeInvisibleChildrenFromBounds: true,
      children: listItemNodes
    } );

    // Adjust margins to account for highlight overlap
    options.xMargin = options.xMargin / 2;
    options.yMargin = options.yMargin / 2;

    super( content, options );

    // variable for tracking whether the selected value was changed by the user
    let selectionWhenListBoxOpened;

    // Make a list of sound generators for the items, using defaults if nothing was provided.
    const itemSelectedSoundPlayers = items.map( item => {
      return item.soundPlayer ?
             item.soundPlayer :
             multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( items.indexOf( item ) );
    } );

    // sound generation
    this.visibleProperty.lazyLink( visible => {

      if ( visible ) {

        // play the 'opened' sound
        options.openedSoundPlayer.play();

        // keep track of what was selected when the list box was shown
        selectionWhenListBoxOpened = property.value;
      }
      else {

        // sound generation - assumes that the property value has been updated before this list box is hidden
        assert && assert( selectionWhenListBoxOpened !== undefined, 'no value for property when list box opened' );
        if ( selectionWhenListBoxOpened === property.value ) {
          options.closedNoChangeSoundPlayer.play();
        }
        else {
          const indexOfSelection = items.findIndex( item => item.value === property.value );
          itemSelectedSoundPlayers[ indexOfSelection ].play();
        }
      }
    } );

    // pdom listener for the entire list box
    this.addInputListener( {

      // When the list box gets focus, transfer focus to the ComboBoxListItemNode that matches property.value.
      focus: () => {
        if ( this.visible ) {
          const listItemNode = this.getListItemNode( property.value );
          listItemNode.supplyHintResponseOnNextFocus();
          listItemNode.focus();
        }
      },

      // Handle keydown
      keydown: event => {
        if ( KeyboardUtils.isAnyKeyEvent( event.domEvent, [ KeyboardUtils.KEY_ESCAPE, KeyboardUtils.KEY_TAB ] ) ) {

          // Escape and Tab hide the list box and return focus to the button
          hideListBoxCallback();
          focusButtonCallback();
        }
        else if ( KeyboardUtils.isAnyKeyEvent( event.domEvent, [ KeyboardUtils.KEY_DOWN_ARROW, KeyboardUtils.KEY_UP_ARROW ] ) ) {

          // prevent "native" behavior so that Safari doesn't make an error sound with arrow keys in
          // full screen mode, see #210
          event.domEvent.preventDefault();

          // Up/down arrow keys move the focus between items in the list box
          const direction = ( KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_DOWN_ARROW ) ) ? 1 : -1;
          const focusedItemIndex = this.visibleListItemNodes.indexOf( this.getFocusedItemNode() );
          assert && assert( focusedItemIndex > -1, 'how could we receive keydown without a focused list item?' );

          const nextIndex = focusedItemIndex + direction;
          this.visibleListItemNodes[ nextIndex ] && this.visibleListItemNodes[ nextIndex ].focus();

          // reserve for drag after focus has moved, as the change in focus will clear the intent on the pointer
          event.pointer.reserveForKeyboardDrag();
        }
        else if ( KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_HOME ) ) {
          this.visibleListItemNodes[ 0 ].focus();
        }
        else if ( KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_END ) ) {
          this.visibleListItemNodes[ this.visibleListItemNodes.length - 1 ].focus();
        }
      }
    } );

    // @private
    this.listItemNodes = listItemNodes;
    this.visibleListItemNodes = listItemNodes.slice();

    // @private
    this.disposeComboBoxListBox = () => {
      for ( let i = 0; i < listItemNodes; i++ ) {
        listItemNodes[ i ].dispose(); // to unregister tandem
      }
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeComboBoxListBox();
    super.dispose();
  }

  /**
   * Sets the visibility of one or more items in the listbox that correspond to a value. Assumes that each item
   * in the listbox has a unique value.
   * @param {*} value - the value associated with the ComboBoxItem
   * @param {boolean} visible
   * @public
   */
  setItemVisible( value, visible ) {
    this.getListItemNode( value ).visible = visible;
    this.visibleListItemNodes = _.filter( this.listItemNodes, itemNode => itemNode.visible );
  }

  /**
   * Is the item that corresponds to a value visible when the listbox is popped up?
   * @param {*} value
   * @returns {boolean}
   * @public
   */
  isItemVisible( value ) {
    return this.getListItemNode( value ).visible;
  }

  /**
   * Gets the ComboBoxListItemNode that corresponds to a specified value. Assumes that values are unique.
   * @param {*} value
   * @returns {ComboBoxListItemNode}
   * @private
   */
  getListItemNode( value ) {
    const listItemNode = _.find( this.listItemNodes, listItemNode => listItemNode.item.value === value );
    assert && assert( listItemNode, `no item found for value: ${value}` );
    assert && assert( listItemNode instanceof ComboBoxListItemNode, 'invalid listItemNode' );
    return listItemNode;
  }

  /**
   * Gets the item in the ComboBox that currently has focus.
   * @returns {ComboBoxListItemNode}
   * @private
   */
  getFocusedItemNode() {
    const listItemNode = _.find( this.listItemNodes, listItemNode => listItemNode.focused );
    assert && assert( listItemNode, 'no item found that has focus' );
    assert && assert( listItemNode instanceof ComboBoxListItemNode, 'invalid listItemNode' );
    return listItemNode;
  }

  /**
   * @private
   * @param {*} newValue
   * @param {*} oldValue
   * @param {ComboBoxListItemNode} listItemNode
   */
  voiceOnNewSelection( newValue, oldValue, listItemNode ) {
    const responseOptions = {
      objectResponse: null,
      hintResponse: null
    };
    if ( oldValue === newValue ) {

      // If there is no change in value, then there is no context response
      responseOptions.contextResponse = null;
    }
    this.getListItemNode( newValue ).voicingSpeakFullResponse( responseOptions );
  }
}

sun.register( 'ComboBoxListBox', ComboBoxListBox );
export default ComboBoxListBox;