// Copyright 2017-2019, University of Colorado Boulder

/**
 * Class for an item that is listed in the PhetMenu
 * See PhetMenu.js for more information
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessibilityUtil = require( 'SCENERY/accessibility/AccessibilityUtil' );
  var FireListener = require( 'SCENERY/listeners/FireListener' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );

  // the check mark used for toggle-able menu items
  var CHECK_MARK_NODE = new FontAwesomeNode( 'check', {
    fill: 'rgba(0,0,0,0.7)',
    scale: 0.4
  } );

  // constants
  var FONT_SIZE = 18;
  var HIGHLIGHT_COLOR = '#a6d2f4';
  var MAX_ITEM_WIDTH = 400;
  var CHECK_PADDING = 2;  // padding between the check and text
  var CHECK_OFFSET = CHECK_MARK_NODE.width + CHECK_PADDING; // offset that includes the check mark's width and padding
  var LEFT_X_MARGIN = 2;
  var RIGHT_X_MARGIN = 5;
  var Y_MARGIN = 3;
  var CORNER_RADIUS = 5;

  /**
   * @param {Number} width - the width of the menu item
   * @param {Number} height - the height of the menu item
   * @param {Function} closeCallback - called when closing the dialog that the menu item opened
   * @param {String} text
   * @param {Function} callback
   * @param {Object} [options]
   * @constructor
   */
  function MenuItem( width, height, closeCallback, text, callback, options ) {
    var self = this;

    // Extend the object with defaults.
    options = _.extend( {
      cursor: 'pointer',
      tandem: Tandem.optional,
      textFill: 'black',

      // phet-io
      phetioDocumentation: 'Item buttons shown in a popup menu',
      phetioEventType: PhetioObject.EventType.USER,

      // a11y
      tagName: 'button',
      focusAfterCallback: false, // whether or not next focusable element should receive focus after the callback
      containerTagName: 'li',
      containerAriaRole: 'none', // this is required for JAWS to handle focus correctly, see https://github.com/phetsims/john-travoltage/issues/225
      innerContent: text,
      ariaRole: 'menuitem'
    }, options );

    Node.call( this );

    var textNode = new Text( text, {
      font: new PhetFont( FONT_SIZE ),
      fill: options.textFill,
      maxWidth: MAX_ITEM_WIDTH
    } );

    var highlight = new Rectangle( 0, 0, width + LEFT_X_MARGIN + RIGHT_X_MARGIN + CHECK_OFFSET,
      height + Y_MARGIN + Y_MARGIN, CORNER_RADIUS, CORNER_RADIUS );

    this.addChild( highlight );
    this.addChild( textNode );

    textNode.left = highlight.left + LEFT_X_MARGIN + CHECK_OFFSET; // text is left aligned
    textNode.centerY = highlight.centerY;

    this.addInputListener( {
      enter: function() { highlight.fill = HIGHLIGHT_COLOR; },
      exit: function() { highlight.fill = null; }
    } );

    var fire = function( event ) {
      closeCallback( event );
      callback( event );
    };

    this.addInputListener( new FireListener( {
      tandem: options.tandem.createTandem( 'inputListener' ),
      fire: fire
    } ) );

    // @public (sun)
    this.separatorBefore = options.separatorBefore;

    // if there is a check-mark property, add the check mark and hook up visibility changes
    var checkListener;
    if ( options.checkedProperty ) {
      var checkMarkWrapper = new Node( {
        children: [ CHECK_MARK_NODE ],
        right: textNode.left - CHECK_PADDING,
        centerY: textNode.centerY
      } );
      checkListener = function( isChecked ) {
        checkMarkWrapper.visible = isChecked;
      };
      options.checkedProperty.link( checkListener );
      this.addChild( checkMarkWrapper );
    }

    // a11y - activate the item when selected with the keyboard
    var clickListener = {
      click: function( event ) {
        fire();

        // limit search of next focusable to root accessible HTML element
        var rootElement = phet.joist.display.accessibleDOMElement;
        options.focusAfterCallback && AccessibilityUtil.getNextFocusable( rootElement ).focus();
      }
    };
    this.addInputListener( clickListener );

    this.mutate( options );

    // @private - dispose the menu item
    this.disposeMenuItem = function() {
      if ( options.checkedProperty ) {
        options.checkedProperty.unlink( checkListener );
      }

      self.removeInputListener( clickListener );
    };
  }

  sun.register( 'MenuItem', MenuItem );

  return inherit( Node, MenuItem, {

    // @public - dispose the menu item when it will no longer be used.
    dispose: function() {
      this.disposeMenuItem();
      Node.prototype.dispose.call( this );
    }
  } );
} );