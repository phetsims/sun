// Copyright 2014-2020, University of Colorado Boulder

/**
 * Base class for button models, which describe the behavior of buttons when users interact with them.  Property values
 * are set by an associated listener, see PressListener for details.
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import Property from '../../../axon/js/Property.js';
import merge from '../../../phet-core/js/merge.js';
import PressListener from '../../../scenery/js/listeners/PressListener.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import EnabledComponent from '../EnabledComponent.js';
import sun from '../sun.js';

class ButtonModel {

  /**
   * @mixes EnabledComponent
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      // {function()} called on pointer down
      startCallback: _.noop,
      // {function(over:boolean)} called on pointer up, @param {boolean} over - indicates whether the pointer was released over the button
      endCallback: _.noop,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioState: PhetioObject.DEFAULT_OPTIONS.phetioState, // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly, // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioFeatured: PhetioObject.DEFAULT_OPTIONS.phetioFeatured // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
    }, options );

    // Set up enabledPropertyOptions for the enabledProperty that the mixin might create
    options.enabledPropertyOptions = merge( {

      // phet-io
      phetioState: options.phetioState,
      phetioReadOnly: options.phetioReadOnly,
      phetioDocumentation: 'When disabled, the button is grayed out and cannot be pressed',
      phetioFeatured: true
    }, options.enabledPropertyOptions );

    // Initialize the mixin, which defines this.enabledProperty.
    this.initializeEnabledComponent( options );

    // model Properties
    this.overProperty = new BooleanProperty( false ); // @public - Is the pointer over the button?
    this.downProperty = new BooleanProperty( false, { reentrant: true } ); // @public - Is the pointer down?

    // @protected (read-only) - Is the button being clicked because of accessibility (like keyboard)?
    // See PressListener.a11yClickingProperty
    this.a11yClickingProperty = new BooleanProperty( false );

    // @public - This Property was added for a11y. It tracks whether or not the button should "look" down. This
    // will be true if downProperty is true or if an a11y click is in progress. For an a11y click, the listeners
    // are fired right away but the button will look down for as long as PressListener.a11yLooksPressedInterval.
    // See PressListener.click for more details.
    this.looksPressedProperty = new BooleanProperty( false );

    // @public (read-only by users, read-write in subclasses) - emitter that is fired when sound should be produced
    this.produceSoundEmitter = new Emitter();

    // @public (read-only) - indicates that interaction was interrupted during a press. Valid until next press.
    this.interrupted = false;

    // @private - keep track of and store all listeners this model creates
    this.listeners = [];

    // @private {Multilink|null} - Links all of the looksPressedProperties from the listeners that were created
    // by this ButtonModel, and updates the looksPressedProperty accordingly. First Multilink is added when the
    // first listener is created. See this.createPressListener.
    this.looksPressedMultilink = null;

    // startCallback on pointer down, endCallback on pointer up. lazyLink so they aren't called immediately.
    this.downProperty.lazyLink( down => {
      if ( down ) {
        options.startCallback();
      }
      else {
        options.endCallback( this.overProperty.get() );
      }
    } );

    // Interrupt input listeners when enabled is set to false. This is the equivalent of Node.interruptSubtreeInput,
    // but ButtonModel is not a Node, so we have to interrupt each listener. See https://github.com/phetsims/sun/issues/642.
    this.enabledProperty.link( enabled => {
      if ( !enabled ) {
        for ( let i = 0; i < this.listeners.length; i++ ) {
          const listener = this.listeners[ i ];
          listener.interrupt && listener.interrupt();
        }
      }
    } );

    // @private
    this.disposeButtonModel = () => {

      // This will unlink all listeners, causing potential issues if listeners try to unlink Properties afterwards
      this.overProperty.dispose();
      this.downProperty.dispose();
      this.produceSoundEmitter.dispose();

      this.looksPressedMultilink && this.looksPressedMultilink.dispose();

      this.listeners = [];
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeButtonModel();
    this.disposeEnabledComponent();
  }

  /**
   * is the button currently firing because of accessibility?
   * @public (a11y)
   * @returns {boolean}
   */
  isA11yClicking() {
    return this.a11yClickingProperty.get();
  }

  /**
   * Creates a PressListener that will handle changes to ButtonModel when the associated button Node is pressed.
   * The client is responsible for adding this PressListener to the associated button Node.
   * @param {Object} [options]
   * @returns {PressListener}
   * @public
   */
  createPressListener( options ) {

    options = merge( {
      phetioDocumentation: 'Indicates when the button has been pressed or released',
      canStartPress: () => this.enabledProperty.value
    }, options );

    const pressListener = new PressListener( options );
    this.listeners.push( pressListener );

    // link lazily in case client externally sets downProperty - don't update until the next press
    pressListener.isPressedProperty.lazyLink( isPressed => {

      // determine interrupted first so listeners on downProperty have access
      this.interrupted = pressListener.interrupted;
      this.downProperty.set( isPressed );
    } );
    pressListener.isOverProperty.lazyLink( this.overProperty.set.bind( this.overProperty ) );
    pressListener.a11yClickingProperty.link( this.a11yClickingProperty.set.bind( this.a11yClickingProperty ) );

    // dispose the previous multilink in case we already created a PressListener with this model
    this.looksPressedMultilink && this.looksPressedMultilink.dispose();

    const looksPressedProperties = this.listeners.map( function( listener ) { return listener.looksPressedProperty; } );
    looksPressedProperties.push( this.downProperty );

    // assign a new Multilink (for disposal), and make sure that the button looks pressed when any of the
    // PressListeners created by this ButtonModel look pressed. Note that this cannot be an arrow function
    // because its implementation relies on arguments.
    const self = this;
    this.looksPressedMultilink = Property.multilink( looksPressedProperties, function() {
      self.looksPressedProperty.value = _.reduce( arguments, ( sum, newValue ) => sum || newValue, false );
    } );

    return pressListener;
  }
}

EnabledComponent.mixInto( ButtonModel );

sun.register( 'ButtonModel', ButtonModel );
export default ButtonModel;