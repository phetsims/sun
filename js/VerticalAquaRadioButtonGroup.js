// Copyright 2013-2015, University of Colorado Boulder

//Render a simple vertical check box group, where the buttons all have the same sizes
//TODO: not ready for use in simulations, it will need further development & discussion first.
//TODO: Abstract out common functionality between this and VerticalCheckBoxGroup
define( function( require ) {
  'use strict';

  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Tandem = require( 'TANDEM/Tandem' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * Main constructor.
   *
   * @param items  an array of {content, property}
   * @param {Object} [options]
   * @constructor
   */
  function VerticalAquaRadioButtonGroup( items, options ) {
    options = _.extend( {
      spacing: 3,
      padding: 8,
      radius: 12,
      radioButtonOptions: {}, // will be passed to the AquaRadioButtons
      touchAreaXDilation: 0,
      mouseAreaXDilation: 0,
      tandem: Tandem.tandemRequired()
    }, options );

    var width = 0;
    for ( var i = 0; i < items.length; i++ ) {
      width = Math.max( width, items[ i ].node.width );
    }

    var children = [];
    for ( i = 0; i < items.length; i++ ) {

      //Add an invisible strut to each content to make the widths match
      var content = new Path( Shape.rect( 0, 0, width + options.padding, 0 ), { children: [ items[ i ].node ] } );
      var radioButton = new AquaRadioButton( items[ i ].property, items[ i ].value, content, _.extend( {}, options.radioButtonOptions, {
        radius: options.radius,
        tandem: items[ i ].tandemName ? options.tandem.createTandem( items[ i ].tandemName ) : Tandem.tandemRequired()
      } ) );
      radioButton.mouseArea = Shape.bounds( radioButton.bounds.dilatedXY( options.mouseAreaXDilation, options.spacing / 2 ) );
      radioButton.touchArea = Shape.bounds( radioButton.bounds.dilatedXY( options.touchAreaXDilation, options.spacing / 2 ) );
      children.push( radioButton );
    }

    //TODO these options should be added using _.extend(options, {children:..., renderer:....})
    options.children = children;
    VBox.call( this, options );
    
  }

  sun.register( 'VerticalAquaRadioButtonGroup', VerticalAquaRadioButtonGroup );

  inherit( VBox, VerticalAquaRadioButtonGroup );

  return VerticalAquaRadioButtonGroup;
} );
