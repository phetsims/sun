// Copyright 2020, University of Colorado Boulder

/**
 * Mixin for UI components that provides general features that apply to each one, like an enabledProperty interface.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import extend from '../../phet-core/js/extend.js';
import merge from '../../phet-core/js/merge.js';
import Node from '../../scenery/js/nodes/Node.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
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
       * IMPORTANT: This must be called after the supertype constructor has been called. In es6 classes this is forced behavior, but
       * for older `inherit` style hierarchy, the developer must manually ensure this behavior.
       *
       * @param {Object} [options]
       */
      initializeEnabledComponent: function( options ) {

        options = merge( {}, DEFAULT_OPTIONS, options );

        // validate options
        assert && assert( !( options.enabledProperty && options.enabledPropertyOptions ),
          'enabledProperty and enabledPropertyOptions are mutually exclusive' );
        assert && assert( options.disabledOpacity >= 0 && options.disabledOpacity <= 1,
          'invalid disabledOpacity: ' + options.disabledOpacity );

        const mixedIntoNode = this instanceof Node;
        const mixedIntoPhetioObject = this instanceof PhetioObject;

        // does this mixin own the enabledProperty?
        const ownsEnabledProperty = !options.enabledProperty;

        // This phet-io support only applies to instances of PhetioObject
        if ( !ownsEnabledProperty && mixedIntoPhetioObject ) {
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

        const cursor = mixedIntoNode ? this.cursor : null;
        const enabledListener = enabled => {

          // handle Node specific logic only if this instance is a Node.
          if ( mixedIntoNode ) {
            this.interruptSubtreeInput();
            this.pickable = enabled;
            this.opacity = enabled ? 1.0 : options.disabledOpacity;

            // handle cursor by supporting setting back to what the cursor was when component was made disabled.
            this.cursor = enabled ? cursor : 'default';
          }
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