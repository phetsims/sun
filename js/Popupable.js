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

        tandem: Tandem.OPTIONAL
      }, options );

      assert && assert( typeof options.showPopup === 'function', 'showPopup is required, and must be provided if phet.joist.sim is not available.' );
      assert && assert( typeof options.hidePopup === 'function', 'hidePopup is required, and must be provided if phet.joist.sim is not available.' );

      // see https://github.com/phetsims/joist/issues/293
      assert && assert( options.isModal, 'Non-modal popups not currently supported' );

      // @public {Bounds2|null}
      this.layoutBounds = options.layoutBounds;

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
      this.isShowingProperty.value = true;
    }

    /**
     * Hide the popup. If you create a new popup next time you show(), be sure to dispose this popup instead.
     * @public
     */
    hide() {
      this.isShowingProperty.value = false;
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