// Copyright 2018, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Node = require( 'SCENERY/nodes/Node' );
  var Dialog = require( 'SUN/Dialog' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Font = require( 'SCENERY/util/Font' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var sun = require( 'SUN/sun' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var BUTTON_FONT = new Font( { size: 20 } );

  /**
   * @constructor
   */
  function DialogsScreenView() {

    ScreenView.call( this );

    // dialog will be created the first time the button is pressed, lazily because Dialog
    // requires sim bounds during Dialog construction
    var dialog = null;

    var modalDialogButton = new RectangularPushButton( {
      content: new Text( 'modal dialog', { font: BUTTON_FONT } ),
      listener: function() {
        if ( !dialog ) {
          dialog = createDialog( true );
        }
        dialog.show();
      },
      left: this.layoutBounds.left + 100,
      top: this.layoutBounds.top + 100
    } );
    this.addChild( modalDialogButton );

    // var nonModalDialogButton = new RectangularPushButton( {
    //   content: new Text( 'non-modal dialog', { font: BUTTON_FONT } ),
    //   listener: function() {
    //     createDialog( false ).show();
    //   },
    //   left: modalDialogButton.right + 20,
    //   top: modalDialogButton.top
    // } );
    // this.addChild( nonModalDialogButton );
  }

  sun.register( 'DialogsScreenView', DialogsScreenView );

  /**
   * Creates a model or non-modal dialog
   * @param {boolean} modal
   * @returns {Dialog}
   */
  var createDialog = function( modal ) {
    var randomRect = new Rectangle( 0, 0, 100, 50, { fill: 'red' } );

    var resizeButton = new RectangularPushButton( {
      content: new Text( 'Resize', { font: new Font( { size: 20 } ) } ),
      listener: function() {
        randomRect.rectWidth = 50 + phet.joist.random.nextDouble() * 150;
        randomRect.rectHeight = 50 + phet.joist.random.nextDouble() * 150;
      },
      bottom: randomRect.top - 10,
    } );

    var contentNode = new Node( { children: [ resizeButton, randomRect ] } );

    return new Dialog( contentNode, {
      titleAlign: 'center',
      modal: modal,
      hasCloseButton: !modal,
      title: new Text( 'Title', { font: new Font( { size: 32 } ) } )
    } );
  };

  return inherit( ScreenView, DialogsScreenView );
} );