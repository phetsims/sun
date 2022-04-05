// Copyright 2013-2022, University of Colorado Boulder

/**
 * Checkbox is a typical checkbox UI component.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetioAction from '../../tandem/js/PhetioAction.js';
import validate from '../../axon/js/validate.js';
import Matrix3 from '../../dot/js/Matrix3.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import { FireListener, IPaint, Node, Path, Rectangle, SceneryConstants, Voicing, VoicingOptions } from '../../scenery/js/imports.js';
import checkEmptySolidShape from '../../sherpa/js/fontawesome-4/checkEmptySolidShape.js';
import checkSquareOSolidShape from '../../sherpa/js/fontawesome-4/checkSquareOSolidShape.js';
import checkboxCheckedSoundPlayer from '../../tambo/js/shared-sound-players/checkboxCheckedSoundPlayer.js';
import checkboxUncheckedSoundPlayer from '../../tambo/js/shared-sound-players/checkboxUncheckedSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import optionize from '../../phet-core/js/optionize.js';
import sun from './sun.js';
import ISoundPlayer from '../../tambo/js/ISoundPlayer.js';
import Utterance, { IAlertable } from '../../utterance-queue/js/Utterance.js';
import IProperty from '../../axon/js/IProperty.js';

// constants
const BOOLEAN_VALIDATOR = { valueType: 'boolean' };
const SHAPE_MATRIX = Matrix3.pool.create( 0.025, 0, 0, 0, -0.025, 0, 0, 0, 1 ); // to create a unity-scale icon
const uncheckedShape = checkEmptySolidShape.transformed( SHAPE_MATRIX );
const checkedShape = checkSquareOSolidShape.transformed( SHAPE_MATRIX );

type SelfOptions = {
  spacing?: number;  // spacing between box and content
  boxWidth?: number; // width (and height) of the box
  checkboxColor?: IPaint;
  checkboxColorBackground?: IPaint;

  // pointer areas
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;

  // sounds
  checkedSoundPlayer?: ISoundPlayer;
  uncheckedSoundPlayer?: ISoundPlayer;

  // Utterances to be spoken with a screen reader after the checkbox is pressed. Also used for the voicingContextResponse.
  checkedContextResponse?: IAlertable;
  uncheckedContextResponse?: IAlertable;

  // whether a PhET-iO link to the checkbox's Property is created
  phetioLinkProperty?: boolean;
};

export type CheckboxOptions = SelfOptions & VoicingOptions;

export default class Checkbox extends Voicing( Node, 0 ) {

  private readonly backgroundNode: Rectangle;
  private readonly checkedNode: Path;
  private readonly uncheckedNode: Path;
  private readonly disposeCheckbox: () => void;

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @param providedOptions
   * @mixes {Voicing}
   */
  constructor( content: Node, property: IProperty<boolean>, providedOptions?: CheckboxOptions ) {

    const options = optionize<CheckboxOptions, SelfOptions, VoicingOptions, 'tandem'>( {

      // CheckboxOptions
      spacing: 5,
      boxWidth: 21,
      checkboxColor: 'black',
      checkboxColorBackground: 'white',
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,
      checkedSoundPlayer: checkboxCheckedSoundPlayer,
      uncheckedSoundPlayer: checkboxUncheckedSoundPlayer,
      phetioLinkProperty: true,

      // NodeOptions
      cursor: 'pointer',
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioEventType: EventType.USER,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true, // opt into default PhET-iO instrumented enabledProperty

      // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,

      // pdom
      tagName: 'input',
      inputType: 'checkbox',
      appendDescription: true,

      // Utterances to be spoken with a screen reader after the checkbox is pressed. Also used for
      // the voicingContextResponse
      checkedContextResponse: null,
      uncheckedContextResponse: null
    }, providedOptions );

    super();

    // @private - sends out notifications when the checkbox is toggled.
    const toggleAction = new PhetioAction( () => {
      property.value = !property.value;
      validate( property.value, BOOLEAN_VALIDATOR );
      if ( property.value ) {
        options.checkedSoundPlayer.play();
        options.checkedContextResponse && this.alertDescriptionUtterance( options.checkedContextResponse );
        this.voicingSpeakNameResponse( { contextResponse: Utterance.alertableToText( options.checkedContextResponse ) } );
      }
      else {
        options.uncheckedSoundPlayer.play();
        options.uncheckedContextResponse && this.alertDescriptionUtterance( options.uncheckedContextResponse );
        this.voicingSpeakNameResponse( { contextResponse: Utterance.alertableToText( options.uncheckedContextResponse ) } );
      }
    }, {
      parameters: [],
      tandem: options.tandem.createTandem( 'toggleAction' ),
      phetioDocumentation: 'Emits when user input causes the checkbox to toggle, emitting a single arg: ' +
                           'the new boolean value of the checkbox state.',
      phetioReadOnly: true, // interoperability should be done through the Property, this is just for the data stream event.
      phetioEventType: EventType.USER
    } );

    // Create the background.
    // Until we are creating our own shapes, just put a rectangle behind the font awesome checkbox icons.
    this.backgroundNode = new Rectangle( 0, -options.boxWidth, options.boxWidth * 0.95, options.boxWidth * 0.95,
      options.boxWidth * 0.2, options.boxWidth * 0.2, {
        fill: options.checkboxColorBackground
      } );

    this.uncheckedNode = new Path( uncheckedShape, {
      fill: options.checkboxColor
    } );
    const iconScale = options.boxWidth / this.uncheckedNode.width;
    this.uncheckedNode.scale( iconScale );

    this.checkedNode = new Path( checkedShape, {
      scale: iconScale,
      fill: options.checkboxColor
    } );

    const checkboxNode = new Node( { children: [ this.backgroundNode, this.checkedNode, this.uncheckedNode ] } );

    this.addChild( checkboxNode );
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
    const checkboxCheckedListener = ( checked: boolean ) => {
      this.checkedNode.visible = checked;
      this.uncheckedNode.visible = !checked;
      this.pdomChecked = checked;
    };
    property.link( checkboxCheckedListener );

    // Apply additional options
    this.mutate( options );

    // pointer areas
    this.touchArea = this.localBounds.dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation );
    this.mouseArea = this.localBounds.dilatedXY( options.mouseAreaXDilation, options.mouseAreaYDilation );

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

  public override dispose(): void {
    this.disposeCheckbox();
    super.dispose();
  }

  /**
   * Sets the background color of the checkbox.
   * @param value
   */
  public setCheckboxColorBackground( value: IPaint ): void { this.backgroundNode.fill = value; }

  public set checkboxColorBackground( value: IPaint ) { this.setCheckboxColorBackground( value ); }

  /**
   * Gets the background color of the checkbox.
   */
  public getCheckboxColorBackground(): IPaint { return this.backgroundNode.fill; }

  public get checkboxColorBackground(): IPaint { return this.getCheckboxColorBackground(); }

  /**
   * Sets the color of the checkbox.
   * @param value
   */
  public setCheckboxColor( value: IPaint ): void { this.checkedNode.fill = this.uncheckedNode.fill = value; }

  public set checkboxColor( value: IPaint ) { this.setCheckboxColor( value ); }

  /**
   * Gets the color of the checkbox.
   */
  public getCheckboxColor(): IPaint { return this.checkedNode.fill; }

  public get checkboxColor(): IPaint { return this.getCheckboxColor(); }
}

sun.register( 'Checkbox', Checkbox );
