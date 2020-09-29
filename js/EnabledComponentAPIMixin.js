// Copyright 2020, University of Colorado Boulder

/**
 * PhET-iO API mixin EnabledComponent
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import PropertyAPI from '../../axon/js/PropertyAPI.js';
import Property from '../../axon/js/Property.js';
import merge from '../../phet-core/js/merge.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import sun from './sun.js';

const EnabledComponentAPIMixin = Type => {
  return class extends Type {

    /**
     * @param {Object} [options]
     */
    constructor( options ) {
      assert && assert( arguments.length === 0 || arguments.length === 1, '0 or 1 args expected' );

      options = merge( {
        enabledPropertyOptions: {
          phetioFeatured: true,
          phetioType: Property.PropertyIO( BooleanIO )
        }
      }, options );

      super( options );

      this.enabledProperty = new PropertyAPI( options.enabledPropertyOptions );
    }
  };
};

sun.register( 'EnabledComponentAPIMixin', EnabledComponentAPIMixin );
export default EnabledComponentAPIMixin;