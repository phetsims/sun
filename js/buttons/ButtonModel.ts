// Copyright 2014-2022, University of Colorado Boulder

/**
 * Base class for button models, which describe the behavior of buttons when users interact with them.  Property values
 * are set by an associated listener, see PressListener for details.
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import Property from '../../../axon/js/Property.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { PressListener, PressListenerOptions } from '../../../scenery/js/imports.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import EnabledComponent, { EnabledComponentOptions } from '../../../axon/js/EnabledComponent.js';
import sun from '../sun.js';
import Multilink, { UnknownMultilink } from '../../../axon/js/Multilink.js';
import { EnabledPropertyOptions } from '../../../axon/js/EnabledProperty.js';
import TEmitter from '../../../axon/js/TEmitter.js';

type SelfOptions = {

  // called on pointer down
  startCallback?: () => void;

  // called on pointer up, indicates whether the pointer was released over the button
  endCallback?: ( over: boolean ) => void;

  // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
  phetioState?: boolean;

  // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
  phetioReadOnly?: boolean;

  // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
  phetioFeatured?: boolean;
};

export type ButtonModelOptions = SelfOptions & EnabledComponentOptions;

export default class ButtonModel extends EnabledComponent {

  // Is the pointer over the button? Value is read-only.
  public readonly overProperty: Property<boolean>;

  // Is the pointer down?
  public readonly downProperty: Property<boolean>;

  // Is the button focused from the PDOM?
  public readonly focusedProperty: Property<boolean>;

  // This Property was added for a11y. It tracks whether or not the button should "look" down. This
  // will be true if downProperty is true or if an a11y click is in progress. For an a11y click, the listeners
  // are fired right away but the button will look down for as long as PressListener.a11yLooksPressedInterval.
  // See PressListener.click for more details.
  public readonly looksPressedProperty: Property<boolean>;

  // This Property was added for a11y. It tracks whether or not the button should "look" over. This
  // will be true if and PressListeners' looksOverProperty is true, see PressListener for that definition.
  public readonly looksOverProperty: Property<boolean>;

  // (read-only by users, read-write in subclasses) - emitter that is fired when sound should be produced
  public readonly produceSoundEmitter: TEmitter;

  // indicates that interaction was interrupted during a press. Valid until next press.
  public interrupted: boolean;

  // keep track of and store all listeners this model creates
  private listeners: PressListener[];

  // Links all of the looksPressedProperties from the listeners that were created
  // by this ButtonModel, and updates the looksPressedProperty accordingly. First Multilink is added when the
  // first listener is created. See this.createPressListener.
  private looksPressedMultilink: UnknownMultilink | null;

  // Links all of the looksOverProperties from the listeners that were created
  // by this ButtonModel, and updates the looksOverProperty accordingly. First Multilink is added when the
  // first listener is created. See this.createPressListener.
  private looksOverMultilink: UnknownMultilink | null;

  private readonly disposeButtonModel: () => void;

  public constructor( providedOptions?: ButtonModelOptions ) {

    const options = optionize<ButtonModelOptions, SelfOptions, EnabledComponentOptions>()( {
      startCallback: _.noop,
      endCallback: _.noop,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioState: PhetioObject.DEFAULT_OPTIONS.phetioState,
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
      phetioFeatured: PhetioObject.DEFAULT_OPTIONS.phetioFeatured
    }, providedOptions );

    // Set up enabledPropertyOptions for the enabledProperty that the mixin might create
    options.enabledPropertyOptions = combineOptions<EnabledPropertyOptions>( {

      // phet-io
      phetioState: options.phetioState,
      phetioReadOnly: options.phetioReadOnly,
      phetioDocumentation: 'When disabled, the button is grayed out and cannot be pressed',
      phetioFeatured: true
    }, options.enabledPropertyOptions! );

    super( options );

    // model Properties
    this.overProperty = new BooleanProperty( false );
    this.downProperty = new BooleanProperty( false, { reentrant: true } );
    this.focusedProperty = new BooleanProperty( false );
    this.looksPressedProperty = new BooleanProperty( false );
    this.looksOverProperty = new BooleanProperty( false );

    this.produceSoundEmitter = new Emitter();
    this.interrupted = false;
    this.listeners = [];

    // Links all of the looksPressedProperties from the listeners that were created
    // by this ButtonModel, and updates the looksPressedProperty accordingly. First Multilink is added when the
    // first listener is created. See this.createPressListener.
    this.looksPressedMultilink = null;

    // Links all of the looksOverProperties from the listeners that were created
    // by this ButtonModel, and updates the looksOverProperty accordingly. First Multilink is added when the
    // first listener is created. See this.createPressListener.
    this.looksOverMultilink = null;

    // Call startCallback on pointer down, endCallback on pointer up. Use lazyLink so they aren't called immediately.
    // No unlink needed since this button model owns the Property.
    this.downProperty.lazyLink( down => {
      if ( down ) {
        options.startCallback();
      }
      else {
        options.endCallback( this.looksOverProperty.get() );
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

    this.disposeButtonModel = () => {

      // This will unlink all listeners, causing potential issues if listeners try to unlink Properties afterwards
      this.overProperty.dispose();
      this.downProperty.dispose();
      this.produceSoundEmitter.dispose();

      this.looksPressedMultilink && this.looksPressedMultilink.dispose();
      this.looksOverMultilink && this.looksOverMultilink.dispose();

      this.listeners = [];
    };
  }

  public override dispose(): void {
    this.disposeButtonModel();
    super.dispose();
  }

  /**
   * Creates a PressListener that will handle changes to ButtonModel when the associated button Node is pressed.
   * The client is responsible for adding this PressListener to the associated button Node.
   */
  public createPressListener( options?: PressListenerOptions ): PressListener {

    options = combineOptions<PressListenerOptions>( {
      canStartPress: () => this.enabledProperty.value
    }, options );

    const pressListener = new PressListener( options );
    this.listeners.push( pressListener );

    // Link lazily in case client externally sets downProperty - don't update until the next press.  No unlink needed
    // because the pressListener is local.
    pressListener.isPressedProperty.lazyLink( isPressed => {

      // determine interrupted first so listeners on downProperty have access
      this.interrupted = pressListener.interrupted;
      this.downProperty.set( isPressed );
    } );
    pressListener.isOverProperty.lazyLink( this.overProperty.set.bind( this.overProperty ) );
    pressListener.isFocusedProperty.lazyLink( this.focusedProperty.set.bind( this.focusedProperty ) );

    // dispose the previous multilink in case we already created a PressListener with this model
    this.looksPressedMultilink && this.looksPressedMultilink.dispose();
    this.looksOverMultilink && this.looksOverMultilink.dispose();

    // the downProperty is included because it can be set externally, looksPressedProperty should update in this case
    const looksPressedProperties = this.listeners.map( listener => listener.looksPressedProperty );
    looksPressedProperties.push( this.downProperty );

    // assign a new Multilink (for disposal), and make sure that the button looks pressed when any of the
    // PressListeners created by this ButtonModel look pressed.
    this.looksPressedMultilink = Multilink.multilinkAny( looksPressedProperties, ( ...args: boolean[] ) => {
      this.looksPressedProperty.value = _.reduce( args, ( sum: boolean, newValue: boolean ) => sum || newValue, false );
    } );

    const looksOverProperties = this.listeners.map( listener => listener.looksOverProperty );

    // assign a new Multilink (for disposal), and make sure that the button looks over when any of the
    // PressListeners created by this ButtonModel look over. Note that this cannot be an arrow function
    // because its implementation relies on arguments.
    this.looksOverMultilink = Multilink.multilinkAny( looksOverProperties, ( ...args: boolean[] ) => {
      this.looksOverProperty.value = _.reduce( args, ( sum: boolean, newValue: boolean ) => sum || newValue, false );
    } );

    return pressListener;
  }
}

sun.register( 'ButtonModel', ButtonModel );
