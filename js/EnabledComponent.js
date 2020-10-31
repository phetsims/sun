// Copyright 2020, University of Colorado Boulder

/**
 * Base class that defines a settable Property that determines whether the Object is enabled or not. This includes
 * support for phet-io instrumentation and a variety of options to customize the enabled Property as well as how it is
 * created.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import EnabledProperty from '../../axon/js/EnabledProperty.js';
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

class EnabledComponent {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {}, DEFAULT_OPTIONS, options );

    // does this mixin own the enabledProperty?
    const ownsEnabledProperty = !options.enabledProperty;

    // @public
    this.enabledProperty = options.enabledProperty || new EnabledProperty( options.enabled, merge( {
      tandem: options.tandem.createTandem( EnabledProperty.TANDEM_NAME )
    }, options.enabledPropertyOptions ) );

    // @private - called by dispose
    this.disposeEnabledComponent = () => {
      ownsEnabledProperty && this.enabledProperty.dispose();
    };
  }

  /**
   * @public
   * @param {boolean} enabled
   */
  setEnabled( enabled ) { this.enabledProperty.value = enabled; }

  // @public
  set enabled( value ) { this.setEnabled( value ); }

  /**
   * @public
   * @returns {boolean}
   */
  isEnabled() { return this.enabledProperty.value; }

  // @public
  get enabled() { return this.isEnabled(); }

  // @public
  dispose() {
    this.disposeEnabledComponent();
  }
}

sun.register( 'EnabledComponent', EnabledComponent );
export default EnabledComponent;