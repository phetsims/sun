// Copyright 2019, University of Colorado Boulder

/**
 * The popup list box for a ComboBox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Action = require( 'AXON/Action' );
  const ActionIO = require( 'AXON/ActionIO' );
  const ComboBoxListItemNode = require( 'SUN/ComboBoxListItemNode' );
  const Event = require( 'SCENERY/input/Event' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const Panel = require( 'SUN/Panel' );
  const PhetioObject = require( 'TANDEM/PhetioObject' );
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
        focusable: true,

        // Not instrumented for PhET-iO because the list's location isn't valid until it has been popped up.
        // See https://github.com/phetsims/phet-io/issues/1102
        // TODO: we need this for accessibility in the sonification wrapper, see https://github.com/phetsims/sun/issues/496
        tandem: tandem
      }, options );

      assert && assert( options.xMargin > 0 && options.yMargin > 0,
        'margins must be > 0, xMargin=' + options.xMargin + ', yMargin=' + options.yMargin );

      //TODO sun#462 replace fireEmitter and selectionListener with a standard scenery listener
      // Pops down the list box and sets the property.value to match the chosen item.
      const firedAction = new Action( event => {

        const listItemNode = event.currentTarget;
        assert && assert( listItemNode instanceof ComboBoxListItemNode, 'expected a ComboBoxListItemNode' );

        // hide the list
        hideListBoxCallback();

        // prevent nodes (eg, controls) behind the list from receiving the event
        event.abort();

        // set value based on which item was chosen in the list box
        property.value = listItemNode.item.value;
      }, {

        // phet-io
        tandem: tandem.createTandem( 'firedAction' ),

        //TODO https://github.com/phetsims/phet-io/issues/1426, use type:EventIO, phetioDataStream:false
        phetioType: ActionIO( [ { name: 'event', type: VoidIO, validator: { valueType: Event } } ] ),
        phetioEventType: PhetioObject.EventType.USER
      } );

      //TODO sun#462 replace fireEmitter and selectionListener with a standard scenery listener
      // Handles selection from the list box.
      const selectionListener = {

        up( event ) {
          firedAction.execute( event );
        },

        // Handle keyup on each item in the list box, for a11y.
        //TODO sun#447, scenery#931 we're using keyup because keydown fires continuously
        keyup: event => {
          if ( KeyboardUtil.KEY_ENTER === event.domEvent.keyCode || KeyboardUtil.KEY_SPACE === event.domEvent.keyCode ) {
            firedAction.execute( event );
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
          highlightCornerRadius: options.cornerRadius,

          // highlight overlaps half of margins
          xMargin: 0.5 * options.xMargin,
          left: 0.5 * options.xMargin,
          top: ( 0.5 * options.yMargin ) + ( index * highlightHeight ),
          tandem: item.tandemName ? tandem.createTandem( item.tandemName ) : Tandem.optional
        } );
        listItemNodes.push( listItemNode );

        listItemNode.addInputListener( selectionListener );
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

      // a11y listener for the entire list box
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
          var keyCode = event.domEvent.keyCode;
          if ( keyCode === KeyboardUtil.KEY_ESCAPE || keyCode === KeyboardUtil.KEY_TAB ) {

            // Escape and Tab hide the list box and return focus to the button
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