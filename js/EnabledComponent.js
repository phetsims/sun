// Copyright 2020, University of Colorado Boulder

/**
 * Mixin for UI components that provides general features that apply to each one, like an enabledProperty interface.
 *
 * TODO: THIS FILE IS UNDER ACTIVE DEVELOPMENT, SEE https://github.com/phetsims/sun/issues/257
 *
 * TODO: can sun buttons use this? I don't think so since their enabledProperty is in their model. Would we ever want
 * TODO: logic in this file to be specific to SCENERY/Node?
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import extend from '../../phet-core/js/extend.js';
import merge from '../../phet-core/js/merge.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';
import Tandem from '../../tandem/js/Tandem.js';

// constants
// TODO: maybe provide a default value for a custom made enabledProperty like in AquaRadioButton `enabled`?
const DEFAULT_OPTIONS = {
  enabledProperty: null, // {BooleanProperty} initialized in mixin if not provided
  enabledPropertyOptions: null, // TODO: we support this in Slider.js and ButtonModel.js, do so here?
  disabledOpacity: SunConstants.DISABLED_OPACITY,
  tandem: Tandem.OPTIONAL
};
const ENABLED_PROPERTY_TANDEM_NAME = 'enabledProperty';

const EnabledComponent = {

  /**
   * @public
   * @param {function} type - The type (constructor) whose prototype we'll modify.
   */
  mixInto: function( type ) {
    const proto = type.prototype;

    assert && assert( !proto.hasOwnProperty( 'setEnabled' ), 'do not want to overwrite' );
    assert && assert( !proto.hasOwnProperty( 'getEnabled' ), 'do not want to overwrite' );
    assert && assert( !proto.hasOwnProperty( 'enabled' ), 'do not want to overwrite' );

    extend( proto, {

      /**
       * @param {Object} [options]
       */
      initializeEnabledComponent: function( options ) {

        options = merge( {}, DEFAULT_OPTIONS, options );

        // validate options
        assert && assert( !( options.enabledProperty && options.enabledPropertyOptions ),
          'enabledProperty and enabledPropertyOptions are mutually exclusive' );
        assert && assert( options.disabledOpacity >= 0 && options.disabledOpacity <= 1,
          'invalid disabledOpacity: ' + options.disabledOpacity );

        // does this instance own enabledProperty?
        const ownsEnabledProperty = !options.enabledProperty;

        if ( !ownsEnabledProperty ) {
          assert && Tandem.PHET_IO_ENABLED && Tandem.errorOnFailedValidation() && this.isPhetioInstrumented() &&
          assert( !!options.enabledProperty.phetioFeatured === !!this.phetioFeatured,
            'provided enabledProperty must be phetioFeatured if this checkbox is' );

          // If enabledProperty was passed in, PhET-iO wrappers like Studio needs to know about that linkage
          this.addLinkedElement( options.enabledProperty, {
            tandem: options.tandem.createTandem( ENABLED_PROPERTY_TANDEM_NAME )
          } );
        }

        // @public
        this.enabledProperty = options.enabledProperty || new BooleanProperty( true, merge( {
          tandem: options.tandem.createTandem( ENABLED_PROPERTY_TANDEM_NAME ),
          phetioDocumentation: 'When disabled, the component is grayed out and cannot be interacted with.',
          phetioFeatured: true
        }, options.enabledPropertyOptions ) );

        const enabledListener = enabled => {
          // TODO: interrupt subtree like in Slider? Also related to scenery#218 in NumberSpinner.
          // TODO: set cursor like in Slider?
          this.pickable = enabled;
          this.opacity = enabled ? 1.0 : options.disabledOpacity;
        };
        this.enabledProperty.link( enabledListener );

        // @private called by dispose
        this._disposeEnabledComponent = function() {
          this.enabledProperty.unlink( enabledListener );
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

sun.register( 'EnabledComponent', EnabledComponent );
export default EnabledComponent;