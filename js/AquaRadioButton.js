// Copyright 2013-2015, University of Colorado Boulder

/**
 * Radio button with a pseudo-Aqua (Mac OS) look. See "options" comment for list of options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadioButton = require( 'SUN/RadioButton' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var TAquaRadioButton = require( 'SUN/TAquaRadioButton' );

  /**
   * @param property
   * @param value the value that corresponds to this button, same type as property
   * @param {Node} node that will be vertically centered to the right of the button
   * @param {Object} [options]
   * @constructor
   */
  function AquaRadioButton( property, value, node, options ) {

    options = _.extend( {
      cursor: 'pointer',
      selectedColor: 'rgb( 143, 197, 250 )', // color used to fill the button when it's selected
      deselectedColor: 'white', // color used to fill the button when it's deselected
      centerColor: 'black', // color used to fill the center of teh button when it's selected
      radius: 16, // radius of the button
      xSpacing: 8, // horizontal space between the button and the node
      stroke: 'black', // color used to stroke the outer edge of the button
      tandem: Tandem.tandemRequired(),
      phetioType: TAquaRadioButton
    }, options );

    // @public (phet-io)
    this.phetioValueType = property.phetioValueType;

    // selected node
    var selectedNode = new Node();
    var innerCircle = new Circle( options.radius / 3, { fill: options.centerColor } );
    var outerCircleSelected = new Circle( options.radius, { fill: options.selectedColor, stroke: options.stroke } );

    // @private
    this.selectedCircleButton = new Node( {
      children: [ outerCircleSelected, innerCircle ]
    } );
    selectedNode.addChild( this.selectedCircleButton );
    selectedNode.addChild( node );
    node.left = outerCircleSelected.right + options.xSpacing;
    node.centerY = outerCircleSelected.centerY;

    // deselected node
    var deselectedNode = new Node();

    // @private
    this.deselectedCircleButton = new Circle( options.radius, {
      fill: options.deselectedColor,
      stroke: options.stroke
    } );
    deselectedNode.addChild( this.deselectedCircleButton );
    deselectedNode.addChild( node );
    node.left = this.deselectedCircleButton.right + options.xSpacing;
    node.centerY = this.deselectedCircleButton.centerY;

    RadioButton.call( this, property, value, selectedNode, deselectedNode, options );
  }

  sun.register( 'AquaRadioButton', AquaRadioButton );

  return inherit( RadioButton, AquaRadioButton, {

    /**
     * Sets whether the circular part of the radio button will be displayed.
     * @param {boolean} circleButtonVisible
     * @public
     */
    setCircleButtonVisible: function( circleButtonVisible ) {
      this.deselectedCircleButton.visible = circleButtonVisible;
      this.selectedCircleButton.visible = circleButtonVisible;
    }
  } );
} );