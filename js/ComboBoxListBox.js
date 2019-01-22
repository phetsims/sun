// Copyright 2019, University of Colorado Boulder

/**
 * The popup list box for a ComboBox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
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
     * @param {function} hideListBoxCallback - called to hide the list box
     * @param {function} focusButtonCallback - called to transfer focus to the combo box's button
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( property, items, hideListBoxCallback, focusButtonCallback, tandem, options ) {

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
        focusable: true

        // Not instrumented for PhET-iO because the list's location isn't valid until it has been popped up.
        // See https://github.com/phetsims/phet-io/issues/1102

      }, options );

      // TODO sun#405 It seems it would be better to use FireListener on each ComboBoxListItemNode
      const firedEmitter = new Emitter( {
        argumentTypes: [ { validValue: Event } ],
        listener: event => {

          const listItemNode = event.currentTarget;
          assert && assert( listItemNode instanceof ComboBoxListItemNode, 'expected a ComboBoxListItemNode' );

          hideListBoxCallback();
          listItemNode.setHighlightVisible( false );
          event.abort(); // prevent nodes (eg, controls) behind the list from receiving the event

          property.value = listItemNode.item.value;
        },

        // phet-io
        tandem: tandem.createTandem( 'firedEmitter' ),
        phetioType: EmitterIO( [ { name: 'event', type: VoidIO } ] ) // TODO sun#405 Should type be EventIO or DOMEventIO?
      } );

      // listener that we'll attach to each ComboBoxListItemNode (each item in the list)
      const listItemNodeListener = {

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

        // Handle keyup on each item in the list box, for a11y.
        //TODO scenery#931 we're currently using keyup because of a general problem with keydown firing continuously
        keyup: event => {

          if ( KeyboardUtil.KEY_ENTER === event.domEvent.keyCode || KeyboardUtil.KEY_SPACE === event.domEvent.keyCode ) {

            assert && assert( event.currentTarget instanceof ComboBoxListItemNode, 'currentTarget has wrong type' );
            const listItemNode = event.currentTarget;

            property.value = listItemNode.item.value;
            hideListBoxCallback();
            focusButtonCallback();
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
          tandem: item.tandemName ? tandem.createTandem( item.tandemName ) : Tandem.optional
        } );
        listItemNodes.push( listItemNode );

        listItemNode.addInputListener( listItemNodeListener );
      } );

      const content = new VBox( {
        spacing: 0,
        children: listItemNodes
      } );

      // Adjust margins to account for highlight overlap
      options.xMargin = options.xMargin / 2;
      options.yMargin = options.yMargin / 2;

      super( content, options );

      // @public {ComboBoxListItemNode|null} the ComboBoxListItemNode that has focus
      this.focusedItemNode = null;

      // Handle keydown on the entire list box, for a11y
      this.addInputListener( {

        // When we get focus, transfer focus to the ComboBoxListItemNode that matches property.value.
        focus: event => {
          if ( this.visible ) {
            for ( let i = 0; i < this.listItemNodes.length; i++ ) {
              const listItemNode = this.listItemNodes[ i ];
              if ( this.property.value === listItemNode.item.value ) {
                this.focusedItemNode = listItemNode;
                this.focusedItemNode.focus();
                break;
              }
            }
          }
        },

        keydown: event => {
          var keyCode = event.domEvent.keyCode;
          if ( keyCode === KeyboardUtil.KEY_ESCAPE || keyCode === KeyboardUtil.KEY_TAB ) {
            hideListBoxCallback();
            focusButtonCallback();
          }
          else if ( keyCode === KeyboardUtil.KEY_DOWN_ARROW || keyCode === KeyboardUtil.KEY_UP_ARROW ) {

            // Up/down arrow keys move the focus between items in the list box
            const direction = ( keyCode === KeyboardUtil.KEY_DOWN_ARROW ) ? 1 : -1;
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
        }
      } );

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
  }

  return sun.register( 'ComboBoxListBox', ComboBoxListBox );
} );