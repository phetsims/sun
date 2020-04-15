// Copyright 2020, University of Colorado Boulder

/**
 * Trait for Nodes that will add an enabledProperty and wire it up accordingly.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import assertHasProperties from '../../phet-core/js/assertHasProperties.js';
import extend from '../../phet-core/js/extend.js';
import merge from '../../phet-core/js/merge.js';
import EnabledPhetioObject from './EnabledPhetioObject.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';

const EnabledNode = {

  /**
   * @public
   * @mixes EnabledPhetioObject
   * @trait {Node}
   *
   * @param {function} type - The type (constructor) whose prototype we'll modify.
   */
  mixInto: function( type ) {
    const proto = type.prototype;

    // mixin parent logic
    EnabledPhetioObject.mixInto( type );

    extend( proto, {

      /**
       * @param {Object} [options]
       */
      initializeEnabledNode: function( options ) {

        // members of the Node API that are used by this trait
        assertHasProperties( this, [ 'interruptSubtreeInput', 'opacity', 'pickable', 'cursor' ] );

        options = merge( {
          disabledOpacity: SunConstants.DISABLED_OPACITY
        }, options );

        // validate options
        assert && assert( options.disabledOpacity >= 0 && options.disabledOpacity <= 1,
          'invalid disabledOpacity: ' + options.disabledOpacity );

        // this call defines enabledProperty
        this.initializeEnabledPhetioObject( options );

        const cursor = this.cursor;
        const enabledListener = enabled => {
          this.interruptSubtreeInput();
          this.pickable = enabled;
          this.opacity = enabled ? 1.0 : options.disabledOpacity;

          // handle cursor by supporting setting back to what the cursor was when component was made disabled.
          this.cursor = enabled ? cursor : 'default';
        };
        this.enabledProperty.link( enabledListener );

        // @private
        this._disposeEnabledNode = () => {
          this.enabledProperty.unlink( enabledListener );
        };
      },

      /**
       * @public
       */
      disposeEnabledNode: function() {
        this._disposeEnabledNode();
        this.disposeEnabledPhetioObject();
      }
    } );
  }
};

sun.register( 'EnabledNode', EnabledNode );
export default EnabledNode;