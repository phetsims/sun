// Copyright 2002-2014, University of Colorado Boulder

/**
 * Toggle button that switches the value of a boolean property when pressed
 * and also switches the displayed icon.
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/experimental/buttons/RectangularPushButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  function ToggleButton2( trueNode, falseNode, booleanProperty, options ) {
    options = _.extend( {
      addRectangle: false,
      padX: 10,
      padY: 10,
      cursor: 'pointer',
      listener: function() { booleanProperty.value = !booleanProperty.value },
      accessibilityLabel: '',

      // In 'radioButton' mode, pressing a toggle button repeatedly sets the
      // value only to true.  Otherwise it sets it to true/false alternately.
      // TODO: See note below about removing support for this mode.
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

    RectangularPushButton.call( this, content, options );

    // TODO: Revisit this and decide if we should just have a separate radio
    // button.  For now, as of March 2014, support for radio button mode is
    // being removed.
    if ( options.radioButton ) { throw new Error( 'Radio button mode not supported by ToggleButton' ) }
    ;
    /*
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
     */
  }

  return inherit( RectangularPushButton, ToggleButton2 );
} );
