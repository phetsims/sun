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
      tandem: null
    }, options );

    var thisNode = this;
    Node.call( thisNode );

    //Add an invisible node to make sure the layout for selected vs deselected is the same
    var background = new Rectangle( selectedNode.bounds.union( deselectedNode.bounds ) );
    selectedNode.pickable = deselectedNode.pickable = false; // the background rectangle suffices

    thisNode.addChild( background );
    thisNode.addChild( selectedNode );
    thisNode.addChild( deselectedNode );

    // sync control with model
    var syncWithModel = function( newValue ) {
      selectedNode.visible = ( newValue === value );
      deselectedNode.visible = !selectedNode.visible;
    };
    property.link( syncWithModel );

    // set property value on fire
    var buttonListener = new ButtonListener( {
      fire: function() {
        thisNode.trigger1( 'startedCallbacksForFired', value );
        property.set( value );
        thisNode.trigger1( 'endedCallbacksForFired', value );
      }
    } );
    thisNode.addInputListener( buttonListener );

    this.mutate( options );

    options.tandem && options.tandem.addInstance( this );

    this.disposeRadioButton = function() {
      options.tandem && options.tandem.removeInstance( this );
      thisNode.removeInputListener( buttonListener );
      property.unlink( syncWithModel );
    };
  }

  return inherit( Node, RadioButton, {

      // Provide dispose() on the prototype for ease of subclassing.
      dispose: function() {
        this.disposeRadioButton();
      }
    }
  );
} );
