// Copyright 2013-2019, University of Colorado Boulder

/**
 * Convenience type for creating a group of Checkboxes with vertical orientation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Checkbox = require( 'SUN/Checkbox' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {Object[]} items - Each item describes a checkbox, and is an object with these properties:
   *    node: {Node}, // label for the button
   *    property: {Property.<boolean>}, // Property associated with the button
   *    [options]: {Object}, // Item specific options to be passed to the checkbox
   *    [tandem]: {Tandem} // optional tandem for PhET-iO
   * @param {Object} [options]
   * @constructor
   */
  function VerticalCheckboxGroup( items, options ) {

    options = _.extend( {

      // {Object|null} options passed to constructor of the Checkbox
      checkboxOptions: null,

      // dilation of pointer areas for each checkbox, y dimension is computed
      touchAreaXDilation: 5,
      mouseAreaXDilation: 5,

      // supertype options
      spacing: 10, // vertical spacing
      align: 'left',
      tandem: Tandem.optional
    }, options );

    // Verify that the client hasn't set options that we will be overwriting.
    assert && assert( !options.children, 'VerticalCheckboxGroup sets children' );

    // Determine the max item width
    var maxItemWidth = 0;
    for ( var i = 0; i < items.length; i++ ) {
      maxItemWidth = Math.max( maxItemWidth, items[ i ].node.width );
    }

    // Create a checkbox for each item
    options.children = [];
    for ( i = 0; i < items.length; i++ ) {

      var item = items[ i ];

      // Content for the checkbox. Add an invisible strut, so that checkboxes have uniform width.
      var content = new Node( {
        children: [ new HStrut( maxItemWidth ), item.node ]
      } );

      var checkbox = new Checkbox( content, item.property, _.extend( {}, options.checkboxOptions, item.options, {
        tandem: item.tandem || Tandem.optional
      } ) );

      // set pointer areas, y dimensions are computed
      var yDilation = options.spacing / 2;
      checkbox.mouseArea = checkbox.localBounds.dilatedXY( options.mouseAreaXDilation, yDilation );
      checkbox.touchArea = checkbox.localBounds.dilatedXY( options.touchAreaXDilation, yDilation );

      options.children.push( checkbox );
    }

    VBox.call( this, options );
  }

  sun.register( 'VerticalCheckboxGroup', VerticalCheckboxGroup );

  return inherit( VBox, VerticalCheckboxGroup );
} );