// Copyright 2002-2014, University of Colorado Boulder

/**
 * Toggle button that switches the value of a boolean property when pressed
 * and also switches the displayed icon.
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton2 = require( 'SUN/experimental/buttons/RectangularPushButton2' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  function ToggleButton2( trueNode, falseNode, booleanProperty, options ) {
    var toggleButton = this;

    options = _.extend( {
      addRectangle: false,
      padX: 10,
      padY: 10,
      cursor: 'pointer',
      label: '', // TODO: Rename this to something more intuitive, like 'soundCaption'

      // In 'radioButton' mode, pressing a toggle button repeatedly sets the
      // value only to true.  Otherwise it sets it to true/false alternately.
      radioButton: false
    }, options );

    var content = new ToggleNode( trueNode, falseNode, booleanProperty );

    // TODO: Is this needed with the new version (new as of March 2014)?
    if ( options.addRectangle ) {
      this.path = new Rectangle( 0, 0, content.width + options.padX, content.height + options.padY, 10, 10, {stroke: 'black', lineWidth: 1, fill: '#e3e980'} );
      this.addChild( this.path );
      content.centerX = this.path.width / 2;
      content.centerY = this.path.height / 2;
    }

    RectangularPushButton2.call( this, content, options );

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

    // Create a peer for accessibility
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

  return inherit( RectangularPushButton2, ToggleButton2 );
} );
