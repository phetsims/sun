// Copyright 2019, University of Colorado Boulder

/**
 * The popup listbox for a ComboBox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  const ComboBoxListItemNode = require( 'SUN/ComboBoxListItemNode' );
  const Emitter = require( 'AXON/Emitter' );
  const EmitterIO = require( 'AXON/EmitterIO' );
  const Event = require( 'SCENERY/input/Event' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const Panel = require( 'SUN/Panel' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const VoidIO = require( 'TANDEM/types/VoidIO' );

  class ComboBoxListBox extends Panel {

    /**
     * @param {Property} property
     * @param {ComboBoxItem[]} items
     * @param {ComboBoxButton} button  TODO sun#445 would be nice if listbox didn't need to know about button
     * @param {function} hideCallback  TODO sun#445 would be nice if we didn't need hideCallback
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( property, items, button, hideCallback, tandem, options ) {

      options = _.extend( {

        // {Color|string} fill for the highlight behind items in the list
        highlightFill: 'rgb( 245, 245, 245 )',

        // Panel options
        xMargin: 12,
        yMargin: 8,

        // a11y
        tagName: 'ul',
        ariaRole: 'listbox',
        groupFocusHighlight: true,
        focusable: true //TODO sun#314 why is this needed? ComboBoxListBox is never given focus

        // Not instrumented for PhET-iO because the list's location isn't valid until it has been popped up.
        // See https://github.com/phetsims/phet-io/issues/1102

      }, options );

      // TODO sun#405 It seems it would be better to use FireListener on each ComboBoxListItemNode
      const firedEmitter = new Emitter( {
        argumentTypes: [ { validValue: Event } ],
        listener: event => {

          const listItemNode = event.currentTarget;
          assert && assert( listItemNode instanceof ComboBoxListItemNode, 'expected a ComboBoxListItemNode' );

          // a11y - keep this PDOM attribute in sync
          this.updateActiveDescendant( listItemNode );

          hideCallback();
          listItemNode.setHighlightVisible( false );
          event.abort(); // prevent nodes (eg, controls) behind the list from receiving the event

          property.value = listItemNode.item.value;
        },

        // phet-io
        tandem: tandem.createTandem( 'firedEmitter' ),
        phetioType: EmitterIO( [ { name: 'event', type: VoidIO } ] ) // TODO sun#405 Should type be EventIO or DOMEventIO?
      } );

      // listener that we'll attach to each item in the list
      const itemListener = {

        enter( event ) {
          event.currentTarget.setHighlightVisible( true );
        },

        exit( event ) {
          event.currentTarget.setHighlightVisible( false );
        },

        down( event ) {
          event.abort(); // prevent click-to-dismiss on the list
        },
        
        up( event ) {
          firedEmitter.emit( event );
        },

        // Handle keydown on each item in the listbox, for a11y
        keydown: event => {

          if ( KeyboardUtil.KEY_ENTER === event.domEvent.keyCode || KeyboardUtil.KEY_SPACE === event.domEvent.keyCode ) {

            assert && assert( event.currentTarget instanceof ComboBoxListItemNode, 'currentTarget has wrong type' );
            const listItemNode = event.currentTarget;

            //TODO address sun#447, KEY_ENTER hides list then immediately shows list
            // fromA11yEnterKey = KeyboardUtil.KEY_ENTER === event.domEvent.keyCode; // only for the enter key
            property.value = listItemNode.item.value;
            hideCallback();

            // a11y - keep this PDOM attribute in sync
            this.updateActiveDescendant( listItemNode );
          }
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

          // highlight overlaps half of margins
          xMargin: 0.5 * options.xMargin,
          left: 0.5 * options.xMargin,
          top: ( 0.5 * options.yMargin ) + ( index * highlightHeight ),
          tandem: item.tandemName ? tandem.createTandem( item.tandemName ) : Tandem.optional,
          a11yLabel: item.a11yLabel
        } );
        listItemNodes.push( listItemNode );

        listItemNode.addInputListener( itemListener );
      } );

      const content = new VBox( {
        spacing: 0,
        children: listItemNodes
      } );

      // Adjust margins to account for highlight overlap
      options.xMargin = options.xMargin / 2;
      options.yMargin = options.yMargin / 2;

      super( content, options );

      //TODO sun#314 say more here
      // a11y - the list is labeled by the button's label
      this.addAriaLabelledbyAssociation( {
        otherNode: button,
        otherElementName: AccessiblePeer.LABEL_SIBLING,
        thisElementName: AccessiblePeer.PRIMARY_SIBLING
      } );

      // @public {ComboBoxListItemNode|null} the ComboBoxListItemNode that has focus
      this.focusedItemNode = null;

      // Handle keydown on the entire listbox, for a11y
      this.addInputListener( {
        keydown: event => {
          var keyCode = event.domEvent.keyCode;
          if ( keyCode === KeyboardUtil.KEY_ESCAPE || keyCode === KeyboardUtil.KEY_TAB ) {
            hideCallback();
          }
          else if ( keyCode === KeyboardUtil.KEY_DOWN_ARROW || keyCode === KeyboardUtil.KEY_UP_ARROW ) {

            // Up/down arrow keys move the focus between items in the listbox
            const direction = ( keyCode === KeyboardUtil.KEY_DOWN_ARROW ) ? 1 : -1;
            for ( let i = 0; i < listItemNodes.length; i++ ) {
              if ( this.focusedItemNode === listItemNodes[ i ] ) {
                const nextListItemNode = listItemNodes[ i + direction ];
                if ( nextListItemNode ) {

                  //TODO sun#314 say more here
                  // a11y - keep this PDOM attribute in sync
                  this.updateActiveDescendant( nextListItemNode );

                  // set focus for next item
                  this.focusedItemNode = nextListItemNode;
                  this.focusedItemNode.focus();
                  break;
                }
              }
            }
          }
        }
      } );

      // Update focus when the listbox's visibility changes.
      this.on( 'visibility', () => { this.updateFocus(); } );

      // @private
      this.disposeComboBoxListBox = () => {
        for ( let i = 0; i < listItemNodes; i++ ) {
          listItemNodes[ i ].dispose(); // to unregister tandem
        }
      };

      // @private needed by methods
      this.property = property;
      this.listItemNodes = listItemNodes;
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
     * Updates the focus to match the currently selected value.
     * @private
     */
    updateFocus() {
      if ( this.visible ) {

        // listbox is visible, focus on selected item
        for ( let i = 0; i < this.listItemNodes.length; i++ ) {
          const listItemNode = this.listItemNodes[ i ];
          if ( this.property.value === listItemNode.item.value ) {
            this.focusedItemNode = listItemNode;
            this.focusedItemNode.focus();
          }
        }
      }
    }

    // TODO: sun#314 we don't likely need this anymore
    /**
     * Updates this attribute on the listbox.
     * This changes as you interact with the comboBox, as well as when an item is selected.
     * @param {ComboBoxListItemNode} listItemNode
     * @private
     */
    updateActiveDescendant( listItemNode ) {

      // overwrite purposefully
      this.activeDescendantAssociations = [ {
        otherNode: listItemNode,
        thisElementName: AccessiblePeer.PRIMARY_SIBLING,
        otherElementName: AccessiblePeer.PRIMARY_SIBLING
      } ];
    }
  }

  return sun.register( 'ComboBoxListBox', ComboBoxListBox );
} );