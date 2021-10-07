// Copyright 2017-2021, University of Colorado Boulder

/**
 * Class for an item that is listed in the PhetMenu
 * See PhetMenu.js for more information
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../phet-core/js/merge.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import Voicing from '../../scenery/js/accessibility/voicing/Voicing.js';
import FireListener from '../../scenery/js/listeners/FireListener.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import checkSolidShape from '../../sherpa/js/fontawesome-5/checkSolidShape.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

// the check mark used for toggle-able menu items
const CHECK_MARK_NODE = new Path( checkSolidShape, {
  fill: 'rgba(0,0,0,0.7)',
  maxWidth: 15.5
} );

// constants
const FONT_SIZE = 18;
const HIGHLIGHT_COLOR = '#a6d2f4';
const MAX_ITEM_WIDTH = 400;
const CHECK_PADDING = 2;  // padding between the check and text
const CHECK_OFFSET = CHECK_MARK_NODE.width + CHECK_PADDING; // offset that includes the check mark's width and padding
const LEFT_X_MARGIN = 2;
const RIGHT_X_MARGIN = 5;
const Y_MARGIN = 3;
const CORNER_RADIUS = 5;

class MenuItem extends Node {
  /**
   * @param {Number} width - the width of the menu item
   * @param {Number} height - the height of the menu item
   * @param {Function} closeCallback - called when closing the dialog that the menu item opened
   * @param {String} text
   * @param {Function} callback
   * @param {boolean} present - if this MenuItem will be shown in the menu. Some items are just created to maintain a
   *                              consistent PhET-iO API for all sim runtimes, see https://github.com/phetsims/phet-io/issues/1457
   * @param {Object} [options]
   */
  constructor( width, height, closeCallback, text, callback, present, options ) {

    // Extend the object with defaults.
    options = merge( {
      cursor: 'pointer',
      textFill: 'black',

      // if there should be a horizontal separator between this MenuItem and the one immediately previous
      separatorBefore: false,

      // {Property.<boolean>} - if provided add a checkmark next to the MenuItem text whenever this Property is true.
      checkedProperty: null,

      // @param {function} - Called AFTER closeCallback, use this to move focus to a particular Node after all the
      // work of selecting the MenuItem is done. Often focus needs to move to the PhetButton, but that may not be
      // the case if the MenuItem opens a popup (for example).
      handleFocusCallback: () => {},

      // phet-io
      tandem: Tandem.OPTIONAL,
      phetioDocumentation: 'Item buttons shown in a popup menu',
      phetioEventType: EventType.USER,

      // pdom
      tagName: 'button',
      containerTagName: 'li',
      containerAriaRole: 'none', // this is required for JAWS to handle focus correctly, see https://github.com/phetsims/john-travoltage/issues/225
      innerContent: text,
      ariaRole: 'menuitem',

      // 'menuitem' role does not get click events on iOS VoiceOver, position siblings so that
      // we get Pointer events instead
      positionInPDOM: true,

      // voicing
      voicingNameResponse: text
    }, options );

    super();

    this.initializeVoicing();

    // @public (read-only) {boolean}
    this.present = present;

    const textNode = new Text( text, {
      font: new PhetFont( FONT_SIZE ),
      fill: options.textFill,
      maxWidth: MAX_ITEM_WIDTH
    } );

    const highlight = new Rectangle( 0, 0, width + LEFT_X_MARGIN + RIGHT_X_MARGIN + CHECK_OFFSET,
      height + Y_MARGIN + Y_MARGIN, CORNER_RADIUS, CORNER_RADIUS );

    this.addChild( highlight );
    this.addChild( textNode );

    textNode.left = highlight.left + LEFT_X_MARGIN + CHECK_OFFSET; // text is left aligned
    textNode.centerY = highlight.centerY;

    this.addInputListener( {
      enter: () => { highlight.fill = HIGHLIGHT_COLOR; },
      exit: () => { highlight.fill = null; }
    } );

    this.addInputListener( new FireListener( {
      tandem: options.tandem.createTandem( 'inputListener' ),
      fire: event => {
        closeCallback( event );
        callback( event );

        options.handleFocusCallback( event );
      }
    } ) );

    // @public (sun)
    this.separatorBefore = options.separatorBefore;

    // if there is a check-mark property, add the check mark and hook up visibility changes
    let checkListener;
    if ( options.checkedProperty ) {
      const checkMarkWrapper = new Node( {
        children: [ CHECK_MARK_NODE ],
        right: textNode.left - CHECK_PADDING,
        centerY: textNode.centerY
      } );
      checkListener = isChecked => {
        checkMarkWrapper.visible = isChecked;
      };
      options.checkedProperty.link( checkListener );
      this.addChild( checkMarkWrapper );
    }

    this.mutate( options );

    // @private - dispose the menu item
    this.disposeMenuItem = () => {
      if ( options.checkedProperty ) {
        options.checkedProperty.unlink( checkListener );
      }
      this.disposeVoicing();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeMenuItem();
    super.dispose();
  }
}

Voicing.compose( MenuItem );

sun.register( 'MenuItem', MenuItem );
export default MenuItem;