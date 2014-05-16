// Copyright 2002-2013, University of Colorado Boulder

//Render a simple toggle button (without icons or anything)
//TODO: not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  function ToggleButtonDeprecated( trueNode, falseNode, booleanProperty, options ) {
    var toggleButton = this;

    options = _.extend( {
      addRectangle: false,
      padX: 10,
      padY: 10,
      cursor: 'pointer',
      label: '',

      //In 'radioButton' mode, pressing a toggle button repeatedly sets the value only to true.  Otherwise it sets it to true/false alternately.
      radioButton: false
    }, options );

    Node.call( this, options );

    var content = new ToggleNode( trueNode, falseNode, booleanProperty );

    if ( options.addRectangle ) {
      this.path = new Rectangle( 0, 0, content.width + options.padX, content.height + options.padY, 10, 10, {stroke: 'black', lineWidth: 1, fill: '#e3e980'} );
      this.addChild( this.path );
      content.centerX = this.path.width / 2;
      content.centerY = this.path.height / 2;
    }
    this.addChild( content );

    if ( options.radioButton ) {
      this.addInputListener( {
        up: function() {
          booleanProperty.value = true;
        }
      } );
    }
    else {
      this.addInputListener( {
        up: function() {
          booleanProperty.value = !booleanProperty.value;
        }
      } );
    }


//    Create a peer for accessibility
    this.addPeer( '<input type="checkbox" aria-label="' + _.escape( options.label ) + '">', {
      click: function() {
        booleanProperty.value = !booleanProperty.value;
      },
      label: options.label} );//TODO: is the latter 'label' used?

    booleanProperty.link( function( value ) {
      _.each( toggleButton.instances, function( instance ) {

        //Make sure accessibility is enabled, then apply the change to the peer
        _.each( instance.peers, function( peer ) {
          peer.element.setAttribute( 'checked', value );
        } );
      } );
    } );
  }

  inherit( Node, ToggleButtonDeprecated );

  return ToggleButtonDeprecated;
} );
