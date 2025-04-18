// Copyright 2013-2025, University of Colorado Boulder

/**
 * AquaRadioButton is a radio button whose look is similar to macOS' Aqua theme. The button is circular and
 * contains a dot when selected.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Emitter from '../../axon/js/Emitter.js';
import type TEmitter from '../../axon/js/TEmitter.js';
import type TProperty from '../../axon/js/TProperty.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { findStringProperty } from '../../scenery/js/accessibility/pdom/findStringProperty.js';
import { type TrimParallelDOMOptions } from '../../scenery/js/accessibility/pdom/ParallelDOM.js';
import Voicing, { type VoicingOptions } from '../../scenery/js/accessibility/voicing/Voicing.js';
import SceneryEvent from '../../scenery/js/input/SceneryEvent.js';
import LayoutConstraint from '../../scenery/js/layout/constraints/LayoutConstraint.js';
import { isWidthSizable } from '../../scenery/js/layout/sizableTypeChecks.js';
import WidthSizable from '../../scenery/js/layout/WidthSizable.js';
import FireListener from '../../scenery/js/listeners/FireListener.js';
import Circle from '../../scenery/js/nodes/Circle.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import SceneryConstants from '../../scenery/js/SceneryConstants.js';
import assertNoAdditionalChildren from '../../scenery/js/util/assertNoAdditionalChildren.js';
import type TPaint from '../../scenery/js/util/TPaint.js';
import multiSelectionSoundPlayerFactory from '../../tambo/js/multiSelectionSoundPlayerFactory.js';
import type TSoundPlayer from '../../tambo/js/TSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

type SelfOptions = {

  // color used to fill the center of the button when it's selected
  centerColor?: TPaint;

  // radius of the button
  radius?: number;

  // color used to fill the button when it's selected
  selectedColor?: TPaint;

  // color used to fill the button when it's deselected
  deselectedColor?: TPaint;

  // horizontal space between the button and the labelNode
  xSpacing?: number;

  // color used to stroke the outer edge of the button
  stroke?: TPaint;

  // sound generator, usually overridden when creating a group of these
  soundPlayer?: TSoundPlayer;

  // pointer areas
  touchAreaXDilation?: number;
  touchAreaYDilation?: number;
  mouseAreaXDilation?: number;
  mouseAreaYDilation?: number;

  // Each button in a group of radio buttons must have the same 'name' attribute to be considered a 'group' by the
  // browser. Otherwise, arrow keys will navigate through all inputs of type radio in the document.
  a11yNameAttribute?: string | number | null;
};
type ParentOptions = VoicingOptions & StrictOmit<NodeOptions, 'children'>;
export type AquaRadioButtonOptions = SelfOptions & TrimParallelDOMOptions<ParentOptions> & StrictOmit<VoicingOptions, 'voicingFocusListener'>;

export default class AquaRadioButton<T> extends WidthSizable( Voicing( Node ) ) {

  // the value associated with this radio button
  public readonly value: T;

  private readonly disposeAquaRadioButton: () => void;

  public static readonly DEFAULT_RADIUS = 7;

  public readonly onInputEmitter: TEmitter = new Emitter();

  // Handles layout of the content, rectangles and mouse/touch areas
  private readonly constraint: AquaRadioButtonConstraint<T>;

  // We need to record if the mouse/touch areas are customized, so that we can avoid overwriting them.
  // public for use by AquaRadioButtonConstraint only!
  public _isMouseAreaCustomized = false;
  public _isTouchAreaCustomized = false;
  public _isSettingAreas = false;

  /**
   * @param property
   * @param value - the value that corresponds to this button, same type as property
   * @param labelNode - Node that will be vertically centered to the right of the button
   * @param providedOptions
   */
  public constructor( property: TProperty<T>, value: T, labelNode: Node, providedOptions?: AquaRadioButtonOptions ) {
    assert && assert( property.valueComparisonStrategy === 'reference',
      'AquaRadioButton depends on "===" equality for value comparison' );

    const options = optionize<AquaRadioButtonOptions, SelfOptions, ParentOptions>()( {

      // SelfOptions
      centerColor: 'black',
      radius: AquaRadioButton.DEFAULT_RADIUS,
      selectedColor: 'rgb( 143, 197, 250 )',
      deselectedColor: 'white',
      xSpacing: 8,
      stroke: 'black',
      soundPlayer: multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( 0 ),
      a11yNameAttribute: null,
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // NodeOptions
      cursor: 'pointer',

      // {number} - opt into Node's disabled opacity when enabled:false
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'RadioButton',
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: false, // Uninstrumented in https://github.com/phetsims/sun/issues/920

      // pdom
      tagName: 'input',
      inputType: 'radio',
      containerTagName: 'li',
      labelTagName: 'label',
      appendLabel: true,
      appendDescription: true,
      accessibleNameBehavior: Voicing.BASIC_ACCESSIBLE_NAME_BEHAVIOR,

      // The group of radio buttons is responsible for implementing the Voicing output on focus.
      voicingFocusListener: null
    }, providedOptions );

    super();

    this.value = value;

    // selected Node
    const selectedNode = new Node();
    const innerCircle = new Circle( options.radius / 3, { fill: options.centerColor } );
    const outerCircleSelected = new Circle( options.radius, { fill: options.selectedColor, stroke: options.stroke } );
    const selectedCircleButton = new Node( {
      children: [ outerCircleSelected, innerCircle ]
    } );
    selectedNode.addChild( selectedCircleButton );

    // deselected Node
    const deselectedNode = new Node();
    const deselectedCircleButton = new Circle( options.radius, {
      fill: options.deselectedColor,
      stroke: options.stroke
    } );
    deselectedNode.addChild( deselectedCircleButton );

    const radioNode = new Node( {
      children: [ selectedNode, deselectedNode ],
      pickable: false // rectangle used for input
    } );

    const labelBoundsListener = () => {
      labelNode.left = deselectedCircleButton.right + options.xSpacing;
      labelNode.centerY = deselectedCircleButton.centerY;
    };
    labelNode.boundsProperty.link( labelBoundsListener );

    // Add an invisible Node to make sure the layout for selected vs deselected is the same
    const rectangle = new Rectangle( {} );
    selectedNode.pickable = deselectedNode.pickable = false; // the background rectangle suffices

    labelNode.pickable = false; // since there's a pickable rectangle on top of content

    this.children = [
      radioNode,
      labelNode,
      rectangle
    ];

    this.constraint = new AquaRadioButtonConstraint( this, radioNode, labelNode, rectangle, options );
    this.constraint.updateLayout();

    // sync control with model
    const syncWithModel = ( newValue: T ) => {
      selectedNode.visible = ( newValue === value );
      deselectedNode.visible = !selectedNode.visible;
    };
    property.link( syncWithModel );

    // set Property value on fire
    const fire = ( event: SceneryEvent | null ) => {
      const oldValue = property.value;
      property.set( value );
      if ( oldValue !== property.value ) {

        // sound and voicing support
        options.soundPlayer.play();
        if ( event && !event.isFromPDOM() ) {
          this.voicingSpeakFullResponse( {
            hintResponse: null
          } );
        }

        this.onInputEmitter.emit();
      }
    };
    const fireListener = new FireListener( {
      fire: fire,

      // Purposefully no nesting here, because we want the firedEmitter at the top level, and we don't instrument the enabledProperty
      tandem: options.tandem
    } );
    this.addInputListener( fireListener );

    // pdom - input listener so that updates the state of the radio button with keyboard interaction
    const changeListener = {
      change: fire
    };
    this.addInputListener( changeListener );

    // pdom - Specify the default value for assistive technology. This attribute is needed in addition to
    // the 'checked' Property to mark this element as the default selection since 'checked' may be set before
    // we are finished adding RadioButtons to the containing group, and the browser will remove the boolean
    // 'checked' flag when new buttons are added.
    if ( property.value === value ) {
      this.setPDOMAttribute( 'checked', 'checked' );
    }

    // pdom - when the Property changes, make sure the correct radio button is marked as 'checked' so that this button
    // receives focus on 'tab'
    const pdomCheckedListener = ( newValue: T ) => {
      this.pdomChecked = ( newValue === value );
    };
    property.link( pdomCheckedListener );

    // pdom - If an accessibleName was not provided, search for one in the labelNode
    if ( !options.accessibleName ) {
      options.accessibleName = findStringProperty( labelNode );
    }

    // pdom - every button in a group of radio buttons should have the same name, see options for more info
    if ( options.a11yNameAttribute !== null ) {
      this.setPDOMAttribute( 'name', options.a11yNameAttribute );
    }

    this.mutate( options );

    this.disposeAquaRadioButton = () => {
      this.constraint.dispose();

      this.onInputEmitter.dispose();
      this.removeInputListener( fireListener );
      this.removeInputListener( changeListener );
      property.unlink( pdomCheckedListener );
      property.unlink( syncWithModel );

      if ( labelNode.boundsProperty.hasListener( labelBoundsListener ) ) {
        labelNode.boundsProperty.unlink( labelBoundsListener );
      }

      // phet-io: Unregister listener
      fireListener.dispose();
    };

    // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
    assert && assertNoAdditionalChildren( this );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && window.phet?.chipper?.queryParameters?.binder && InstanceRegistry.registerDataURL( 'sun', 'AquaRadioButton', this );
  }

  public override dispose(): void {
    this.disposeAquaRadioButton();
    super.dispose();
  }
}

class AquaRadioButtonConstraint<T> extends LayoutConstraint {
  private readonly radioButton: AquaRadioButton<T>;
  private readonly radioNode: Node;
  private readonly labelNode: Node;
  private readonly rectangle: Rectangle;
  private readonly options: Required<SelfOptions>;

  public constructor( radioButton: AquaRadioButton<T>, radioNode: Node, labelNode: Node, rectangle: Rectangle, options: Required<SelfOptions> ) {
    super( radioButton );

    this.radioButton = radioButton;
    this.radioNode = radioNode;
    this.labelNode = labelNode;
    this.rectangle = rectangle;
    this.options = options;

    this.radioButton.localPreferredWidthProperty.lazyLink( this._updateLayoutListener );

    this.addNode( labelNode );
  }

  protected override layout(): void {
    super.layout();

    // LayoutProxy helps with some layout operations, and will support a non-child content.
    const labelNodeProxy = this.createLayoutProxy( this.labelNode )!;

    const labelNodeWidth = labelNodeProxy.minimumWidth;

    const minimumWidth = this.radioNode.width + this.options.xSpacing + labelNodeWidth;

    const preferredWidth = Math.max( minimumWidth, this.radioButton.localPreferredWidth || 0 );

    // Attempt to set a preferredWidth
    if ( isWidthSizable( this.labelNode ) ) {
      labelNodeProxy.preferredWidth = preferredWidth - this.radioNode.width - this.options.xSpacing;
    }

    labelNodeProxy.left = this.radioNode.right + this.options.xSpacing;
    labelNodeProxy.centerY = this.radioNode.centerY;

    // Our rectangle bounds will cover the radioNode and labelNode, and if necessary expand to include the full
    // preferredWidth
    this.rectangle.rectBounds = this.radioNode.bounds.union( labelNodeProxy.bounds ).withMaxX(
      Math.max( this.radioNode.left + preferredWidth, labelNodeProxy.right )
    );

    // Update pointer areas (if the client hasn't customized them)
    this.radioButton._isSettingAreas = true;
    if ( !this.radioButton._isTouchAreaCustomized ) {
      this.radioButton.touchArea = this.radioButton.localBounds.dilatedXY( this.options.touchAreaXDilation, this.options.touchAreaYDilation );
    }
    if ( !this.radioButton._isMouseAreaCustomized ) {
      this.radioButton.mouseArea = this.radioButton.localBounds.dilatedXY( this.options.mouseAreaXDilation, this.options.mouseAreaYDilation );
    }
    this.radioButton._isSettingAreas = false;

    labelNodeProxy.dispose();

    // Set the minimumWidth last, since this may trigger a relayout
    this.radioButton.localMinimumWidth = minimumWidth;
  }

  public override dispose(): void {
    this.radioButton.localPreferredWidthProperty.unlink( this._updateLayoutListener );

    super.dispose();
  }
}

sun.register( 'AquaRadioButton', AquaRadioButton );