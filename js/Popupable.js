// Copyright 2020-2021, University of Colorado Boulder

/**
 * Popupable trait
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import ScreenView from '../../joist/js/ScreenView.js';
import gracefulBind from '../../phet-core/js/gracefulBind.js';
import inheritance from '../../phet-core/js/inheritance.js';
import merge from '../../phet-core/js/merge.js';
import FocusManager from '../../scenery/js/accessibility/FocusManager.js';
import Node from '../../scenery/js/nodes/Node.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

const Popupable = type => {
  assert && assert( _.includes( inheritance( type ), Node ), 'Only Node subtypes should mix Popupable' );

  return class extends type {

    constructor( options, ...args ) {
      super( ...args );

      options = merge( {

        showPopup: gracefulBind( 'phet.joist.sim.showPopup' ),
        hidePopup: gracefulBind( 'phet.joist.sim.hidePopup' ),

        isModal: true, // {boolean} modal popups prevent interaction with the rest of the sim while open

        // {Bounds2|null} - If desired, the layoutBounds that should be used for layout
        layoutBounds: null,

        tandem: Tandem.OPTIONAL,

        // pdom
        // {Node|null} - The Node that receives focus when the Popupable is shown. If null, focus is not set.
        focusOnShowNode: null,

        // {Node|null} - The Node that receives focus when the Popupable is closed. If null, focus will return
        // to the Node that had focus when the Dialog opened.
        focusOnHideNode: null
      }, options );

      assert && assert( typeof options.showPopup === 'function', 'showPopup is required, and must be provided if phet.joist.sim is not available.' );
      assert && assert( typeof options.hidePopup === 'function', 'hidePopup is required, and must be provided if phet.joist.sim is not available.' );

      // see https://github.com/phetsims/joist/issues/293
      assert && assert( options.isModal, 'Non-modal popups not currently supported' );

      // @public {Bounds2|null}
      this.layoutBounds = options.layoutBounds;

      // @private {Node|null}
      this.focusOnShowNode = options.focusOnShowNode;
      this.focusOnHideNode = options.focusOnHideNode;

      // @private {Node|null} - The Node to return focus to after the Popupable has been hidden. A reference
      // to this Node is saved when the Popupable is shown. By default focus is returned to Node that has focus
      // when the Popupable is open but can be overridden with focusOnHideNode.
      this.nodeWithFocusOnShow = null;

      // @public {Node} - The node provided to showPopup, with the transform applied
      this.popupParent = new Node( {
        children: [ this ]
      } );
      this.popupParent.show = this.show.bind( this );
      this.popupParent.hide = this.hide.bind( this );
      this.popupParent.layout = this.layout.bind( this );

      // @public {Property.<boolean>} - Whether the popup is being shown
      this.isShowingProperty = new BooleanProperty( false, {
        tandem: options.tandem.createTandem( 'isShowingProperty' ),
        phetioReadOnly: true
      } );

      this.isShowingProperty.lazyLink( isShowing => {
        if ( isShowing ) {
          options.showPopup( this.popupParent, options.isModal );
        }
        else {
          options.hidePopup( this.popupParent, options.isModal );
        }
      } );
    }

    /**
     * @public
     *
     * @param {Bounds2} bounds
     */
    layout( bounds ) {
      if ( this.layoutBounds ) {
        this.popupParent.matrix = ScreenView.getLayoutMatrix( this.layoutBounds, bounds );
      }
    }

    /**
     * @public
     */
    show() {

      // save a reference before setting isShowingProperty because listeners on the isShowingProperty may modify or
      // clear focus from FocusManager.pdomFocusedNode.
      this.nodeWithFocusOnShow = this.focusOnHideNode || FocusManager.pdomFocusedNode;
      this.isShowingProperty.value = true;

      // after it is shown, move focus to the focusOnShownNode, presumably moving focus into the Popupable content
      if ( this.focusOnShowNode && this.focusOnShowNode.focusable ) {
        this.focusOnShowNode.focus();
      }
    }

    /**
     * Hide the popup. If you create a new popup next time you show(), be sure to dispose this popup instead.
     * @public
     */
    hide() {
      this.isShowingProperty.value = false;

      // return focus to the Node that had focus when the Popupable was opened (or the focusOnHideNode if provided)
      if ( this.nodeWithFocusOnShow && this.nodeWithFocusOnShow.focusable ) {
        this.nodeWithFocusOnShow.focus();
      }
    }

    /**
     * Set the Node that receives focus when the Popupable is shown. If null, focus will not be placed on any
     * Node.
     * @public
     *
     * @param {Node|null} node
     */
    setFocusOnShowNode( node ) {
      assert && assert( node === null || node instanceof Node, 'setFocusOnShowNode requires an instance of a Node.' );
      this.focusOnShowNode = node;
    }

    /**
     * Set the Node that receives focus when the Popupable is hidden. If null, focus will not be set and
     * traversal will start over from the top of the document.
     * @public
     *
     * @param {Node|null} node
     */
    setFocusOnHideNode( node ) {
      assert && assert( node === null || node instanceof Node, 'setFocusOnHideNode requires an instance of a Node' );
      this.focusOnHideNode = node;
    }

    /**
     * Releases references
     * @public
     */
    dispose() {
      this.hide();

      this.isShowingProperty.dispose();

      super.dispose();
    }
  };
};

sun.register( 'Popupable', Popupable );

export default Popupable;