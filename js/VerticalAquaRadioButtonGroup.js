// Copyright 2013-2015, University of Colorado Boulder

//Render a simple vertical check box group, where the buttons all have the same sizes
//TODO: not ready for use in simulations, it will need further development & discussion first.
//TODO: Abstract out common functionality between this and VerticalCheckBoxGroup
define( function( require ) {
  'use strict';

  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );

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
      touchXPadding: 5,
      mouseXPadding: 0,
      accessibleLabel: '', // label for the entire radio button group, invisible for a11y
      accessibleDescription: '' // description for the radio buttongroup, invisible for a11y
    }, options );

    var width = 0;
    for ( var i = 0; i < items.length; i++ ) {
      width = Math.max( width, items[ i ].node.width );
    }

    var children = [];
    for ( i = 0; i < items.length; i++ ) {

      //Add an invisible strut to each content to make the widths match
      var content = new Path( Shape.rect( 0, 0, width + options.padding, 0 ), { children: [ items[ i ].node ] } );
      var radioButton = new AquaRadioButton( items[ i ].property, items[ i ].value, content, _.extend( {}, options.radioButtonOptions, { radius: options.radius } ) );
      radioButton.mouseArea = Shape.bounds( radioButton.bounds.dilatedXY( options.mouseXPadding, options.spacing / 2 ) );
      radioButton.touchArea = Shape.bounds( radioButton.bounds.dilatedXY( options.touchXPadding, options.spacing / 2 ) );
      children.push( radioButton );
    }

    //TODO these options should be added using _.extend(options, {children:..., renderer:....})
    options.children = children;
    VBox.call( this, options );

    // a11y
    this.accessibleContent = {
      createPeer: function( accessibleInstance ) {
        var trail = accessibleInstance.trail;
        var uniqueId = trail.getUniqueId();

        /**
         * Elements of the parallel DOM should look like:
         * <fieldset id="radio-button-group" role="radiogroup" aria-describedby="legend-id group-description">
         * <legend id="legend-id">Translatable Legend Text</legend>
         *    ... ( elements inside the fieldset )
         * <p id="group-description">Translatable description of the entire group.</p>
         * </fieldset>
         **/
        // create the fieldset holding all radio buttons
        var domElement = document.createElement( 'fieldset' );
        domElement.id = 'radio-button-group-' + uniqueId;
        domElement.setAttribute( 'role', 'radioGroup' );

        // create the legend
        var legendElement = document.createElement( 'legend' );
        legendElement.id = 'legend-id-' + uniqueId;
        legendElement.innerHTML = options.accessibleLabel;

        // create the description element
        var descriptionElement = document.createElement( 'p' );
        descriptionElement.id = 'group-description-' + uniqueId;
        descriptionElement.textContent = options.accessibleDescription;

        // aria-describedby can have two id's
        var descriptionId = legendElement.id + ' ' + descriptionElement.id;
        domElement.setAttribute( 'aria-describedby', descriptionId );

        // structure the elements
        domElement.appendChild( legendElement );
        domElement.appendChild( descriptionElement );

        return new AccessiblePeer( accessibleInstance, domElement );

      }
    };
  }

  sun.register( 'VerticalAquaRadioButtonGroup', VerticalAquaRadioButtonGroup );

  inherit( VBox, VerticalAquaRadioButtonGroup );

  return VerticalAquaRadioButtonGroup;
} );
