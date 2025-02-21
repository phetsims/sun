// Copyright 2022-2025, University of Colorado Boulder

/**
 * Popupable trait
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import type Property from '../../axon/js/Property.js';
import type Bounds2 from '../../dot/js/Bounds2.js';
import ScreenView from '../../joist/js/ScreenView.js';
import gracefulBind from '../../phet-core/js/gracefulBind.js';
import optionize from '../../phet-core/js/optionize.js';
import type Constructor from '../../phet-core/js/types/Constructor.js';
import type IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import type PickOptional from '../../phet-core/js/types/PickOptional.js';
import { getPDOMFocusedNode } from '../../scenery/js/accessibility/pdomFocusProperty.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import sun from './sun.js';

type SelfOptions = {

  // Don't use PopupableNode here (it creates... a lot of type issues and circularity)
  showPopup?: ( popup: Node, isModal: boolean ) => void;
  hidePopup?: ( popup: Node, isModal: boolean ) => void;

  // modal popups prevent interaction with the rest of the sim while open
  isModal?: boolean;

  // If desired, the layoutBounds that should be used for layout
  layoutBounds?: Bounds2 | null;

  // The Node that receives focus when the Popupable is shown. If null, focus is not set.
  focusOnShowNode?: Node | null;

  // The Node that receives focus when the Popupable is closed. If null, focus will return
  // to the Node that had focus when the Dialog opened.
  focusOnHideNode?: Node | null;

  // When true, no modal show/hide feature will be supported. This is a way of opting out of the Popupable feature
  // altogether for this runtime.
  disableModals?: boolean;
};
type ParentOptions = PickOptional<NodeOptions, 'tandem'>;
export type PopupableOptions = SelfOptions & ParentOptions;

type TPopupable = {
  readonly layoutBounds: Bounds2 | null;
  readonly popupParent: Node;
  readonly isShowingProperty: Property<boolean>;
  layout( bounds: Bounds2 ): void;

  // @mixin-protected - made public for use in the mixin only
  shouldShowPopup(): boolean;

  show(): void;
  hide(): void;

  // @mixin-protected - made public for use in the mixin only
  get focusOnHideNode(): Node | null;
};

const Popupable = <SuperType extends Constructor<Node>>( Type: SuperType, optionsArgPosition: number ): SuperType & Constructor<TPopupable> => {

  return class extends Type implements TPopupable {

    public readonly layoutBounds: Bounds2 | null;

    private readonly _focusOnShowNode: Node | null;
    private readonly _focusOnHideNode: Node | null;

    // The Node to return focus to after the Popupable has been hidden. A reference to this Node is saved when
    // the Popupable is shown. By default, focus is returned to Node that has focus when the Popupable is open
    // but can be overridden with `options.focusOnHideNode`.
    private _nodeToFocusOnHide: Node | null;

    // The node provided to showPopup, with the transform applied
    public readonly popupParent: Node;

    private readonly disableModals: boolean;
    private readonly isModal: boolean;

    // Whether the popup is being shown
    public readonly isShowingProperty: Property<boolean>;

    // Support the same signature as the type we mix into.  However, we also have our own options, which we assume
    // are passed in the last arg.
    public constructor( ...args: IntentionalAny[] ) {
      super( ...args );

      const providedOptions = ( args[ optionsArgPosition ] || {} ) as PopupableOptions;

      // `config` is required for Popupable, to work well with ...args but all fields of the config are optional
      const requiredConfig = args[ args.length - 1 ];
      assert && assert( requiredConfig !== undefined, 'config object is required for Popupable.' );

      const showPopup = gracefulBind( 'phet.joist.sim.showPopup' ) as Exclude<PopupableOptions[ 'showPopup' ], undefined>;
      const hidePopup = gracefulBind( 'phet.joist.sim.hidePopup' ) as Exclude<PopupableOptions[ 'hidePopup' ], undefined>;

      const options = optionize<PopupableOptions, SelfOptions, ParentOptions>()( {
        showPopup: showPopup,
        hidePopup: hidePopup,
        isModal: true,
        layoutBounds: null,
        focusOnShowNode: null,
        focusOnHideNode: null,
        disableModals: _.get( window, 'phet.chipper.queryParameters.disableModals' ) || false
      }, providedOptions );

      // see https://github.com/phetsims/joist/issues/293
      assert && assert( options.isModal, 'Non-modal popups not currently supported' );

      this.layoutBounds = options.layoutBounds;
      this._focusOnShowNode = options.focusOnShowNode;
      this.disableModals = options.disableModals;
      this.isModal = options.isModal;
      this._focusOnHideNode = options.focusOnHideNode;
      this._nodeToFocusOnHide = null;
      this.popupParent = new PopupParentNode( this, {
        show: this.show.bind( this ),
        hide: this.hide.bind( this ),
        layout: this.layout.bind( this )
      } );

      this.isShowingProperty = new BooleanProperty( false, {
        tandem: options.tandem?.createTandem( 'isShowingProperty' ),
        phetioReadOnly: true,
        phetioFeatured: true
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

    public layout( bounds: Bounds2 ): void {
      if ( this.layoutBounds ) {
        this.popupParent.matrix = ScreenView.getLayoutMatrix( this.layoutBounds, bounds );
      }
    }

    // Provide a chance of not showing, see disableModals
    // @mixin-protected - made public for use in the mixin only
    public shouldShowPopup(): boolean {
      const optOut = this.isModal && this.disableModals;
      return !optOut;
    }

    public show(): void {
      if ( !this.shouldShowPopup() ) {
        return;
      }

      // save a reference before setting isShowingProperty because listeners on the isShowingProperty may modify or
      // clear focus from getPDOMFocusedNode().
      this._nodeToFocusOnHide = this._focusOnHideNode || getPDOMFocusedNode();
      this.isShowingProperty.value = true;

      // after it is shown, move focus to the focusOnShownNode, presumably moving focus into the Popupable content
      if ( this._focusOnShowNode && this._focusOnShowNode.focusable ) {
        this._focusOnShowNode.focus();
      }
    }

    /**
     * Hide the popup. If you create a new popup next time you show(), be sure to dispose this popup instead.
     */
    public hide(): void {
      this.interruptSubtreeInput();

      this.isShowingProperty.value = false;

      // return focus to the Node that had focus when the Popupable was opened (or the focusOnHideNode if provided)
      if ( this._nodeToFocusOnHide && this._nodeToFocusOnHide.focusable ) {
        this._nodeToFocusOnHide.focus();
      }
    }

    // @mixin-protected - made public for use in the mixin only
    public get focusOnHideNode(): Node | null {
      return this._focusOnHideNode;
    }

    /**
     * Releases references
     */
    public override dispose(): void {
      this.hide();

      this.isShowingProperty.dispose();

      super.dispose();
    }
  };
};

type PopupableParentNodeSelfOptions = {
  show: () => void;
  hide: () => void;
  layout: ( bounds: Bounds2 ) => void;
};
type PopupableParentNodeOptions = PopupableParentNodeSelfOptions & NodeOptions;

class PopupParentNode extends Node {

  public readonly show: PopupableParentNodeSelfOptions[ 'show' ];
  public readonly hide: PopupableParentNodeSelfOptions[ 'hide' ];
  public readonly layout: PopupableParentNodeSelfOptions[ 'layout' ];

  public constructor( popupableNode: Node, providedOptions: PopupableParentNodeOptions ) {

    const options = optionize<PopupableParentNodeOptions, PopupableParentNodeSelfOptions, NodeOptions>()( {
      children: [ popupableNode ]
    }, providedOptions );

    super( options );

    this.show = options.show;
    this.hide = options.hide;
    this.layout = options.layout;
  }
}

export type PopupableNode = Node & TPopupable;

sun.register( 'Popupable', Popupable );

export default Popupable;