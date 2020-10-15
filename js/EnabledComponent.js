// Copyright 2020, University of Colorado Boulder

/**
 * Mixin that adds a settable Property that determines whether the Object is enabled or not. This includes support for
 * phet-io instrumentation and a variety of options to customize the enabled Property as well as how it is created.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import extend from '../../phet-core/js/extend.js';
import merge from '../../phet-core/js/merge.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

// constants
const DEFAULT_OPTIONS = {

  // {Property.<boolean>} if not provided, a Property will be created
  enabledProperty: null,

  // {boolean} initial value of enabledProperty if we create it, ignored if enabledProperty is provided
  enabled: true,

  // {*} options to enabledProperty if we create it, ignored if enabledProperty is provided
  enabledPropertyOptions: null,

  // phet-io
  tandem: Tandem.OPTIONAL
};

const ENABLED_PROPERTY_TANDEM_NAME = 'enabledProperty';

const EnabledComponent = {

  /**
   * @public
   *
   * @param {function} type - The type (constructor) whose prototype we'll modify.
   */
  mixInto: function( type ) {
    const proto = type.prototype;

    //TODO https://github.com/phetsims/sun/issues/638 boilerplate and does not detect inherited properties
    assert && assert( !proto.hasOwnProperty( 'setEnabled' ), 'do not want to overwrite setEnabled' );
    assert && assert( !proto.hasOwnProperty( 'getEnabled' ), 'do not want to overwrite getEnabled' );
    assert && assert( !proto.hasOwnProperty( 'enabled' ), 'do not want to overwrite enabled' );

    extend( proto, {

      /**
       * IMPORTANT: This must be called after the supertype constructor has been called. In es6 classes this is forced behavior, but
       * for older `inherit` style hierarchy, the developer must manually ensure this behavior.
       *
       * @param {Object} [options]
       */
      initializeEnabledComponent: function( options ) {

        options = merge( {}, DEFAULT_OPTIONS, options );

        // does this mixin own the enabledProperty?
        const ownsEnabledProperty = !options.enabledProperty;

        // @public
        assert && assert( this.enabledProperty === undefined, 'enabledProperty already exists' );
        this.enabledProperty = options.enabledProperty || new BooleanProperty( options.enabled, merge( {
          tandem: options.tandem.createTandem( ENABLED_PROPERTY_TANDEM_NAME ),
          phetioDocumentation: 'When disabled, the component is grayed out and cannot be interacted with.',
          phetioFeatured: true
        }, options.enabledPropertyOptions ) );

        // @private called by dispose
        this._disposeEnabledComponent = () => {
          ownsEnabledProperty && this.enabledProperty.dispose();
        };
      },

      /**
       * @public
       */
      disposeEnabledComponent: function() {
        this._disposeEnabledComponent();
      },

      /**
       * @public
       * @param {boolean} enabled
       */
      setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
      set enabled( value ) { this.setEnabled( value ); },

      /**
       * @public
       * @returns {boolean}
       */
      getEnabled: function() { return this.enabledProperty.value; },
      get enabled() { return this.getEnabled(); }
    } );
  }
};

// @protected - should not be needed outside of the mixin hierarchy
EnabledComponent.ENABLED_PROPERTY_TANDEM_NAME = ENABLED_PROPERTY_TANDEM_NAME;

sun.register( 'EnabledComponent', EnabledComponent );
export default EnabledComponent;