// Copyright 2013-2020, University of Colorado Boulder

/**
 * AquaRadioButtonGroup creates a group of AquaRadioButtons and manages their layout.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import HStrut from '../../scenery/js/nodes/HStrut.js';
import LayoutBox from '../../scenery/js/nodes/LayoutBox.js';
import Node from '../../scenery/js/nodes/Node.js';
import radioButtonSoundPlayerFactory from '../../tambo/js/radioButtonSoundPlayerFactory.js';
import Tandem from '../../tandem/js/Tandem.js';
import AquaRadioButton from './AquaRadioButton.js';
import EnabledNode from './EnabledNode.js';
import sun from './sun.js';

// pdom - An id for each instance of AquaRadioButtonGroup, passed to individual buttons in the group.
// Each button in a radio button group must have the same "name" attribute to be considered in a group, otherwise
// arrow keys will navigate all radio type inputs in the document.
let instanceCount = 0;

// constants
// to prefix instanceCount in case there are different kinds of "groups"
const CLASS_NAME = 'AquaRadioButtonGroup';

/**
 * @mixes EnabledNode
 */
class AquaRadioButtonGroup extends LayoutBox {

  /**
   * @param {Property} property
   * @param {Object[]} items - Each item describes a radio button, and is an object with these properties:
   *    node: Node, // label for the button
   *    value: *, // value associated with the button
   *    [tandemName: Tandem], // optional tandem for PhET-iO
   *    [labelContent: string] // optional label for a11y
   * @param {Object} [options]
   * @constructor
   */
  constructor( property, items, options ) {

    instanceCount++;

    options = merge( {

      // {Object|null} options passed to constructor of the AquaRadioButtons
      radioButtonOptions: null,

      // Dilation of pointer areas for each radio button.
      // These are not part of radioButtonOptions because AquaRadioButton has no pointerArea options.
      // X dilation is ignored for orientation === 'horizontal'.
      // Y dilation is ignored for orientation === 'vertical'.
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0,

      // supertype options
      orientation: 'vertical', // Aqua radio buttons are typically vertical, rarely horizontal
      spacing: 3, // space between each button, perpendicular to options.orientation

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioComponentOptions: {
        visibleProperty: { phetioFeatured: true }
      },

      // PDOM
      tagName: 'ul',
      ariaRole: 'radiogroup',
      groupFocusHighlight: true
    }, options );

    // Determine the max item width
    const maxItemWidth = _.maxBy( items, item => item.node.width ).node.width;

    // Create a radio button for each item
    const radioButtons = [];
    for ( let i = 0; i < items.length; i++ ) {

      const item = items[ i ];

      // Content for the radio button.
      // For vertical orientation, add an invisible strut, so that buttons have uniform width.
      const content = ( options.orientation === 'vertical' ) ?
                      new Node( { children: [ new HStrut( maxItemWidth ), item.node ] } ) :
                      item.node;

      const radioButton = new AquaRadioButton( property, item.value, content,
        merge( {}, options.radioButtonOptions, {
          tandem: item.tandemName ? options.tandem.createTandem( item.tandemName ) : Tandem.REQUIRED,
          labelContent: item.labelContent || null,
          soundPlayer: radioButtonSoundPlayerFactory.getRadioButtonSoundPlayer( i ),
          a11yNameAttribute: CLASS_NAME + instanceCount
        } ) );

      // set pointer areas
      if ( options.orientation === 'vertical' ) {
        radioButton.mouseArea = radioButton.localBounds.dilatedXY( options.mouseAreaXDilation, options.spacing / 2 );
        radioButton.touchArea = radioButton.localBounds.dilatedXY( options.touchAreaXDilation, options.spacing / 2 );
      }
      else {
        radioButton.mouseArea = radioButton.localBounds.dilatedXY( options.spacing / 2, options.mouseAreaYDilation );
        radioButton.touchArea = radioButton.localBounds.dilatedXY( options.spacing / 2, options.touchAreaYDilation );
      }

      radioButtons.push( radioButton );
    }

    // Verify that the client hasn't set options that we will be overwriting.
    assert && assert( !options.children, 'AquaRadioButtonGroup sets children' );
    options.children = radioButtons;

    super( options );

    // PDOM - this node's primary sibling is aria-labelledby its own label so the label content is read whenever
    // a member of the group receives focus
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.LABEL_SIBLING
    } );

    this.initializeEnabledNode( options );

    // Add linked element after the radio button is instrumented
    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // @private
    this.disposeAquaRadioButtonGroup = () => {
      for ( let i = 0; i < radioButtons.length; i++ ) {
        radioButtons[ i ].dispose();
      }
    };

    // @private
    this.radioButtons = radioButtons;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeAquaRadioButtonGroup();
    this.disposeEnabledNode();
    super.dispose();
  }

  /**
   * Gets the radio button that corresponds to the specified value.
   * @param {*} value
   * @returns {AquaRadioButton}
   */
  getButton( value ) {
    const button = _.find( this.radioButtons, radioButton => radioButton.value === value );
    assert && assert( button, `no radio button found for value ${value}` );
    return button;
  }
}

EnabledNode.mixInto( AquaRadioButtonGroup );

sun.register( 'AquaRadioButtonGroup', AquaRadioButtonGroup );
export default AquaRadioButtonGroup;