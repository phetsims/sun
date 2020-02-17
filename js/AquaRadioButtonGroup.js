// Copyright 2013-2020, University of Colorado Boulder

/**
 * AquaRadioButtonGroup creates a group of AquaRadioButtons and manages their layout.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const merge = require( 'PHET_CORE/merge' );
  const LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  const Node = require( 'SCENERY/nodes/Node' );
  const radioButtonSoundPlayerFactory = require( 'TAMBO/radioButtonSoundPlayerFactory' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  // a11y - An id for each instance of AquaRadioButtonGroup, passed to individual buttons in the group.
  // Each button in a radio button group must have the same "name" attribute to be considered in a group, otherwise
  // arrow keys will navigate all radio type inputs in the document.
  let instanceCount = 0;

  // constants
  // to prefix instanceCount in case there are different kinds of "groups"
  const CLASS_NAME = 'AquaRadioButtonGroup';

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

        // dilation of pointer areas for each radio button, perpendicular to options.orientation
        touchAreaDilation: 0,
        mouseAreaDilation: 0,

        // supertype options
        orientation: 'vertical', // Aqua radio buttons are typically vertical, rarely horizontal
        spacing: 3, // space between each button, perpendicular to options.orientation

        // phet-io
        tandem: Tandem.REQUIRED,

        // PDOM
        tagName: 'ul',
        ariaRole: 'radiogroup',
        groupFocusHighlight: true
      }, options );

      // See https://github.com/phetsims/sun/issues/555
      assert && assert( options.touchAreaXDilation === undefined, 'touchAreaXDilation is deprecated, use touchAreaDilation' );
      assert && assert( options.mouseAreaXDilation === undefined, 'mouseAreaXDilation is deprecated, use mouseAreaDilation' );

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
          const yDilation = options.spacing / 2;
          radioButton.mouseArea = radioButton.localBounds.dilatedXY( options.mouseAreaDilation, yDilation );
          radioButton.touchArea = radioButton.localBounds.dilatedXY( options.touchAreaDilation, yDilation );
        }
        else {
          const xDilation = options.spacing / 2;
          radioButton.mouseArea = radioButton.localBounds.dilatedXY( xDilation, options.mouseAreaDilation );
          radioButton.touchArea = radioButton.localBounds.dilatedXY( xDilation, options.touchAreaDilation );
        }

        radioButtons.push( radioButton );
      }

      // Verify that the client hasn't set options that we will be overwriting.
      assert && assert( !options.children, 'AquaRadioButtonGroup sets children' );
      options.children = radioButtons;

      super( options );

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
    }

    /**
     * @public
     * @override
     */
    dispose() {
      this.disposeAquaRadioButtonGroup();
      super.dispose();
    }
  }

  return sun.register( 'AquaRadioButtonGroup', AquaRadioButtonGroup );
} );
