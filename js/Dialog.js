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
  var Display = require( 'SCENERY/display/Display' );
  var FullScreen = require( 'SCENERY/util/FullScreen' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  var Node = require( 'SCENERY/nodes/Node' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var SunA11yStrings = require( 'SUN/SunA11yStrings' );
  var Tandem = require( 'TANDEM/Tandem' );
  var DialogIO = require( 'SUN/DialogIO' );

  // strings
  var closeString = SunA11yStrings.close.value;

  // constants
  var CLOSE_BUTTON_WIDTH = 7;

  /**
   * @param {Node} content - The content to display inside the dialog (not including the title)
   * @param {Object} [options]
   * @constructor
   */
  function Dialog( content, options ) {

    var self = this;

    options = _.extend( {

      // Dialog-specific options
      modal: true, // {boolean} modal dialogs prevent interaction with the rest of the sim while open
      title: null, // {Node} title to be displayed at top
      titleAlign: 'center', // horizontal alignment of the title: {string} left, right or center
      xSpacing: 20, // {number} how far the title is placed to the left of the close button
      ySpacing: 20, // {number} how far the title is placed above the content

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
      xMargin: 20,
      yMargin: 20,
      tandem: Tandem.optional,
      phetioType: DialogIO,
      phetioReadOnly: false, // default to false so it can pass it through to the close button
      phetioState: false, // default to false so it can pass it through to the close button

      // a11y options
      tagName: 'div',
      ariaRole: 'dialog',
      focusOnCloseNode: null // {Node} receives focus on close, if null focus returns to element that had focus on open
    }, options );

    // @private (read-only)
    this.isModal = options.modal;

    // @private
    this.showCallback = options.showCallback;
    this.hideCallback = options.hideCallback;

    // see https://github.com/phetsims/joist/issues/293
    assert && assert( this.isModal, 'Non-modal dialogs not currently supported' );

    // @private - whether the dialog is showing
    this.isShowing = false;

    // create close button first for layout purposes

    // close button shape, an 'X'
    var closeButtonShape = new Shape()
      .moveTo( -CLOSE_BUTTON_WIDTH, -CLOSE_BUTTON_WIDTH )
      .lineTo( CLOSE_BUTTON_WIDTH, CLOSE_BUTTON_WIDTH )
      .moveTo( CLOSE_BUTTON_WIDTH, -CLOSE_BUTTON_WIDTH )
      .lineTo( -CLOSE_BUTTON_WIDTH, CLOSE_BUTTON_WIDTH );

    var closeButtonIcon = new Path( closeButtonShape, {
      stroke: 'black',
      lineCap: 'round',
      lineWidth: 2
    } );

    var closeButton = new RectangularPushButton( {

      // RectangularPushButton
      content: closeButtonIcon,
      baseColor: 'transparent',
      buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy,
      xMargin: 0,
      yMargin: 0,
      listener: options.closeButtonListener,

      // phet-io
      tandem: options.tandem.createTandem( 'closeButton' ),
      phetioReadOnly: options.phetioReadOnly, // match the readOnly of the Dialog
      phetioState: options.phetioState, // match the state transfer of the Dialog

      // a11y
      tagName: 'button',
      innerContent: closeString,
      accessibleFire: function() {
        self.focusActiveElement();
      }
    } );

    var dialogContent = new Node( {
      children: [ content ]
    } );

    if ( options.title ) {

      var titleNode = options.title;
      dialogContent.addChild( titleNode );

      var updateTitlePosition = function() {
        switch( options.titleAlign ) {
          case 'center':
            titleNode.centerX = content.centerX;
            titleNode.setMaxWidth( content.width - 2 * ( closeButton.width + options.xSpacing ) );
            break;
          case 'left':
            titleNode.left = content.left;
            titleNode.setMaxWidth( content.width - closeButton.width - options.xSpacing );
            break;
          case 'right':
            titleNode.right = content.right - closeButton.width - options.xSpacing;
            titleNode.setMaxWidth( content.width - closeButton.width - options.xSpacing );
            break;
          default:
            throw new Error( 'unknown titleAlign for Dialog: ' + options.titleAlign );
        }
        titleNode.bottom = content.top - options.ySpacing;
      };

      if ( options.resize ) {
        content.on( 'bounds', updateTitlePosition );
        titleNode.on( 'localBounds', updateTitlePosition );
      }
      updateTitlePosition();
    }

    else { // no titleNode, use strut to create blank space
      var strut = new VStrut( closeButton.height );
      strut.bottom = content.top - options.ySpacing;
      dialogContent.addChild( strut );
    }

    Panel.call( this, dialogContent, options );

    // touch/mouse areas for the close button
    closeButton.touchArea = closeButton.bounds.dilatedXY(
      options.closeButtonTouchAreaXDilation,
      options.closeButtonTouchAreaYDilation
    );
    closeButton.mouseArea = closeButton.bounds.dilatedXY(
      options.closeButtonMouseAreaXDilation,
      options.closeButtonMouseAreaYDilation
    );

    this.addChild( closeButton );

    // @protected (a11y)
    this.closeButton = closeButton;

    var updateCloseButtonPosition = function() {
      closeButton.right = dialogContent.right;
      closeButton.top = dialogContent.top;
    };

    if ( options.resize ) {
      dialogContent.on( 'bounds', updateCloseButtonPosition );
      if ( options.title ) {
        options.title.on( 'bounds', updateCloseButtonPosition );
      }
    }
    updateCloseButtonPosition();

    var sim = window.phet.joist.sim;

    // @private
    this.updateLayout = function() {
      options.layoutStrategy( self, sim.boundsProperty.value, sim.screenBoundsProperty.value, sim.scaleProperty.value );
    };

    this.updateLayout();

    // @private
    this.sim = sim;

    // a11y - set the order of content for accessibility, title before content
    this.accessibleOrder = [ titleNode, dialogContent ].filter( function( node ) {
      return node !== undefined;
    } );

    // a11y - set the aria-labelledby relation so that whenever focus enters the dialog the title is read
    if ( options.title ) {
      options.title.tagName && this.setAriaLabelledByNode( options.title );
    }

    // must be removed on dispose
    this.sim.resizedEmitter.addListener( this.updateLayout );

    // @private (a11y) - the active element when the dialog is shown, tracked so that focus can be restored on close
    this.activeElement = options.focusOnCloseNode || null;

    // a11y - close the dialog when pressing "escape"
    var escapeListener = {
      keydown: function( event ) {
        if ( event.keyCode === KeyboardUtil.KEY_ESCAPE ) {
          event.preventDefault();
          self.hide();
          self.focusActiveElement();
        }
        else if ( event.keyCode === KeyboardUtil.KEY_TAB && FullScreen.isFullScreen() ) {

          // prevent a particular bug in Windows 7/8.1 Firefox where focus gets trapped in the document
          // when the navigation bar is hidden and there is only one focusable element in the DOM
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=910136
          var activeId = Display.focus.trail.getUniqueId();
          var noNextFocusable = AccessibilityUtil.getNextFocusable().id === activeId;
          var noPreviousFocusable = AccessibilityUtil.getPreviousFocusable().id === activeId;

          if ( noNextFocusable && noPreviousFocusable ) {
            event.preventDefault();
          }
        }
      }
    };
    this.addAccessibleInputListener( escapeListener );

    // @private - to be called on dispose()
    this.disposeDialog = function() {
      self.sim.resizedEmitter.removeListener( self.updateLayout );
      self.removeAccessibleInputListener( escapeListener );

      closeButton.dispose();

      if ( options.resize ) {
        dialogContent.off( 'bounds', updateCloseButtonPosition );
        if ( options.title ) {
          options.title.off( 'bounds', updateCloseButtonPosition );
          titleNode.off( 'localBounds', updateTitlePosition );
          content.off( 'bounds', updateTitlePosition );
        }
      }

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

  return inherit( Panel, Dialog, {

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
        this.sim.screens[ i ].view.accessibleContentDisplayed = visible;
      }
      this.sim.navigationBar.accessibleContentDisplayed = visible;
      this.sim.homeScreen && this.sim.homeScreen.view.setAccessibleContentDisplayed( visible );

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
    }
  } );
} );