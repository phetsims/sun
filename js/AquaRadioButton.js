// Copyright 2013-2020, University of Colorado Boulder

/**
 * Radio button with a pseudo-Aqua (Mac OS) look. See "options" comment for list of options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import FireListener from '../../scenery/js/listeners/FireListener.js';
import Circle from '../../scenery/js/nodes/Circle.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import multiSelectionSoundPlayerFactory from '../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';

// constants
const DEFAULT_RADIUS = 7;

class AquaRadioButton extends Node {

  /**
   * @param property
   * @param value the value that corresponds to this button, same type as property
   * @param {Node} node that will be vertically centered to the right of the button
   * @param {Object} [options]
   */
  constructor( property, value, node, options ) {

    options = merge( {
      cursor: 'pointer',
      enabled: true,
      selectedColor: 'rgb( 143, 197, 250 )', // color used to fill the button when it's selected
      deselectedColor: 'white', // color used to fill the button when it's deselected
      centerColor: 'black', // color used to fill the center of teh button when it's selected
      radius: DEFAULT_RADIUS, // radius of the button
      xSpacing: 8, // horizontal space between the button and the node
      stroke: 'black', // color used to stroke the outer edge of the button

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioComponentOptions: {
        visibleProperty: { phetioFeatured: true }
      },

      // {Playable} - sound generator, usually overridden when creating a group of these
      soundPlayer: multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( 0 ),

      // pdom
      tagName: 'input',
      inputType: 'radio',
      containerTagName: 'li',
      labelTagName: 'label',
      appendLabel: true,
      appendDescription: true,

      // {string|number|null} - Each button in a group of radio buttons must have the same 'name' attribute to be
      // considered a 'group' by the browser. Otherwise, arrow keys will navigate through all inputs of type radio in
      // the document
      a11yNameAttribute: null
    }, options );

    assert && assert( options.tandem instanceof Tandem, 'invalid tandem' );
    assert && assert( !options.tandem.supplied || options.tandem.name.endsWith( 'RadioButton' ),
      `AquaRadioButton tandem.name must end with RadioButton: ${options.tandem.phetioID}` );

    super();

    // @public (read-only)
    this.value = value;

    // @private - converted to an AXON/Property from a property to support PhET-iO
    this.enabledProperty = new BooleanProperty( options.enabled, {
      tandem: options.tandem.createTandem( 'enabledProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Determines whether the AquaRadioButton is enabled (pressable) or disabled (grayed-out)'
    } );

    // selected node creation
    const selectedNode = new Node();
    const innerCircle = new Circle( options.radius / 3, { fill: options.centerColor } );
    const outerCircleSelected = new Circle( options.radius, { fill: options.selectedColor, stroke: options.stroke } );

    // @private
    this.selectedCircleButton = new Node( {
      children: [ outerCircleSelected, innerCircle ]
    } );
    selectedNode.addChild( this.selectedCircleButton );
    selectedNode.addChild( node );
    node.left = outerCircleSelected.right + options.xSpacing;
    node.centerY = outerCircleSelected.centerY;

    // deselected node
    const deselectedNode = new Node();

    // @private
    this.deselectedCircleButton = new Circle( options.radius, {
      fill: options.deselectedColor,
      stroke: options.stroke
    } );
    deselectedNode.addChild( this.deselectedCircleButton );
    deselectedNode.addChild( node );
    node.left = this.deselectedCircleButton.right + options.xSpacing;
    node.centerY = this.deselectedCircleButton.centerY;

    //Add an invisible node to make sure the layout for selected vs deselected is the same
    const background = new Rectangle( selectedNode.bounds.union( deselectedNode.bounds ) );
    selectedNode.pickable = deselectedNode.pickable = false; // the background rectangle suffices

    this.addChild( background );
    this.addChild( selectedNode );
    this.addChild( deselectedNode );

    // sync control with model
    const syncWithModel = function( newValue ) {
      selectedNode.visible = ( newValue === value );
      deselectedNode.visible = !selectedNode.visible;
    };
    property.link( syncWithModel );

    // set property value on fire
    const fire = function() {
      property.set( value );
      options.soundPlayer.play();
    };
    const fireListener = new FireListener( {
      fire: fire,
      tandem: options.tandem.createTandem( 'fireListener' )
    } );
    this.addInputListener( fireListener );

    // pdom - input listener so that updates the state of the radio button with keyboard interaction
    const changeListener = {
      change: fire
    };
    this.addInputListener( changeListener );

    // pdom - Specify the default value for assistive technology. This attribute is needed in addition to
    // the 'checked' property to mark this element as the default selection since 'checked' may be set before
    // we are finished adding RadioButtons to the containing group, and the browser will remove the boolean
    // 'checked' flag when new buttons are added.
    if ( property.value === value ) {
      this.setAccessibleAttribute( 'checked', 'checked' );
    }

    // pdom - when the property changes, make sure the correct radio button is marked as 'checked' so that this button
    // receives focus on 'tab'
    const accessibleCheckedListener = newValue => {
      this.accessibleChecked = newValue === value;
    };
    property.link( accessibleCheckedListener );

    // pdom - every button in a group of radio buttons should have the same name, see options for more info
    if ( options.a11yNameAttribute !== null ) {
      this.setAccessibleAttribute( 'name', options.a11yNameAttribute );
    }

    this.mutate( options );

    this.enabledProperty.link( this.updateEnabled.bind( this ) );

    // @private
    this.disposeAquaRadioButton = () => {
      this.removeInputListener( fireListener );
      this.removeInputListener( changeListener );
      property.unlink( accessibleCheckedListener );
      property.unlink( syncWithModel );
      this.enabledProperty.dispose();

      // phet-io: Unregister listener
      fireListener.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'AquaRadioButton', this );
  }

  get enabled() { return this.getEnabled(); }

  set enabled( value ) { this.setEnabled( value ); }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeAquaRadioButton();
    super.dispose();
  }

  /**
   * Sets the enabled state.
   * @param {boolean} enabled
   * @public
   */
  setEnabled( enabled ) { this.enabledProperty.set( enabled ); }

  /**
   * Update settings when the enabled status changes.  This method is overrideable, for when subclasses need to
   * change the appearance of other components.
   * @public
   */
  updateEnabled() {
    this.opacity = this.enabled ? 1 : SunConstants.DISABLED_OPACITY;
    this.pickable = this.enabled; // NOTE: This is a side-effect. If you set pickable independently, it will be changed when you set enabled.
  }

  /**
   * Gets the enabled state
   * @returns {boolean}
   * @public
   */
  getEnabled() { return this.enabledProperty.get(); }
}

AquaRadioButton.DEFAULT_RADIUS = DEFAULT_RADIUS;

sun.register( 'AquaRadioButton', AquaRadioButton );
export default AquaRadioButton;