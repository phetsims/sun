// Copyright 2020, University of Colorado Boulder

/**
 * Trait for PhetioObjects that will add an enabledProperty and confirm its PhET-iO instrumentation is as expected.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import assertHasProperties from '../../phet-core/js/assertHasProperties.js';
import extend from '../../phet-core/js/extend.js';
import merge from '../../phet-core/js/merge.js';
import Tandem from '../../tandem/js/Tandem.js';
import EnabledComponent from './EnabledComponent.js';
import sun from './sun.js';

const EnabledPhetioObject = {

  /**
   * @trait {PhetioObject}
   * @mixes EnabledComponent
   * @public
   *
   * @param {function} type - The type (constructor) whose prototype we'll modify.
   */
  mixInto: function( type ) {
    const proto = type.prototype;

    // mixin general EnabledComponent logic (parent mixin)
    EnabledComponent.mixInto( type );

    extend( proto, {

      /**
       * @param {Object} [options]
       */
      initializeEnabledPhetioObject: function( options ) {

        // members of the PhetioObject API that are used by this trait
        assertHasProperties( this, [ 'isPhetioInstrumented', 'addLinkedElement', 'phetioFeatured' ] );

        options = merge( {
          tandem: Tandem.OPTIONAL
        }, options );

        // Does this trait own the enabledProperty? NOTE: enabledProperty cannot be defined in the above options merge because of existence
        // checks in EnabledComponent.js.
        const ownsEnabledProperty = !options.enabledProperty;

        this.initializeEnabledComponent( options );

        // This phet-io support only applies to instances of PhetioObject
        if ( !ownsEnabledProperty ) {
          assert && Tandem.PHET_IO_ENABLED && Tandem.errorOnFailedValidation() && this.isPhetioInstrumented() &&
          assert( !!options.enabledProperty.phetioFeatured === !!this.phetioFeatured,
            'provided enabledProperty must be phetioFeatured if this checkbox is' );

          // If enabledProperty was passed in, PhET-iO wrappers like Studio needs to know about that linkage
          this.enabledProperty.isPhetioInstrumented() && this.addLinkedElement( options.enabledProperty, {
            tandem: options.tandem.createTandem( EnabledComponent.ENABLED_PROPERTY_TANDEM_NAME )
          } );
        }
      },

      /**
       * @public
       */
      disposeEnabledPhetioObject: function() {
        this.disposeEnabledComponent();
      }
    } );
  }
};

sun.register( 'EnabledPhetioObject', EnabledPhetioObject );
export default EnabledPhetioObject;