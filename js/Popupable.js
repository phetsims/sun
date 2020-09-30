// Copyright 2020, University of Colorado Boulder

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
import inherit from '../../phet-core/js/inherit.js';
import inheritance from '../../phet-core/js/inheritance.js';
import merge from '../../phet-core/js/merge.js';
import Node from '../../scenery/js/nodes/Node.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

const Popupable = type => {
  assert && assert( _.includes( inheritance( type ), Node ), 'Only Node subtypes should mix Popupable' );

  function Popupable( options, ...args ) {
    type.call( this, ...args );

    options = merge( {
      isModal: true, // {boolean} modal popups prevent interaction with the rest of the sim while open

      // {Bounds2|null} - If desired, the layoutBounds that should be used for layout
      layoutBounds: null,

      tandem: Tandem.OPTIONAL,
      phetioState: PhetioObject.DEFAULT_OPTIONS.phetioState
    }, options );

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
      phetioReadOnly: true,
      phetioState: options.phetioState // match the state transfer of the Popup
    } );

    this.isShowingProperty.lazyLink( isShowing => {
      if ( isShowing ) {
        window.phet.joist.sim.showPopup( this.popupParent, options.isModal );
      }
      else {
        window.phet.joist.sim.hidePopup( this.popupParent, options.isModal );
      }
    } );
  }

  inherit( type, Popupable, {
    /**
     * @public
     *
     * @param {number} width
     * @param {number} height
     */
    layout: function( width, height ) {
      if ( this.layoutBounds ) {
        this.popupParent.matrix = ScreenView.getLayoutMatrix( this.layoutBounds, width, height );
      }
    },

    /**
     * @public
     */
    show: function() {
      this.isShowingProperty.value = true;
    },

    /**
     * Hide the popup. If you create a new popup next time you show(), be sure to dispose this popup instead.
     * @public
     */
    hide: function() {
      this.isShowingProperty.value = false;
    },

    /**
     * Releases references
     * @public
     */
    dispose() {
      this.hide();

      this.isShowingProperty.dispose();

      type.prototype.dispose.call( this );
    }
  } );

  return Popupable;
};

sun.register( 'Popupable', Popupable );

export default Popupable;