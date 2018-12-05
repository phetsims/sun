// Copyright 2018, University of Colorado Boulder

/**
 * General dialog type
 * Used to live at 'JOIST/Dialog'. Moved to 'SUN/Dialog' on 4/10/2018
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessibilityUtil = require( 'SCENERY/accessibility/AccessibilityUtil' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var AlignBox = require( 'SCENERY/nodes/AlignBox' );
  var DialogIO = require( 'SUN/DialogIO' );
  var Display = require( 'SCENERY/display/Display' );
  var FullScreen = require( 'SCENERY/util/FullScreen' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var SunA11yStrings = require( 'SUN/SunA11yStrings' );
  var Tandem = require( 'TANDEM/Tandem' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var closeString = SunA11yStrings.close.value;

  // constants
  var CLOSE_BUTTON_WIDTH = 14;

  /**
   * @param {Node} content - The content to display inside the dialog (not including the title)
   * @param {Object} [options]
   * @constructor
   */
  function Dialog( content, options ) {

    var self = this;

    options = _.extend( {

      /* Margins and spacing:
       ____________________________________________________________________________
      |                                     |                          |           |
      |                                     |                          closeButton |
      |                                     topMargin                  TopMargin   |
      |                                     |                         _|___        |
      |                  ___________________|____________________    |     |       |
      |--------l--------|                                        |-x-|  X  |---c---|
      |        e        |   Title                                | S |_____|   l   |
      |        f        |________________________________________| P           o   |
      |        t        |   |                                    | a           s   |
      |        M        |   ySpacing                             | c           e   |
      |        a        |___|____________________________________| i           B   |
      |        r        |                                        | n           u   |
      |        g        |   Content                              | g           t   |
      |        i        |                                        |             t   |
      |        n        |                                        |             o   |
      |                 |                                        |             n   |
      |                 |                                        |             R   |
      |                 |                                        |             i   |
      |                 |                                        |             g   |
      |                 |                                        |             h   |
      |                 |                                        |             M   |
      |                 |________________________________________|             a   |
      |                                     |                                  r   |
      |                                     |                                  g   |
      |                                     bottomMargin                       i   |
      |                                     |                                  n   |
      |_____________________________________|______________________________________|
       */

      xSpacing: 10, // {number} how far the title and content is placed to the left of the close button
      ySpacing: 10, // {number} vertical space between title and content
      topMargin: 15, // {number} margin above content, or above title if provided
      bottomMargin: 15, // {number} margin below content
      leftMargin: null, // {number|null} margin to the left of the content.  If null, this is computed so that we have
      // the same margins on the left and right of the content.
      closeButtonTopMargin: 10, // {number} margin above the close button
      closeButtonRightMargin: 10, // {number} margin to the right of the close button

      // more Dialog-specific options
      modal: true, // {boolean} modal dialogs prevent interaction with the rest of the sim while open
      title: null, // {Node|null} title to be displayed at top
      titleAlign: 'center', // horizontal alignment of the title: {string} left, right or center

      // {function} which sets the dialog's position in global coordinates. called as
      // layoutStrategy( dialog, simBounds, screenBounds, scale )
      layoutStrategy: Dialog.DEFAULT_LAYOUT_STRATEGY,

      // close button options
      closeButtonListener: function() { self.hide(); },
      closeButtonTouchAreaXDilation: 0,
      closeButtonTouchAreaYDilation: 0,
      closeButtonMouseAreaXDilation: 0,
      closeButtonMouseAreaYDilation: 0,

      // {function|null} called after the dialog is shown, see https://github.com/phetsims/joist/issues/478
      showCallback: null,

      // {function|null} called after the dialog is hidden, see https://github.com/phetsims/joist/issues/478
      hideCallback: null,

      // pass through to Panel options
      cornerRadius: 10, // {number} radius of the dialog's corners
      resize: true, // {boolean} whether to resize if content's size changes
      fill: 'white', // {string|Color}
      stroke: 'black', // {string|Color}
      backgroundPickable: true,
      tandem: Tandem.optional,
      phetioType: DialogIO,
      phetioReadOnly: false, // default to false so it can pass it through to the close button
      phetioState: false, // default to false so it can pass it through to the close button

      // a11y options
      tagName: 'div',
      ariaRole: 'dialog',
      focusOnCloseNode: null // {Node} receives focus on close, if null focus returns to element that had focus on open
    }, options );

    assert && assert( options.xMargin === undefined, 'Dialog sets xMargin' );
    options.xMargin = 0;
    assert && assert( options.yMargin === undefined, 'Dialog sets yMargin' );
    options.yMargin = 0;

    // if left margin is specified in options, use it. otherwise, set it to make the left right gutters symmetrical
    if ( options.leftMargin === null ) {
      options.leftMargin = options.xSpacing + CLOSE_BUTTON_WIDTH + options.closeButtonRightMargin;
    }

    // @private (read-only)
    this.isModal = options.modal;

    // @private
    this.showCallback = options.showCallback;
    this.hideCallback = options.hideCallback;

    // see https://github.com/phetsims/joist/issues/293
    assert && assert( this.isModal, 'Non-modal dialogs not currently supported' );

    // @protected - whether the dialog is showing
    this.isShowing = false;

    // create close button
    var closeButton = new CloseButton( {

      iconLength: CLOSE_BUTTON_WIDTH,
      listener: function() {
        options.closeButtonListener();

        // if listener was fired because of accessibility
        if ( closeButton.buttonModel.isA11yClicking() ) {
          self.focusActiveElement();
        }
      },

      // phet-io
      tandem: options.tandem.createTandem( 'closeButton' ),
      phetioReadOnly: options.phetioReadOnly, // match the readOnly of the Dialog
      phetioState: options.phetioState, // match the state transfer of the Dialog

      // a11y
      tagName: 'button',
      innerContent: closeString
    } );

    // touch/mouse areas for the close button
    closeButton.touchArea = closeButton.bounds.dilatedXY(
      options.closeButtonTouchAreaXDilation,
      options.closeButtonTouchAreaYDilation
    );
    closeButton.mouseArea = closeButton.bounds.dilatedXY(
      options.closeButtonMouseAreaXDilation,
      options.closeButtonMouseAreaYDilation
    );

    // @private (a11y)
    this.closeButton = closeButton;

    // Align content, title, and close button using spacing and margin options

    // align content and title (if provided) vertically
    var contentAndTitle = new VBox( {
      children: options.title ? [ options.title, content ] : [ content ],
      spacing: options.ySpacing,
      align: options.titleAlign
    } );

    // add topMargin, bottomMargin, and leftMargin
    var contentAndTitleWithMargins = new AlignBox( contentAndTitle, {
      topMargin: options.topMargin,
      bottomMargin: options.bottomMargin,
      leftMargin: options.leftMargin
    } );

    // add closeButtonTopMargin and closeButtonRightMargin
    var closeButtonWithMargins = new AlignBox( closeButton, {
      topMargin: options.closeButtonTopMargin,
      rightMargin: options.closeButtonRightMargin
    } );

    // create content for Panel
    var dialogContent = new HBox( {
      children: [ contentAndTitleWithMargins, closeButtonWithMargins ],
      spacing: options.xSpacing,
      align: 'top'
    } );

    Panel.call( this, dialogContent, options );

    var sim = window.phet.joist.sim;

    // @private
    this.updateLayout = function() {
      options.layoutStrategy( self, sim.boundsProperty.value, sim.screenBoundsProperty.value, sim.scaleProperty.value );
    };

    this.updateLayout();

    // @private
    this.sim = sim;

    // a11y - set the order of content, close button first so remaining content can be read from top to bottom
    // with virtual cursor
    this.accessibleOrder = [ closeButton, options.title, content ].filter( function( node ) {
      return node !== undefined;
    } );

    // a11y - set the aria-labelledby relation so that whenever focus enters the dialog the title is read
    if ( options.title && options.title.tagName ) {
      this.addAriaLabelledbyAssociation( {
        thisElementName: AccessiblePeer.PRIMARY_SIBLING,
        otherNode: options.title,
        otherElementName: AccessiblePeer.PRIMARY_SIBLING
      } );
    }

    // must be removed on dispose
    this.sim.resizedEmitter.addListener( this.updateLayout );

    // @private (a11y) - the active element when the dialog is shown, tracked so that focus can be restored on close
    this.activeElement = options.focusOnCloseNode || null;

    // a11y - close the dialog when pressing "escape"
    var escapeListener = {
      keydown: function( event ) {
        var domEvent = event.domEvent;

        if ( domEvent.keyCode === KeyboardUtil.KEY_ESCAPE ) {
          domEvent.preventDefault();
          self.hide();
          self.focusActiveElement();
        }
        else if ( domEvent.keyCode === KeyboardUtil.KEY_TAB && FullScreen.isFullScreen() ) {

          // prevent a particular bug in Windows 7/8.1 Firefox where focus gets trapped in the document
          // when the navigation bar is hidden and there is only one focusable element in the DOM
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=910136
          var activeId = Display.focus.trail.getUniqueId();
          var noNextFocusable = AccessibilityUtil.getNextFocusable().id === activeId;
          var noPreviousFocusable = AccessibilityUtil.getPreviousFocusable().id === activeId;

          if ( noNextFocusable && noPreviousFocusable ) {
            domEvent.preventDefault();
          }
        }
      }
    };
    this.addInputListener( escapeListener );

    // @private - to be called on dispose()
    this.disposeDialog = function() {
      self.sim.resizedEmitter.removeListener( self.updateLayout );
      self.removeInputListener( escapeListener );

      closeButton.dispose();

      // remove dialog content from scene graph, but don't dispose because Panel
      // needs to remove listeners on the content in its dispose()
      dialogContent.removeAllChildren();
      dialogContent.detach();
    };
  }

  sun.register( 'Dialog', Dialog );

  // @private
  Dialog.DEFAULT_LAYOUT_STRATEGY = function( dialog, simBounds, screenBounds, scale ) {

    // The size is set in the Sim.topLayer, but we need to update the location here
    dialog.center = simBounds.center.times( 1.0 / scale );
  };

  inherit( Panel, Dialog, {

    // @public
    show: function() {
      if ( !this.isShowing ) {
        window.phet.joist.sim.showPopup( this, this.isModal );
        this.isShowing = true;

        // a11y - store the currently active element before hiding all other accessible content
        // so that the active element isn't blurred
        this.activeElement = this.activeElement || Display.focusedNode;
        this.setAccessibleViewsVisible( false );

        // In case the window size has changed since the dialog was hidden, we should try layout out again.
        // See https://github.com/phetsims/joist/issues/362
        this.updateLayout();

        // Do this last
        this.showCallback && this.showCallback();
      }
    },

    /**
     * Hide the dialog.  If you create a new dialog next time you show(), be sure to dispose this
     * dialog instead.
     * @public
     */
    hide: function() {
      if ( this.isShowing ) {

        window.phet.joist.sim.hidePopup( this, this.isModal );
        this.isShowing = false;

        // a11y - when the dialog is hidden, make all ScreenView content visible to assistive technology
        this.setAccessibleViewsVisible( true );

        // Do this last
        this.hideCallback && this.hideCallback();
      }
    },

    /**
     * Make eligible for garbage collection.
     * @public
     */
    dispose: function() {
      this.hide();
      this.disposeDialog();
      Panel.prototype.dispose.call( this );
    },

    /**
     * Hide or show all accessible content related to the sim ScreenViews, navigation bar, and alert content. Instead
     * of using setVisible, we have to remove the subtree of accessible content from each view element in order to
     * prevent an IE11 bug where content remains invisible in the accessibility tree, see
     * https://github.com/phetsims/john-travoltage/issues/247
     *
     * @param {boolean} visible
     */
    setAccessibleViewsVisible: function( visible ) {
      for ( var i = 0; i < this.sim.screens.length; i++ ) {
        this.sim.screens[ i ].view.accessibleVisible = visible;
      }
      this.sim.navigationBar.accessibleVisible = visible;
      this.sim.homeScreen && this.sim.homeScreen.view.setAccessibleVisible( visible );

      // workaround for a strange Edge bug where this child of the navigation bar remains visible,
      // see https://github.com/phetsims/a11y-research/issues/30
      if ( this.sim.navigationBar.keyboardHelpButton ) {
        this.sim.navigationBar.keyboardHelpButton.accessibleVisible = visible;
      }
    },

    /**
     * If there is an active element, focus it.  Should almost always be called after the Dialog has been closed.
     *
     * @public
     * @a11y
     */
    focusActiveElement: function() {
      this.activeElement && this.activeElement.focus();
    },

    /**
     * Place keyboard focus on the close button, useful when opening the dialog with an accessibility interaction.
     * @public
     */
    focusCloseButton: function() {
      this.closeButton.focus();
    }
  } );


  /**
   * The close button for Dialog
   * A flat x
   *
   * @param {Object} [options] - see RectangularPushButton
   * @constructor
   */
  function CloseButton( options ) {
    options = _.extend( {
      iconLength: 7,
      baseColor: 'transparent',
      buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy,
      xMargin: 0,
      yMargin: 0,
      listener: null // {function} called when the button is pressed
    }, options );

    // close button shape, an 'X'
    var closeButtonShape = new Shape()
      .moveTo( -options.iconLength / 2, -options.iconLength / 2 )
      .lineTo( options.iconLength / 2, options.iconLength / 2 )
      .moveTo( options.iconLength / 2, -options.iconLength / 2 )
      .lineTo( -options.iconLength / 2, options.iconLength / 2 );

    assert && assert( !options.content, 'Dialog.CloseButton sets content' );

    options.content = new Path( closeButtonShape, {
      stroke: 'black',
      lineCap: 'round',
      lineWidth: 2
    } );

    RectangularPushButton.call( this, options );
  }

  sun.register( 'Dialog.CloseButton', CloseButton );

  inherit( RectangularPushButton, CloseButton );

  return Dialog;
} );