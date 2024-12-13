// Copyright 2013-2024, University of Colorado Boulder

/**
 * Checkbox is a typical checkbox UI component.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import PhetioProperty from '../../axon/js/PhetioProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import validate from '../../axon/js/validate.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import { m3 } from '../../dot/js/Matrix3.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { assertNoAdditionalChildren, FireListener, LayoutConstraint, Node, NodeOptions, Path, PDOMUtils, Rectangle, SceneryConstants, TPaint, Voicing, VoicingOptions, WidthSizable, WidthSizableOptions } from '../../scenery/js/imports.js';
import checkEmptySolidShape from '../../sherpa/js/fontawesome-4/checkEmptySolidShape.js';
import checkSquareOSolidShape from '../../sherpa/js/fontawesome-4/checkSquareOSolidShape.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import TSoundPlayer from '../../tambo/js/TSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioAction from '../../tandem/js/PhetioAction.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import Utterance, { TAlertable } from '../../utterance-queue/js/Utterance.js';
import sun from './sun.js';

// constants
const BOOLEAN_VALIDATOR = { valueType: 'boolean' };
const SHAPE_MATRIX = m3( 0.025, 0, 0, 0, -0.025, 0, 0, 0, 1 ); // to create a unity-scale icon
const uncheckedShape = checkEmptySolidShape.transformed( SHAPE_MATRIX );
const checkedShape = checkSquareOSolidShape.transformed( SHAPE_MATRIX );

type SelfOptions = {
  spacing?: number;  // spacing between box and content
  boxWidth?: number; // width (and height) of the box
  checkboxColor?: TPaint;
  checkboxColorBackground?: TPaint;

  // pointer areas
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;

  // sounds
  checkedSoundPlayer?: TSoundPlayer;
  uncheckedSoundPlayer?: TSoundPlayer;

  // Utterances to be spoken with a screen reader after the checkbox is pressed. Also used for the voicingContextResponse.
  checkedContextResponse?: TAlertable;
  uncheckedContextResponse?: TAlertable;

  // By default voice the name response on checkbox change (with the context response), but optionally turn it off here.
  voiceNameResponseOnSelection?: boolean;

  // Output describing the state of the Checkbox after it is pressed using the Voicing feature. Like "Checked" or
  // "Locked". Not usually needed, default is null.
  voicingCheckedObjectResponse?: TAlertable;
  voicingUncheckedObjectResponse?: TAlertable;

  // whether a PhET-iO link to the checkbox's Property is created
  phetioLinkProperty?: boolean;

  // whether the displayOnlyProperty for this checkbox is instrumented for PhET-iO
  phetioDisplayOnlyPropertyInstrumented?: boolean;
};

type ParentOptions = WidthSizableOptions & VoicingOptions & NodeOptions;

export type CheckboxOptions = SelfOptions & StrictOmit<ParentOptions, 'children' | 'mouseArea' | 'touchArea' | 'tagName'>;

export default class Checkbox extends WidthSizable( Voicing( Node ) ) {

  private readonly backgroundNode: Rectangle;
  private readonly checkedNode: Path;
  private readonly uncheckedNode: Path;
  private readonly disposeCheckbox: () => void;

  // We need to record if the mouse/touch areas are customized, so that we can avoid overwriting them.
  // public for use by CheckboxConstraint only!
  public _isMouseAreaCustomized = false;
  public _isTouchAreaCustomized = false;
  public _isSettingAreas = false;

  // Handles layout of the content, rectangles and mouse/touch areas
  private readonly constraint: CheckboxConstraint;

  public constructor( property: PhetioProperty<boolean>, content: Node, providedOptions?: CheckboxOptions ) {

    const options = optionize<CheckboxOptions, SelfOptions, ParentOptions>()( {

      // CheckboxOptions
      spacing: 5,
      boxWidth: 21,
      checkboxColor: 'black',
      checkboxColorBackground: 'white',
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,
      checkedSoundPlayer: sharedSoundPlayers.get( 'checkboxChecked' ),
      uncheckedSoundPlayer: sharedSoundPlayers.get( 'checkboxUnchecked' ),
      phetioLinkProperty: true,
      phetioDisplayOnlyPropertyInstrumented: false,

      // NodeOptions
      cursor: 'pointer',
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Checkbox',
      phetioEventType: EventType.USER,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true, // opt into default PhET-iO instrumented enabledProperty

      // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
      phetioFeatured: true,

      // pdom
      tagName: 'input',
      inputType: 'checkbox',
      appendDescription: true,

      // voicing
      voicingCheckedObjectResponse: null,
      voicingUncheckedObjectResponse: null,

      // Utterances to be spoken with a screen reader after the checkbox is pressed. Also used for
      // the voicingContextResponse
      checkedContextResponse: null,
      uncheckedContextResponse: null,
      voiceNameResponseOnSelection: true
    }, providedOptions );

    super();

    // sends out notifications when the checkbox is toggled.
    const toggleAction = new PhetioAction( () => {
      property.value = !property.value;
      validate( property.value, BOOLEAN_VALIDATOR );
      if ( property.value ) {
        options.checkedSoundPlayer.play();
        options.checkedContextResponse && this.alertDescriptionUtterance( options.checkedContextResponse );
        this.voicingSpeakResponse( {
          nameResponse: options.voiceNameResponseOnSelection ? this.voicingNameResponse : null,
          objectResponse: Utterance.alertableToText( options.voicingCheckedObjectResponse ),
          contextResponse: Utterance.alertableToText( options.checkedContextResponse )
        } );
      }
      else {
        options.uncheckedSoundPlayer.play();
        options.uncheckedContextResponse && this.alertDescriptionUtterance( options.uncheckedContextResponse );
        this.voicingSpeakResponse( {
          nameResponse: options.voiceNameResponseOnSelection ? this.voicingNameResponse : null,
          objectResponse: Utterance.alertableToText( options.voicingUncheckedObjectResponse ),
          contextResponse: Utterance.alertableToText( options.uncheckedContextResponse )
        } );
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

    // put a rectangle on top of everything to prevent dead zones when clicking
    const rectangle = new Rectangle( {} );

    this.children = [
      checkboxNode,
      content,
      rectangle
    ];

    this.constraint = new CheckboxConstraint( this, checkboxNode, this.checkedNode, content, rectangle, options );
    this.constraint.updateLayout();

    content.pickable = false; // since there's a pickable rectangle on top of content

    // In case the content is an instance of a focusable Node. Checkbox icon should not be in the traversal order.
    content.pdomVisible = false;

    // interactivity
    const fireListener = new FireListener( {
      fire: () => toggleAction.execute(),
      tandem: options.tandem.createTandem( 'fireListener' )
    } );
    this.addInputListener( fireListener );

    const displayOnlyProperty = new BooleanProperty( false, {
      tandem: options.phetioDisplayOnlyPropertyInstrumented ? options.tandem.createTandem( 'displayOnlyProperty' ) : Tandem.OPT_OUT,
      phetioFeatured: true,
      phetioDocumentation: 'disables interaction for use as a legend'
    } );

    const inputEnabledProperty = new DerivedProperty( [ this.enabledProperty, displayOnlyProperty ], ( enabled, displayOnly ) => enabled && !displayOnly );
    super.setInputEnabledProperty( inputEnabledProperty );

    const multilink = new Multilink( [ property, displayOnlyProperty ], ( checked, displayOnly ) => {
      this.checkedNode.visible = checked;
      this.uncheckedNode.visible = !checked;

      // Avoid the assertion when setting pdomChecked on a non 'input' element
      if ( !displayOnly ) {
        this.pdomChecked = checked;
      }

      checkboxNode.visible = !displayOnly;

      // If set to display-only, the checkbox is informational instead being interactive.
      this.tagName = displayOnly ? 'p' : 'input';

    } );

    // Apply additional options
    this.mutate( options );

    // pdom - to prevent a bug with NVDA and Firefox where the label sibling receives two click events, see
    // https://github.com/phetsims/gravity-force-lab/issues/257
    this.setExcludeLabelSiblingFromInput();

    // If no accessibleName is provided, look for one in the content Node
    if ( !options.accessibleName ) {
      this.accessibleName = PDOMUtils.findStringProperty( content );
    }

    // must be after the Checkbox is instrumented
    options.phetioLinkProperty && this.addLinkedElement( property, {
      tandemName: 'property'
    } );

    if ( assert && Tandem.VALIDATION && this.isPhetioInstrumented() ) {
      assert && assert( property.isPhetioInstrumented(), 'Property should be instrumented if Checkbox is instrumented' );
      assert && assert( options.phetioLinkProperty, 'Property should be linked if Checkbox is instrumented' );

      if ( this.phetioFeatured ) {
        assert && assert( property.phetioFeatured, `Property should be featured if the controlling Checkbox is featured: ${property.phetioID}` );
      }
    }

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && window.phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'Checkbox', this );

    // Decorating Checkbox with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
    assert && assertNoAdditionalChildren( this );

    this.disposeCheckbox = () => {
      rectangle.dispose();
      this.backgroundNode.dispose();
      this.uncheckedNode.dispose();
      this.checkedNode.dispose();
      checkboxNode.dispose();
      fireListener.dispose();

      multilink.dispose();
      inputEnabledProperty.dispose();
      displayOnlyProperty.dispose();


      // Private to Checkbox, but we need to clean up tandem.
      toggleAction.dispose();
    };
  }

  public override setInputEnabledProperty( newTarget: TReadOnlyProperty<boolean> | null ): this {
    assert && assert( false, 'Checkbox.inputEnabledProperty is read-only' );
    return this;
  }

  public override dispose(): void {
    this.constraint.dispose();

    this.disposeCheckbox();
    super.dispose();
  }

  /**
   * Sets the background color of the checkbox.
   */
  public setCheckboxColorBackground( value: TPaint ): void { this.backgroundNode.fill = value; }

  public set checkboxColorBackground( value: TPaint ) { this.setCheckboxColorBackground( value ); }

  public get checkboxColorBackground(): TPaint { return this.getCheckboxColorBackground(); }

  /**
   * Gets the background color of the checkbox.
   */
  public getCheckboxColorBackground(): TPaint { return this.backgroundNode.fill; }

  /**
   * Sets the color of the checkbox.
   */
  public setCheckboxColor( value: TPaint ): void { this.checkedNode.fill = this.uncheckedNode.fill = value; }

  public set checkboxColor( value: TPaint ) { this.setCheckboxColor( value ); }

  public get checkboxColor(): TPaint { return this.getCheckboxColor(); }

  /**
   * Gets the color of the checkbox.
   */
  public getCheckboxColor(): TPaint { return this.checkedNode.fill; }

  public override setMouseArea( area: Shape | Bounds2 | null ): this {
    if ( !this._isSettingAreas ) {
      this._isMouseAreaCustomized = true;
    }
    return super.setMouseArea( area );
  }

  public override setTouchArea( area: Shape | Bounds2 | null ): this {
    if ( !this._isSettingAreas ) {
      this._isTouchAreaCustomized = true;
    }
    return super.setTouchArea( area );
  }
}

class CheckboxConstraint extends LayoutConstraint {
  private readonly checkbox: Checkbox;
  private readonly checkboxNode: Node;
  private readonly checkedNode: Node;
  private readonly content: Node;
  private readonly rectangle: Rectangle;
  private readonly options: Required<SelfOptions>;

  public constructor( checkbox: Checkbox, checkboxNode: Node, checkedNode: Node, content: Node, rectangle: Rectangle, options: Required<SelfOptions> ) {
    super( checkbox );

    this.checkbox = checkbox;
    this.checkboxNode = checkboxNode;
    this.checkedNode = checkedNode;
    this.content = content;
    this.rectangle = rectangle;
    this.options = options;

    this.checkbox.localPreferredWidthProperty.lazyLink( this._updateLayoutListener );

    this.addNode( content );
  }

  protected override layout(): void {
    super.layout();

    // LayoutProxy helps with some layout operations, and will support a non-child content.
    const contentProxy = this.createLayoutProxy( this.content );

    // Should only happen when we are disconnected during disposal
    if ( !contentProxy ) {
      return;
    }

    const contentWidth = contentProxy.minimumWidth;

    // Our bounds are based on checkboxNode, but our layout is relative to checkedNode
    const checkboxWithoutSpacingWidth = ( this.checkedNode.right - this.checkboxNode.left );
    const minimumWidth = checkboxWithoutSpacingWidth + this.options.spacing + contentWidth;

    const preferredWidth = Math.max( minimumWidth, this.checkbox.localPreferredWidth || 0 );

    contentProxy.preferredWidth = preferredWidth - checkboxWithoutSpacingWidth - this.options.spacing;

    // For now just position content. Future updates could include widthResizable content?
    contentProxy.left = this.checkedNode.right + this.options.spacing;
    contentProxy.centerY = this.checkedNode.centerY;

    // Our rectangle bounds will cover the checkboxNode and content, and if necessary expand to include the full
    // preferredWidth
    this.rectangle.rectBounds = this.checkboxNode.bounds.union( contentProxy.bounds ).withMaxX(
      Math.max( this.checkboxNode.left + preferredWidth, contentProxy.right )
    );

    // Update pointer areas (if the client hasn't customized them)
    this.checkbox._isSettingAreas = true;
    if ( !this.checkbox._isTouchAreaCustomized ) {
      this.checkbox.touchArea = this.checkbox.localBounds.dilatedXY( this.options.touchAreaXDilation, this.options.touchAreaYDilation );
    }
    if ( !this.checkbox._isMouseAreaCustomized ) {
      this.checkbox.mouseArea = this.checkbox.localBounds.dilatedXY( this.options.mouseAreaXDilation, this.options.mouseAreaYDilation );
    }
    this.checkbox._isSettingAreas = false;

    contentProxy.dispose();

    // Set the minimumWidth last, since this may trigger a relayout
    this.checkbox.localMinimumWidth = minimumWidth;
  }

  public override dispose(): void {
    this.checkbox.localPreferredWidthProperty.unlink( this._updateLayoutListener );

    super.dispose();
  }
}

sun.register( 'Checkbox', Checkbox );