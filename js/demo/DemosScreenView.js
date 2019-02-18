// Copyright 2015-2019, University of Colorado Boulder

/**
 * Base type for ScreenViews that use a combo box to select a demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ComboBox = require( 'SUN/ComboBox' );
  var ComboBoxItem = require( 'SUN/ComboBoxItem' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var sun = require( 'SUN/sun' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object[]} demos - each demo has these properties:
   *   {string} label - label in the combo box
   *   {function(layoutBounds:Bounds2): Node} createNode - creates the Node for the demo
   *   {Node|null} node - the Node for the demo, created by DemosScreenView
   * @param {Object} [options]
   * @constructor
   */
  function DemosScreenView( demos, options ) {

    options = _.extend( {

      selectedDemoLabel: null, // {string|null} label field of the demo to be selected initially

      // options related to the ComboBox that selects the demo
      comboBoxCornerRadius: 4,
      comboBoxLocation: new Vector2( 20, 20 ), // {Vector2} location of ComboBox used to select a demo
      comboBoxItemFont: new PhetFont( 20 ), // {Font} font used for ComboBox items
      comboBoxItemXMargin: 12, // {number} x margin around ComboBox items
      comboBoxItemYMargin: 8, // {number} y margin around ComboBox items

      // {boolean} see https://github.com/phetsims/sun/issues/386
      // true = caches Nodes for all demos that have been selected
      // false = keeps only the Node for the selected demo in memory
      cacheDemos: false,

      tandem: Tandem.required
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
      comboBoxItems.push( new ComboBoxItem( new Text( demo.label, { font: options.comboBoxItemFont } ), demo, {

        // demo.label is like ArrowNode or TimerNode, decorate it for use as a tandem.
        tandemName: 'demo' + demo.label + 'ComboBoxItem'
      } ) );
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
      cornerRadius: options.comboBoxCornerRadius,
      xMargin: options.comboBoxItemXMargin,
      yMargin: options.comboBoxItemYMargin,
      top: options.comboBoxLocation.x,
      left: options.comboBoxLocation.y,
      tandem: options.tandem.createTandem( 'comboBox' )
    } );
    this.addChild( comboBox );

    // Make the selected demo visible
    selectedDemoProperty.link( function( demo, oldDemo ) {

      // clean up the previously selected demo
      if ( oldDemo ) {
        if ( options.cacheDemos ) {

          // make the old demo invisible
          oldDemo.node.visible = false;
        }
        else {

          // delete the old demo
          demosParent.removeChild( oldDemo.node );
          oldDemo.node.dispose();
          oldDemo.node = null;
        }
      }

      if ( demo.node ) {

        // If the selected demo has an associated node, make it visible.
        demo.node.visible = true;
      }
      else {

        // If the selected demo doesn't doesn't have an associated node, create it.
        demo.node = demo.createNode( layoutBounds, {
          tandem: options.tandem.createTandem( 'demo' + demo.label )
        } );
        demosParent.addChild( demo.node );
      }
    } );
  }

  sun.register( 'DemosScreenView', DemosScreenView );

  return inherit( ScreenView, DemosScreenView );
} );
