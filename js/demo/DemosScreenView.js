// Copyright 2015, University of Colorado Boulder

/**
 * Base type for ScreenViews that use a combo box to select a demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ComboBox = require( 'SUN/ComboBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );
  var sun = require( 'SUN/sun' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Object[]} demos - each demo has:
   *   {string} label - label in the combo box
   *   {function(Bounds2): Node} getNode - creates the scene graph for the demo
   * @param {Object} [options]
   * @constructor
   */
  function DemosScreenView( demos, options ) {

    options = _.extend( {
      comboBoxLocation: new Vector2( 20, 20 ), // {Vector2} location of ComboBox used to select a demo
      comboBoxItemFont: new PhetFont( 20 ), // {Font} font used for ComboBox items
      comboBoxItemYMargin: 6, // {number} y margin around ComboBox items
      selectedDemoLabel: null // {string|null} label field of the demo to be selected initially
    }, options );

    ScreenView.call( this, options );

    var layoutBounds = this.layoutBounds;

    // Sort the demos by label, so that they appear in the combo box in alphabetical order
    demos = _.sortBy( demos, function( demo ) {
      return demo.label;
    } );

    // All demos will be children of this node, to maintain rendering order with combo box list
    var demosParent = new Node();
    this.addChild( demosParent );

    // add each demo to the combo box
    var comboBoxItems = [];
    demos.forEach( function( demo ) {
      comboBoxItems.push( ComboBox.createItem( new Text( demo.label, { font: options.comboBoxItemFont } ), demo ) );
    } );

    // Parent for the combo box popup list
    var listParent = new Node();
    this.addChild( listParent );

    // Set the initial demo
    var selectedDemo = demos[ 0 ];
    if ( options.selectedDemoLabel ) {
      selectedDemo = _.find( demos, function( demo ) {
        return ( demo.label === options.selectedDemoLabel );
      } );
      if ( !selectedDemo ) {
        throw new Error( 'demo not found: ' + options.selectedDemoLabel );
      }
    }

    // Combo box for selecting which component to view
    var selectedDemoProperty = new Property( selectedDemo );
    var comboBox = new ComboBox( comboBoxItems, selectedDemoProperty, listParent, {
      buttonFill: 'rgb( 218, 236, 255 )',
      itemYMargin: options.comboBoxItemYMargin,
      top: options.comboBoxLocation.x,
      left: options.comboBoxLocation.y
    } );
    this.addChild( comboBox );

    // Make the selected demo visible
    selectedDemoProperty.link( function( demo, oldDemo ) {

      // make the previous selection invisible
      if ( oldDemo ) {
        oldDemo.node.visible = false;
      }

      if ( demo.node ) {

        // If the selected demo has an associated node, make it visible.
        demo.node.visible = true;
      }
      else {

        // If the selected demo doesn't doesn't have an associated node, create it.
        demo.node = demo.getNode( layoutBounds );
        demosParent.addChild( demo.node );
      }
    } );
  }

  sun.register( 'DemosScreenView', DemosScreenView );

  return inherit( ScreenView, DemosScreenView );
} );
