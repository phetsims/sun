// Copyright 2002-2013, University of Colorado Boulder

/**
 * Base class for radio buttons.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {Property} property
   * @param {*} value the value that corresponds to this button, same type as property
   * @param {Node} selectedNode node that will be displayed when the button is selected
   * @param {Node} deselectedNode node that will be displayed when the button is deselected
   * @param {Object} [options]
   * @constructor
   */
  function RadioButton( property, value, selectedNode, deselectedNode, options ) {

    options = _.extend( {
      cursor: 'pointer',
      focusable: true,
      componentID: null
    }, options );

    this.componentID = options.componentID;

    var thisNode = this;
    Node.call( thisNode );

    //Add an invisible node to make sure the layout for selected vs deselected is the same
    var background = new Rectangle( selectedNode.bounds.union( deselectedNode.bounds ) );
    selectedNode.pickable = deselectedNode.pickable = false; // the background rectangle suffices

    thisNode.addChild( background );
    thisNode.addChild( selectedNode );
    thisNode.addChild( deselectedNode );

    // sync control with model
    property.link( function( newValue ) {
      selectedNode.visible = ( newValue === value );
      deselectedNode.visible = !selectedNode.visible;
    } );

    // set property value on fire
    thisNode.addInputListener( new ButtonListener( {
      fire: function() {
        var messageIndex = arch && arch.start( 'user', thisNode.componentID, 'fired', { value: value } );
        property.set( value );
        arch && arch.end( messageIndex );
      }
    } ) );

    this.mutate( options );

    together && together.addComponent( this );
  }

  return inherit( Node, RadioButton, {
    dispose: function() {
      together && together.removeComponent( this );
    }
  } );
} );
