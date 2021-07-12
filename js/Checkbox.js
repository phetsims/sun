// Copyright 2013-2021, University of Colorado Boulder

/**
 * Checkbox is a typical checkbox UI component.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Action from '../../axon/js/Action.js';
import Property from '../../axon/js/Property.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import validate from '../../axon/js/validate.js';
import Matrix3 from '../../dot/js/Matrix3.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import Voicing from '../../scenery/js/accessibility/voicing/Voicing.js';
import FireListener from '../../scenery/js/listeners/FireListener.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import SceneryConstants from '../../scenery/js/SceneryConstants.js';
import checkEmptySolidShape from '../../sherpa/js/fontawesome-4/checkEmptySolidShape.js';
import checkSquareOSolidShape from '../../sherpa/js/fontawesome-4/checkSquareOSolidShape.js';
import checkboxCheckedSoundPlayer from '../../tambo/js/shared-sound-players/checkboxCheckedSoundPlayer.js';
import checkboxUncheckedSoundPlayer from '../../tambo/js/shared-sound-players/checkboxUncheckedSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

// constants
const BOOLEAN_VALIDATOR = { valueType: 'boolean' };
const SHAPE_MATRIX = Matrix3.createFromPool( 0.025, 0, 0, 0, -0.025, 0, 0, 0, 1 ); // to create a unity-scale icon
const uncheckedShape = checkEmptySolidShape.transformed( SHAPE_MATRIX );
const checkedShape = checkSquareOSolidShape.transformed( SHAPE_MATRIX );

class Checkbox extends Node {

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @param {Object} [options]
   * @mixes {Voicing}
   */
  constructor( content, property, options ) {

    assert && assert( content instanceof Node, 'invalid content' );
    assert && assert( property instanceof Property || property instanceof TinyProperty, 'invalid property' );
    validate( property.value, BOOLEAN_VALIDATOR );

    options = merge( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkboxColor: 'black',
      checkboxColorBackground: 'white',
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioEventType: EventType.USER,
      phetioLinkProperty: true, // whether a link to the checkbox's Property is created
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true, // opt into default PhET-iO instrumented enabledProperty

      // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,

      // {Playable} - sound generators
      checkedSoundPlayer: checkboxCheckedSoundPlayer,
      uncheckedSoundPlayer: checkboxUncheckedSoundPlayer,

      // pdom
      tagName: 'input',
      inputType: 'checkbox',
      appendDescription: true
    }, options );

    super();

    // voicing - initialize the Trait
    this.initializeVoicing();

    // @private - sends out notifications when the checkbox is toggled.
    const toggleAction = new Action( () => {
      property.value = !property.value;
      validate( property.value, BOOLEAN_VALIDATOR );
      if ( property.value ) {
        options.checkedSoundPlayer.play();
      }
      else {
        options.uncheckedSoundPlayer.play();
      }
    }, {
      parameters: [],
      tandem: options.tandem.createTandem( 'toggleAction' ),
      phetioDocumentation: 'Emits when user input causes the checkbox to toggle, emitting a single arg: ' +
                           'the new boolean value of the checkbox state.',
      phetioReadOnly: true, // interoperability should be done through the Property, this is just for the data stream event.
      phetioEventType: EventType.USER
    } );

    // @private - Create the background.  Until we are creating our own shapes, just put a rectangle behind the font
    // awesome checkbox icons.
    this.backgroundNode = new Rectangle( 0, -options.boxWidth, options.boxWidth * 0.95, options.boxWidth * 0.95,
      options.boxWidth * 0.2, options.boxWidth * 0.2, {
        fill: options.checkboxColorBackground
      } );

    // @private
    this.uncheckedNode = new Path( uncheckedShape, {
      fill: options.checkboxColor
    } );
    const iconScale = options.boxWidth / this.uncheckedNode.width;
    this.uncheckedNode.scale( iconScale );

    // @private
    this.checkedNode = new Path( checkedShape, {
      scale: iconScale,
      fill: options.checkboxColor
    } );

    // @private
    this.checkboxNode = new Node( { children: [ this.backgroundNode, this.checkedNode, this.uncheckedNode ] } );

    this.addChild( this.checkboxNode );
    this.addChild( content );

    content.left = this.checkedNode.right + options.spacing;
    content.centerY = this.checkedNode.centerY;

    // put a rectangle on top of everything to prevent dead zones when clicking
    this.addChild( new Rectangle( this.left, this.top, this.width, this.height ) );

    content.pickable = false; // since there's a pickable rectangle on top of content

    // interactivity
    const fireListener = new FireListener( {
      fire: () => toggleAction.execute(),
      tandem: options.tandem.createTandem( 'fireListener' )
    } );
    this.addInputListener( fireListener );

    // sync with property
    const checkboxCheckedListener = checked => {
      this.checkedNode.visible = checked;
      this.uncheckedNode.visible = !checked;
      this.pdomChecked = checked;
    };
    property.link( checkboxCheckedListener );

    // Apply additional options
    this.mutate( options );

    // pdom - to prevent a bug with NVDA and Firefox where the label sibling receives two click events, see
    // https://github.com/phetsims/gravity-force-lab/issues/257
    this.setExcludeLabelSiblingFromInput();

    // must be after the Checkbox is instrumented
    options.phetioLinkProperty && this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Checkbox', this );

    // @private
    this.disposeCheckbox = () => {

      fireListener.dispose();

      if ( property.hasListener( checkboxCheckedListener ) ) {
        property.unlink( checkboxCheckedListener );
      }

      // Private to Checkbox, but we need to clean up tandem.
      toggleAction.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeCheckbox();
    super.dispose();
  }

  /**
   * Sets the background color of the checkbox.
   * @param {Color|String} value
   * @public
   */
  setCheckboxColorBackground( value ) { this.backgroundNode.fill = value; }

  set checkboxColorBackground( value ) { this.setCheckboxColorBackground( value ); }

  /**
   * Gets the background color of the checkbox.
   * @returns {Color|String}
   * @public
   */
  getCheckboxColorBackground() { return this.backgroundNode.fill; }

  get checkboxColorBackground() { return this.getCheckboxColorBackground(); }

  /**
   * Sets the color of the checkbox.
   * @param {Color|String} value
   * @public
   */
  setCheckboxColor( value ) { this.checkedNode.fill = this.uncheckedNode.fill = value; }

  set checkboxColor( value ) { this.setCheckboxColor( value ); }

  /**
   * Gets the color of the checkbox.
   * @returns {Color|String}
   * @public
   */
  getCheckboxColor() { return this.checkedNode.fill; }

  get checkboxColor() { return this.getCheckboxColor(); }
}

Voicing.compose( Checkbox );

sun.register( 'Checkbox', Checkbox );
export default Checkbox;