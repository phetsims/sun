// Copyright 2013-2015, University of Colorado Boulder

/**
 * Base class for radio buttons.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var sun = require( 'SUN/sun' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var Tandem = require( 'TANDEM/Tandem' );

  // phet-io modules
  var TRadioButton = require( 'ifphetio!PHET_IO/types/sun/TRadioButton' );

  /**
   * @param {Property} property
   * @param {*} value the value that corresponds to this button, same type as property
   * @param {Node} selectedNode node that will be displayed when the button is selected
   * @param {Node} deselectedNode node that will be displayed when the button is deselected
   * @param {Object} [options]
   * @constructor
   */
  function RadioButton( property, value, selectedNode, deselectedNode, options ) {

    options = _.extend( {
      cursor: 'pointer',
      tandem: Tandem.tandemRequired(),
      enabled: true,
      accessibleLabel: '' // invisible label for the radio button, for a11y
    }, options );

    assert && assert( !options.phetioValueType, 'phetioValueType should be specified in the property, not RadioButton options' );

    Tandem.validateOptions( options ); // The tandem is required when brand==='phet-io'

    var self = this;
    Node.call( this );

    this._enabled = options.enabled; // @private

    // Emitters for the PhET-iO data stream
    this.startedCallbacksForFiredEmitter = new Emitter();
    this.endedCallbacksForFiredEmitter = new Emitter();

    //Add an invisible node to make sure the layout for selected vs deselected is the same
    var background = new Rectangle( selectedNode.bounds.union( deselectedNode.bounds ) );
    selectedNode.pickable = deselectedNode.pickable = false; // the background rectangle suffices

    this.addChild( background );
    this.addChild( selectedNode );
    this.addChild( deselectedNode );

    // sync control with model
    var syncWithModel = function( newValue ) {
      selectedNode.visible = ( newValue === value );
      deselectedNode.visible = !selectedNode.visible;
    };
    property.link( syncWithModel );

    // set property value on fire
    var fire = function() {
      self.startedCallbacksForFiredEmitter.emit1( value );
      property.set( value );
      self.endedCallbacksForFiredEmitter.emit();
    };
    var buttonListener = new ButtonListener( {
      fire: fire
    } );
    this.addInputListener( buttonListener );

    this.mutate( options );

    options.tandem.addInstance( this, TRadioButton( property.phetioValueType ) );

    this.disposeRadioButton = function() {
      options.tandem.removeInstance( this );
      self.removeInputListener( buttonListener );
      property.unlink( syncWithModel );
    };

    // outfit a11y
    this.accessibleContent = {
      createPeer: function( accessibleInstance ) {
        var trail = accessibleInstance.trail;
        var uniqueId = trail.getUniqueId();
        var parentId = accessibleInstance.parent.id;

        // The element in the parallel DOM needs to look like this:
        // <input type="radio" role="radio" name="parentId" id="radio-button-id" aria-label="accessibleLabel">

        // create the dom element as an input of type radio
        var domElement = document.createElement( 'input' );
        domElement.id = 'radio-button-' + uniqueId;
        domElement.setAttribute( 'type', 'radio' );
        domElement.setAttribute( 'role', 'radio' );
        domElement.setAttribute( 'name', parentId ); // required to distinguish from other groups
        domElement.setAttribute( 'aria-label', options.accessibleLabel );

        // listen for keyboard events and fire model
        domElement.addEventListener( 'click', function() {
          fire();
        } );

        // link the 'checked' 'aria-checked' attribute to the property value
        property.link( function( newValue ) {
          var checked = newValue === value;
          domElement.setAttribute( 'aria-checked', checked );
          domElement.checked = checked;
        } );

        return new AccessiblePeer( accessibleInstance, domElement );
      }
    };
  }

  sun.register( 'RadioButton', RadioButton );

  return inherit( Node, RadioButton, {

    // @public - Provide dispose() on the prototype for ease of subclassing.
    dispose: function() {
      this.disposeRadioButton();
    },

    /**
     * Sets the enabled state
     * @param {boolean} enabled
     * @public
     */
    setEnabled: function( enabled ) {
      this._enabled = enabled;
      this.opacity = enabled ? 1 : 0.3;
      this.pickable = enabled; // NOTE: This is a side-effect. If you set pickable independently, it will be changed when you set enabled.
    },
    set enabled( value ) { this.setEnabled( value ); },

    /**
     * Gets the enabled state
     * @returns {boolean}
     * @public
     */
    getEnabled: function() {
      return this._enabled;
    },
    get enabled() { return this.getEnabled(); }
  } );
} );
