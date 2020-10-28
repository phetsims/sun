// Copyright 2014-2020, University of Colorado Boulder

/**
 * RectangularRadioButtonGroup is a group of rectangular radio buttons, in either horizontal or vertical orientation.
 * See sun.ButtonsScreenView for example usage.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Shape from '../../../kite/js/Shape.js';
import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../../phet-core/js/merge.js';
import FocusHighlightPath from '../../../scenery/js/accessibility/FocusHighlightPath.js';
import PDOMPeer from '../../../scenery/js/accessibility/pdom/PDOMPeer.js';
import LayoutBox from '../../../scenery/js/nodes/LayoutBox.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import multiSelectionSoundPlayerFactory from '../../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import EnabledNode from '../EnabledNode.js';
import sun from '../sun.js';
import RectangularRadioButton from './RectangularRadioButton.js';

// constants
const BUTTON_CONTENT_X_ALIGN_VALUES = [ 'center', 'left', 'right' ];
const BUTTON_CONTENT_Y_ALIGN_VALUES = [ 'center', 'top', 'bottom' ];
const CLASS_NAME = 'RectangularRadioButtonGroup'; // to prefix instanceCount in case there are different kinds of "groups"

// pdom - Unique ID for each instance of RectangularRadioButtonGroup, passed to individual buttons in the group. All buttons in
// the  radio button group must have the same name or else the browser will treat all inputs of type radio in the
// document as being in a single group.
let instanceCount = 0;

class RectangularRadioButtonGroup extends LayoutBox {

  /**
   * @mixes EnabledNode
   * @param {Property} property
   * @param {Object[]} contentArray - an array of objects that have two keys each: "value" and "node", where the node
   * key holds a scenery Node that is the content for a given radio button and the value key holds the value that the
   * Property takes on when the corresponding node is selected. Optionally, these objects can have an attribute 'label',
   * which is a {Node} used to label the button. You can also pass some specific a11y options.
   * (labelContent/descriptionContent) through, see "new RectangularRadioButton" construction.
   * @param {Object} [options]
   */
  constructor( property, contentArray, options ) {
    options = merge( {

      // phet-io
      tandem: Tandem.REQUIRED,
      visiblePropertyOptions: { phetioFeatured: true },

      // {Playable[]|null} - sound generation for the radio buttons, null means to use the defaults, otherwise there
      // must be one for each element in contentArray
      soundPlayers: null,

      // pdom
      tagName: 'ul',
      labelTagName: 'h3',
      ariaRole: 'radiogroup',
      groupFocusHighlight: true
    }, options );

    // increment instance count
    instanceCount++;

    assert && assert( !options.hasOwnProperty( 'children' ), 'Cannot pass in children to a RectangularRadioButtonGroup, ' +
                                                             'create siblings in the parent node instead' );

    // make sure every object in the content array has properties 'node' and 'value'
    assert && assert( _.every( contentArray, obj => {
      return obj.hasOwnProperty( 'node' ) && obj.hasOwnProperty( 'value' );
    } ), 'contentArray must be an array of objects with properties "node" and "value"' );

    // make sure that if sound players are provided, there is one per radio button
    assert && assert( options.soundPlayers === null || options.soundPlayers.length === contentArray.length );

    let i; // for loops

    // make sure that each value passed into the contentArray is unique
    const uniqueValues = [];
    for ( i = 0; i < contentArray.length; i++ ) {
      if ( uniqueValues.indexOf( contentArray[ i ].value ) < 0 ) {
        uniqueValues.push( contentArray[ i ].value );
      }
      else {
        throw new Error( 'Duplicate value: "' + contentArray[ i ].value + '" passed into RectangularRadioButtonGroup.js' );
      }
    }

    // make sure that the Property passed in currently has a value from the contentArray
    if ( uniqueValues.indexOf( property.get() ) === -1 ) {
      throw new Error( 'The Property passed in to RectangularRadioButtonGroup has an illegal value "' + property.get() +
                       '" that is not present in the contentArray' );
    }

    const defaultOptions = {

      // LayoutBox options (super class of RectangularRadioButtonGroup)
      spacing: 10,
      orientation: 'vertical',

      // The fill for the rectangle behind the radio buttons.  Default color is bluish color, as in the other button library.
      baseColor: ColorConstants.LIGHT_BLUE,

      // {constructor|null} Class that determines the content's appearance for the values of interactionStateProperty.
      contentAppearanceStrategy: RectangularRadioButton.ContentAppearanceStrategy,

      // Options used by RectangularRadioButton.ContentAppearanceStrategy.
      // If you define your own contentAppearanceStrategy, then you may need to add your own options.
      selectedButtonOpacity: 1,
      deselectedButtonOpacity: 0.6,
      selectedContentOpacity: 1,
      deselectedContentOpacity: 0.6,
      overButtonOpacity: 0.8,
      overContentOpacity: 0.8,

      selectedLineWidth: 1.5,
      deselectedLineWidth: 1,

      // These margins are *within* each button
      buttonContentXMargin: 5,
      buttonContentYMargin: 5,

      // alignment of the content nodes *within* each button
      buttonContentXAlign: 'center', // {string} see BUTTON_CONTENT_X_ALIGN_VALUES
      buttonContentYAlign: 'center', // {string} see BUTTON_CONTENT_Y_ALIGN_VALUES

      // TouchArea expansion
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,

      // MouseArea expansion
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      //The radius for each button
      cornerRadius: 4,

      // How far from the button the text label is (only applies if labels are passed in)
      labelSpacing: 0,

      // Which side of the button the label will appear, options are 'top', 'bottom', 'left', 'right'
      // (only applies if labels are passed in)
      labelAlign: 'bottom',

      // pdom - focus highlight expansion
      a11yHighlightXDilation: 0,
      a11yHighlightYDilation: 0
    };

    options = merge( _.clone( defaultOptions ), options );

    assert && assert( _.includes( BUTTON_CONTENT_X_ALIGN_VALUES, options.buttonContentXAlign ),
      'invalid buttonContentXAlign: ' + options.buttonContentXAlign );
    assert && assert( _.includes( BUTTON_CONTENT_Y_ALIGN_VALUES, options.buttonContentYAlign ),
      'invalid buttonContentYAlign: ' + options.buttonContentYAlign );

    // make a copy of the options to pass to individual buttons that includes all default options but not scenery options
    const buttonOptions = _.pick( options, _.keys( defaultOptions ) );

    // calculate the maximum width and height of the content so we can make all radio buttons the same size
    const widestContentWidth = _.maxBy( contentArray, content => content.node.width ).node.width;
    const tallestContentHeight = _.maxBy( contentArray, content => content.node.height ).node.height;

    // make sure all radio buttons are the same size and create the RadioButtons
    const buttons = [];
    const labelAppearanceStrategies = [];
    for ( i = 0; i < contentArray.length; i++ ) {
      const currentContent = contentArray[ i ];

      assert && assert( !currentContent.hasOwnProperty( 'phetioType' ), 'phetioType should be provided by ' +
                                                                        'the Property passed to the ' +
                                                                        'RectangularRadioButtonGroup constructor' );

      assert && assert( !currentContent.tandem, 'content arrays should not have tandem instances, they should use ' +
                                                'tandemName instead' );

      const radioButtonGroupMemberOptions = merge( {
        content: currentContent.node,
        xMargin: options.buttonContentXMargin,
        yMargin: options.buttonContentYMargin,
        xAlign: options.buttonContentXAlign,
        yAlign: options.buttonContentYAlign,
        minWidth: widestContentWidth + 2 * options.buttonContentXMargin,
        minHeight: tallestContentHeight + 2 * options.buttonContentYMargin,
        phetioDocumentation: currentContent.phetioDocumentation || '',
        soundPlayer: options.soundPlayers ? options.soundPlayers[ i ] :
                     multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( i )
      }, buttonOptions );

      // Pass through the tandem given the tandemName, but also support uninstrumented simulations
      if ( currentContent.tandemName ) {
        radioButtonGroupMemberOptions.tandem = options.tandem.createTandem( currentContent.tandemName );
      }

      // pdom create the label for the radio button
      if ( currentContent.labelContent ) {
        radioButtonGroupMemberOptions.labelContent = currentContent.labelContent;
      }

      // pdom create description for radio button
      // use if block to prevent empty 'p' tag being added when no option is present
      if ( currentContent.descriptionContent ) {
        radioButtonGroupMemberOptions.descriptionContent = currentContent.descriptionContent;
      }

      const radioButton = new RectangularRadioButton( property, currentContent.value, radioButtonGroupMemberOptions );

      // pdom - so the browser recognizes these buttons are in the same group, see instanceCount for more info
      radioButton.setAccessibleAttribute( 'name', CLASS_NAME + instanceCount );

      // ensure the buttons don't resize when selected vs unselected by adding a rectangle with the max size
      const maxLineWidth = Math.max( options.selectedLineWidth, options.deselectedLineWidth );
      const maxButtonWidth = maxLineWidth + widestContentWidth + options.buttonContentXMargin * 2;
      const maxButtonHeight = maxLineWidth + tallestContentHeight + options.buttonContentYMargin * 2;
      const boundingRect = new Rectangle( 0, 0, maxButtonWidth, maxButtonHeight, {
        fill: 'rgba(0,0,0,0)',
        center: radioButton.center
      } );
      radioButton.addChild( boundingRect );

      // default bounds for focus highlight, will include label if one exists
      let defaultHighlightBounds = null;

      let button;
      if ( currentContent.label ) {

        // If a label is provided, the button becomes a LayoutBox with the label and radio button
        const label = currentContent.label;
        const labelOrientation = ( options.labelAlign === 'bottom' || options.labelAlign === 'top' ) ? 'vertical' : 'horizontal';
        const labelChildren = ( options.labelAlign === 'left' || options.labelAlign === 'top' ) ? [ label, radioButton ] : [ radioButton, label ];
        button = new LayoutBox( {
          children: labelChildren,
          spacing: options.labelSpacing,
          orientation: labelOrientation
        } );

        let xDilation = options.touchAreaXDilation;
        let yDilation = options.touchAreaYDilation;

        // Set pointer areas. Extra width is added to the radio buttons so they don't change size if the line width
        // changes. That is why lineWidth is subtracted from the width and height when calculating these new areas.
        radioButton.touchArea = Shape.rectangle(
          -xDilation,
          -yDilation,
          button.width + 2 * xDilation - maxLineWidth,
          button.height + 2 * yDilation - maxLineWidth
        );

        xDilation = options.mouseAreaXDilation;
        yDilation = options.mouseAreaYDilation;
        radioButton.mouseArea = Shape.rectangle(
          -xDilation,
          -yDilation,
          button.width + 2 * xDilation - maxLineWidth,
          button.height + 2 * yDilation - maxLineWidth
        );

        // Make sure the label pointer areas don't block the expanded button pointer areas.
        label.pickable = false;

        // Use the same content appearance strategy for the labels that is used for the button content.
        // By default, this reduces opacity of the labels for the deselected radio buttons.
        if ( options.contentAppearanceStrategy ) {
          labelAppearanceStrategies.push( new options.contentAppearanceStrategy( label, radioButton.interactionStateProperty, options ) );
        }

        // pdom - include label in focus highlight
        defaultHighlightBounds = radioButton.mouseArea.bounds.dilated( 5 );
      }
      else {

        // The button has no label.
        button = radioButton;
        defaultHighlightBounds = button.bounds.dilated( FocusHighlightPath.getDilationCoefficient( button ) );
      }
      buttons.push( button );

      // pdom - set the focus highlight, dilated by the optional expansion values
      const highlightBounds = defaultHighlightBounds
        .dilatedX( radioButtonGroupMemberOptions.a11yHighlightXDilation )
        .dilatedY( radioButtonGroupMemberOptions.a11yHighlightYDilation );
      radioButton.setFocusHighlight( Shape.bounds( highlightBounds ) );
    }

    assert && assert( !options.children, 'RectangularRadioButtonGroup sets children' );
    options.children = buttons;

    super( options );

    // Initialize the mixin, which defines this.enabledProperty.
    this.initializeEnabledNode( options );

    // pdom - this node's primary sibling is aria-labelledby its own label so the label content is read whenever
    // a member of the group receives focus
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.LABEL_SIBLING
    } );

    // zoom - signify that key input is reserved and we should not pan when user presses arrow keys
    const intentListener = { keydown: event => event.pointer.reserveForKeyboardDrag() };
    this.addInputListener( intentListener );

    // must be done after this instance is instrumented
    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // @private - remove listeners from buttons and make eligible for garbage collection
    this.disposeRadioButtonGroup = () => {
      this.removeInputListener( intentListener );
      buttons.forEach( button => button.dispose() );
      labelAppearanceStrategies.forEach( strategy => ( strategy.dispose && strategy.dispose() ) );
    };

    // pdom - register component for binder docs
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'RectangularRadioButtonGroup', this );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeRadioButtonGroup();
    this.disposeEnabledNode();
    super.dispose();
  }
}

EnabledNode.mixInto( RectangularRadioButtonGroup );

sun.register( 'RectangularRadioButtonGroup', RectangularRadioButtonGroup );
export default RectangularRadioButtonGroup;