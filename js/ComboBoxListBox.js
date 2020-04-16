// Copyright 2019-2020, University of Colorado Boulder

/**
 * The popup list box for a ComboBox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Action from '../../axon/js/Action.js';
import merge from '../../phet-core/js/merge.js';
import KeyboardUtils from '../../scenery/js/accessibility/KeyboardUtils.js';
import SceneryEvent from '../../scenery/js/input/SceneryEvent.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import ComboBoxListItemNode from './ComboBoxListItemNode.js';
import Panel from './Panel.js';
import sun from './sun.js';

class ComboBoxListBox extends Panel {

  /**
   * @param {Property} property
   * @param {ComboBoxItem[]} items
   * @param {function} hideListBoxCallback - called to hide the list box
   * @param {function} focusButtonCallback - called to transfer focus to the combo box's button
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

      // pdom
      tagName: 'ul',
      ariaRole: 'listbox',
      groupFocusHighlight: true,
      focusable: true,

      // Not instrumented for PhET-iO because the list's location isn't valid until it has been popped up.
      // See https://github.com/phetsims/phet-io/issues/1102
      // TODO: we need this for accessibility in the sonification wrapper, see https://github.com/phetsims/sun/issues/496
      tandem: tandem
    }, options );

    // Use this pattern so that passed in phetioComponentOptions are not blown away.
    // List box visibility, opacity, and pickability is controlled by the combo box, and should not be controlled
    // through the PhET-iO API.
    PhetioObject.mergePhetioComponentOptions( { phetioReadOnly: true }, options );

    assert && assert( options.xMargin > 0 && options.yMargin > 0,
      'margins must be > 0, xMargin=' + options.xMargin + ', yMargin=' + options.yMargin );

    //TODO sun#462 replace fireEmitter and selectionListener with a standard scenery listener
    // Pops down the list box and sets the property.value to match the chosen item.
    const fireAction = new Action( event => {

      const listItemNode = event.currentTarget;
      assert && assert( listItemNode instanceof ComboBoxListItemNode, 'expected a ComboBoxListItemNode' );

      // hide the list
      hideListBoxCallback();

      // prevent nodes (eg, controls) behind the list from receiving the event
      event.abort();

      // set value based on which item was chosen in the list box
      property.value = listItemNode.item.value;
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
        if ( KeyboardUtils.KEY_ENTER === event.domEvent.keyCode || KeyboardUtils.KEY_SPACE === event.domEvent.keyCode ) {
          fireAction.execute( event );
          focusButtonCallback();
        }
      },

      // handle activation from an assistive device that may not use a keyboard (such as mobile VoiceOver)
      click: event => {
        fireAction.execute( event );
        focusButtonCallback();
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
      const listItemNode = new ComboBoxListItemNode( item, highlightWidth, highlightHeight, {
        align: options.align,
        highlightFill: options.highlightFill,
        highlightCornerRadius: options.cornerRadius,

        // highlight overlaps half of margins
        xMargin: 0.5 * options.xMargin,
        left: 0.5 * options.xMargin,
        top: ( 0.5 * options.yMargin ) + ( index * highlightHeight ),
        tandem: item.tandemName ? tandem.createTandem( item.tandemName ) : Tandem.OPTIONAL
      } );
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

    // @public {ComboBoxListItemNode|null} the ComboBoxListItemNode that has focus
    this.focusedItemNode = null;

    // pdom listener for the entire list box
    this.addInputListener( {

      // When the list box gets focus, transfer focus to the ComboBoxListItemNode that matches property.value.
      focus: event => {
        if ( this.visible ) {
          for ( let i = 0; i < listItemNodes.length; i++ ) {
            const listItemNode = listItemNodes[ i ];
            if ( property.value === listItemNode.item.value ) {
              this.focusedItemNode = listItemNode;
              this.focusedItemNode.focus();
              break;
            }
          }
        }
      },

      // Handle keydown
      keydown: event => {
        const keyCode = event.domEvent.keyCode;
        if ( keyCode === KeyboardUtils.KEY_ESCAPE || keyCode === KeyboardUtils.KEY_TAB ) {

          // Escape and Tab hide the list box and return focus to the button
          hideListBoxCallback();
          focusButtonCallback();
        }
        else if ( keyCode === KeyboardUtils.KEY_DOWN_ARROW || keyCode === KeyboardUtils.KEY_UP_ARROW ) {

          // prevent "native" behavior so that Safari doesn't make an error sound with arrow keys in
          // full screen mode, see #210
          event.domEvent.preventDefault();

          // Up/down arrow keys move the focus between items in the list box
          const direction = ( keyCode === KeyboardUtils.KEY_DOWN_ARROW ) ? 1 : -1;
          for ( let i = 0; i < listItemNodes.length; i++ ) {
            if ( this.focusedItemNode === listItemNodes[ i ] ) {
              const nextListItemNode = listItemNodes[ i + direction ];
              if ( nextListItemNode ) {

                // set focus for next item
                this.focusedItemNode = nextListItemNode;
                this.focusedItemNode.focus();
                break;
              }
            }
          }
        }
        else if ( keyCode === KeyboardUtils.KEY_HOME ) {
          this.focusedItemNode = listItemNodes[ 0 ];
          this.focusedItemNode.focus();
        }
        else if ( keyCode === KeyboardUtils.KEY_END ) {
          this.focusedItemNode = listItemNodes[ listItemNodes.length - 1 ];
          this.focusedItemNode.focus();
        }
      }
    } );

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
}

sun.register( 'ComboBoxListBox', ComboBoxListBox );
export default ComboBoxListBox;