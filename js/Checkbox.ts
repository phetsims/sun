// Copyright 2013-2025, University of Colorado Boulder

/**
 * Checkbox is a typical checkbox UI component.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import type PhetioProperty from '../../axon/js/PhetioProperty.js';
import type TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import validate from '../../axon/js/validate.js';
import type Bounds2 from '../../dot/js/Bounds2.js';
import { m3 } from '../../dot/js/Matrix3.js';
import type Shape from '../../kite/js/Shape.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { findStringProperty } from '../../scenery/js/accessibility/pdom/findStringProperty.js';
import Voicing, { type VoicingOptions } from '../../scenery/js/accessibility/voicing/Voicing.js';
import LayoutConstraint from '../../scenery/js/layout/constraints/LayoutConstraint.js';
import WidthSizable, { type WidthSizableOptions } from '../../scenery/js/layout/WidthSizable.js';
import FireListener from '../../scenery/js/listeners/FireListener.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import SceneryConstants from '../../scenery/js/SceneryConstants.js';
import assertNoAdditionalChildren from '../../scenery/js/util/assertNoAdditionalChildren.js';
import type TPaint from '../../scenery/js/util/TPaint.js';
import emptyCheckboxShape from '../../sun/js/shapes/emptyCheckboxShape.js';
import filledCheckboxShape from '../../sun/js/shapes/filledCheckboxShape.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import type TSoundPlayer from '../../tambo/js/TSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import Utterance, { type TAlertable } from '../../utterance-queue/js/Utterance.js';
import sun from './sun.js';
import SunUtil from './SunUtil.js';

// constants
const BOOLEAN_VALIDATOR = { valueType: 'boolean' };
const SHAPE_MATRIX = m3( 1.3, 0, 0, 0, 1.3, 0, 0, 0, 1 ); // to create a unity-scale icon
const uncheckedShape = emptyCheckboxShape.transformed( SHAPE_MATRIX );
const checkedShape = filledCheckboxShape.transformed( SHAPE_MATRIX );

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
  accessibleContextResponseChecked?: TAlertable;
  accessibleContextResponseUnchecked?: TAlertable;

  // By default voice the name response on checkbox change (with the context response), but optionally turn it off here.
  voiceNameResponseOnSelection?: boolean;

  // Output describing the state of the Checkbox after it is pressed using the Voicing feature. Like "Checked" or
  // "Locked". Not usually needed, default is null.
  voicingObjectResponseChecked?: TAlertable;
  voicingObjectResponseUnchecked?: TAlertable;

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
      phetioDisplayOnlyPropertyInstrumented: false, // Usage sites should opt-in when a checkbox icon is used as a legend

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
      voicingObjectResponseChecked: null,
      voicingObjectResponseUnchecked: null,
      accessibleNameBehavior: Voicing.BASIC_ACCESSIBLE_NAME_BEHAVIOR,
      accessibleHelpTextBehavior: Voicing.BASIC_HELP_TEXT_BEHAVIOR,

      // Utterances to be spoken with a screen reader after the checkbox is pressed. Also used for
      // the voicingContextResponse
      accessibleContextResponseChecked: null,
      accessibleContextResponseUnchecked: null,
      voiceNameResponseOnSelection: true
    }, providedOptions );

    super();

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
    this.uncheckedNode.center = this.backgroundNode.center;

    this.checkedNode = new Path( checkedShape, {
      scale: iconScale,
      fill: options.checkboxColor
    } );
    this.checkedNode.translation = this.uncheckedNode.translation;

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
      fire: () => {
        property.value = !property.value;
        validate( property.value, BOOLEAN_VALIDATOR );
        if ( property.value ) {
          options.checkedSoundPlayer.play();
          options.accessibleContextResponseChecked && this.addAccessibleResponse( options.accessibleContextResponseChecked );
          this.voicingSpeakResponse( {
            nameResponse: options.voiceNameResponseOnSelection ? this.voicingNameResponse : null,
            objectResponse: Utterance.alertableToText( options.voicingObjectResponseChecked ),
            contextResponse: Utterance.alertableToText( options.accessibleContextResponseChecked )
          } );
        }
        else {
          options.uncheckedSoundPlayer.play();
          options.accessibleContextResponseUnchecked && this.addAccessibleResponse( options.accessibleContextResponseUnchecked );
          this.voicingSpeakResponse( {
            nameResponse: options.voiceNameResponseOnSelection ? this.voicingNameResponse : null,
            objectResponse: Utterance.alertableToText( options.voicingObjectResponseUnchecked ),
            contextResponse: Utterance.alertableToText( options.accessibleContextResponseUnchecked )
          } );
        }
      },

      // Purposefully no nesting here, because we want the firedEmitter at the top level, and we don't instrument the enabledProperty
      tandem: options.tandem
    } );
    this.addInputListener( fireListener );

    const displayOnlyProperty = new BooleanProperty( false, {
      tandem: options.phetioDisplayOnlyPropertyInstrumented ? options.tandem.createTandem( 'displayOnlyProperty' ) : Tandem.OPT_OUT,
      phetioFeatured: true,
      phetioDocumentation: 'disables interaction for use as a legend'
    } );

    const inputEnabledProperty = new DerivedProperty( [ this.enabledProperty, displayOnlyProperty ], ( enabled, displayOnly ) => enabled && !displayOnly );
    super.setInputEnabledProperty( inputEnabledProperty ); // Call on super, since this overrides setInputEnabledProperty to throw an assertion

    const multilink = new Multilink( [ property, displayOnlyProperty ], ( checked, displayOnly ) => {
      this.checkedNode.visible = checked;
      this.uncheckedNode.visible = !checked;

      checkboxNode.visible = !displayOnly;

      // If set to display-only, the checkbox is informational instead being interactive.
      this.tagName = displayOnly ? 'p' : 'input';

      // Avoid the assertion when setting pdomChecked on a non 'input' element
      if ( !displayOnly ) {
        this.pdomChecked = checked;
      }
    } );

    // Apply additional options
    this.mutate( options );

    // pdom - to prevent a bug with NVDA and Firefox where the label sibling receives two click events, see
    // https://github.com/phetsims/gravity-force-lab/issues/257
    this.setExcludeLabelSiblingFromInput();

    // If no accessibleName is provided, look for one in the content Node
    if ( !options.accessibleName ) {
      this.accessibleName = findStringProperty( content );
    }

    // must be after the Checkbox is instrumented
    this.addLinkedElement( property, {
      tandemName: 'property'
    } );

    assert && SunUtil.validateLinkedElementInstrumentation( this, property );

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
    };
  }

  /**
   * The inputEnabledProperty for Checkbox is internally controlled by factors such as the displayOnlyProperty
   * and the enabledProperty.
   */
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