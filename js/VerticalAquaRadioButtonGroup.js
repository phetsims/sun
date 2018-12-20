// Copyright 2013-2018, University of Colorado Boulder

/**
 * Convenience type for creating a vertical list of AquaRadioButtons.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // a11y - An id for each instance of VerticalAquaRadioButtonGroup, passed to individual buttons in the group.
  // Each button in a radio button group must have the same "name" attribute to be considered in a group, otherwise
  // arrow keys will navigate all radio type inputs in the document.
  var instanceCount = 0;

  /**
   * @param {Object[]} items - Each item describes a radio button, and is an object with these properties:
   *    node: Node, // label for the button
   *    value: *, // value associated with the button
   *    property: Property.<*>, // Property associated with the button
   *    [tandemName: Tandem], // optional tandem for PhET-iO
   *    [labelContent: string] // optional label for a11y
   * @param {Object} [options]
   * @constructor
   */
  function VerticalAquaRadioButtonGroup( items, options ) {

    instanceCount++;

    options = _.extend( {

      // {Object|null} options passed to constructor of the AquaRadioButtons
      radioButtonOptions: null,

      // dilation of pointer areas for each radio button, y dimension is computed
      touchAreaXDilation: 0,
      mouseAreaXDilation: 0,

      // supertype options
      spacing: 3, // vertical space between each button
      tandem: Tandem.required,

      // supertype a11y options
      tagName: 'ul',
      groupFocusHighlight: true

    }, options );

    // Verify that the client hasn't set options that we will be overwriting.
    assert && assert( !options.children, 'VerticalAquaRadioButtonGroup sets children' );

    // Determine the max item width
    var maxItemWidth = 0;
    for ( var i = 0; i < items.length; i++ ) {
      maxItemWidth = Math.max( maxItemWidth, items[ i ].node.width );
    }

    // Create a radio button for each item
    options.children = [];
    for ( i = 0; i < items.length; i++ ) {

      var item = items[ i ];

      // Content for the radio button. Add an invisible strut, so that buttons have uniform width.
      var content = new Node( {
        children: [ new HStrut( maxItemWidth ), item.node ]
      } );

      var radioButton = new AquaRadioButton( item.property, item.value, content,
        _.extend( {}, options.radioButtonOptions, {
          tandem: item.tandemName ? options.tandem.createTandem( item.tandemName ) : Tandem.required,
          labelContent: item.labelContent || null,
          a11yNameAttribute: instanceCount
        } ) );

      // set pointer areas, y dimensions are computed
      var yDilation = options.spacing / 2;
      radioButton.mouseArea = radioButton.localBounds.dilatedXY( options.mouseAreaXDilation, yDilation );
      radioButton.touchArea = radioButton.localBounds.dilatedXY( options.touchAreaXDilation, yDilation );

      options.children.push( radioButton );
    }

    VBox.call( this, options );
  }

  sun.register( 'VerticalAquaRadioButtonGroup', VerticalAquaRadioButtonGroup );

  return inherit( VBox, VerticalAquaRadioButtonGroup );
} );
