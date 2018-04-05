// Copyright 2013-2018, University of Colorado Boulder

/**
 * Convenience type for creating a group of AquaRadioButtons with vertical orientation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Checkbox = require( 'SUN/Checkbox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {Object[]} items - Each item describes a checkbox, and is an object with these properties:
   *    content: Node, // label for the button
   *    property: Property.<boolean>, // Property associated with the button
   *    indent: number, // how much to indent each check box from the left edge
   *    [tandemName: Tandem] // optional tandem for PhET-iO
   * @param {Object} [options]
   * @constructor
   */
  function VerticalCheckboxGroup( items, options ) {

    options = _.extend( {

      // dilation of pointer areas, y dimension is computed
      touchAreaXDilation: 5,
      mouseAreaXDilation: 5,

      //TODO #344 this is the total of left and right margins, replace with xMargin?
      padding: 8,

      //TODO #344 these are passed to Checkbox, replace with checkboxOptions: {...}
      boxWidth: 21,
      checkboxColor: 'black',

      // supertype options
      spacing: 10, // vertical spacing
      align: 'left',
      tandem: Tandem.optional
    }, options );

    // Verify that the client hasn't set options that we will be overwriting.
    assert && assert( !options.children, 'VerticalCheckboxGroup sets children' );

    //TODO #344 there's a bug here, indent for each item is not considered
    // Determine the max item width
    var maxWidth = 0;
    for ( var i = 0; i < items.length; i++ ) {
      maxWidth = Math.max( maxWidth, items[ i ].content.width );
    }

    //TODO #344 this for loop looks very much like VerticalAquaRadioButtonGroup, something to factor out?
    // Create a checkbox for each item
    options.children = [];
    for ( i = 0; i < items.length; i++ ) {

      var item = items[ i ];
      var indent = item.indent || 0;

      //TODO #344 item.content is item.node in VerticalAquaRadioButtonGroup
      // Content for the checkbox. Add an invisible strut, so that buttons have uniform width.
      var content = new Node( {
        children: [ new HStrut( maxWidth + options.padding - indent ), item.content ]
      } );

      var checkbox = new Checkbox( content, item.property, {
        checkboxColor: options.checkboxColor,
        boxWidth: options.boxWidth,
        tandem: item.tandem || Tandem.optional
      } );

      // set pointer areas, y dimensions are computed
      var yDilation = options.spacing / 2;
      checkbox.mouseArea = checkbox.localBounds.dilatedXY( options.mouseAreaXDilation, yDilation );
      checkbox.touchArea = checkbox.localBounds.dilatedXY( options.touchAreaXDilation, yDilation );

      //TODO #344 indent feature is missing from VerticalAquaRadioButtonGroup, should it be added?
      //TODO #344 I can think of other ways to indent that don't involve 2 additional nodes
      if ( item.indent ) {

        // indent the checkbox from the left edge using a strut
        options.children.push( new HBox( {
          children: [ new HStrut( item.indent ), checkbox ]
        } ) );
      }
      else {
        options.children.push( checkbox );
      }
    }

    VBox.call( this, options );
  }

  sun.register( 'VerticalCheckboxGroup', VerticalCheckboxGroup );

  return inherit( VBox, VerticalCheckboxGroup );
} );