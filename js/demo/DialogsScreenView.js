// Copyright 2018, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Dialog = require( 'SUN/Dialog' );
  const Font = require( 'SCENERY/util/Font' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const sun = require( 'SUN/sun' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  const BUTTON_FONT = new Font( { size: 20 } );

  /**
   * @constructor
   */
  function DialogsScreenView() {

    ScreenView.call( this );

    // dialog will be created the first time the button is pressed, lazily because Dialog
    // requires sim bounds during Dialog construction
    let dialog = null;

    const modalDialogButton = new RectangularPushButton( {
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

    const resizeButton = new RectangularPushButton( {
      content: new Text( 'Resize', { font: new Font( { size: 18 } ) } )
    } );

    const minWidth = 1.5 * resizeButton.width;
    const minHeight = 1.5 * resizeButton.height;

    // This rectangle represents that bounds of the Dialog's content.
    const randomRect = new Rectangle( 0, 0, minWidth, minHeight, { stroke: 'red' } );
    resizeButton.center = randomRect.center;

    resizeButton.addListener( function() {
      randomRect.rectWidth = minWidth + phet.joist.random.nextDouble() * 200;
      randomRect.rectHeight = minHeight + phet.joist.random.nextDouble() * 100;
      resizeButton.center = randomRect.center;
    } );

    const contentNode = new Node( { children: [ randomRect, resizeButton ] } );

    return new Dialog( contentNode, {
      titleAlign: 'center',
      modal: modal,
      hasCloseButton: !modal,
      title: new Text( 'Title', { font: new Font( { size: 32 } ) } )
    } );
  };

  return inherit( ScreenView, DialogsScreenView );
} );