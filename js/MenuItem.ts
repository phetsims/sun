// Copyright 2017-2022, University of Colorado Boulder

/**
 * MenuItem is an item in the PhetMenu.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IProperty from '../../axon/js/IProperty.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { FireListener, TPaint, Node, NodeOptions, Path, Rectangle, SceneryEvent, Text, Voicing, VoicingOptions, WidthSizable, ManualConstraint } from '../../scenery/js/imports.js';
import checkSolidShape from '../../sherpa/js/fontawesome-5/checkSolidShape.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
import optionize from '../../phet-core/js/optionize.js';

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

type SelfOptions = {

  // if there should be a horizontal separator between this MenuItem and the one immediately previous
  separatorBefore?: boolean;

  // if provided add a checkmark next to the MenuItem text whenever this Property is true.
  checkedProperty?: IProperty<boolean> | null;

  // Called AFTER closeCallback, use this to move focus to a particular Node after all the
  // work of selecting the MenuItem is done. Often focus needs to move to the PhetButton, but that may not be
  // the case if the MenuItem opens a popup (for example).
  handleFocusCallback?: ( ( event: SceneryEvent ) => void ) | null;

  textFill?: TPaint;
};
type ParentOptions = VoicingOptions & NodeOptions;
export type MenuItemOptions = SelfOptions & ParentOptions;

export default class MenuItem extends WidthSizable( Voicing( Node ) ) {

  // if this MenuItem will be shown in the menu. Some items are just created to maintain a
  // consistent PhET-iO API for all sim runtimes, see https://github.com/phetsims/phet-io/issues/1457
  public readonly present: boolean;

  // if there should be a horizontal separator between this MenuItem and the one above it
  public readonly separatorBefore: boolean;

  private readonly disposeMenuItem: () => void;

  /**
   * @param closeCallback - called when closing the dialog that the menu item opened
   * @param text - label for the menu item
   * @param callback - called when the menu item is selected
   * @param present - see present field
   * @param [providedOptions]
   */
  public constructor( closeCallback: ( event: SceneryEvent ) => void, text: IProperty<string>,
                      callback: ( event: SceneryEvent ) => void, present: boolean, providedOptions?: MenuItemOptions ) {

    // Extend the object with defaults.
    const options = optionize<MenuItemOptions, SelfOptions, ParentOptions>()( {

      // SelfOptions
      separatorBefore: false,
      checkedProperty: null,
      handleFocusCallback: null,
      textFill: 'black',

      // VoicingOptions
      cursor: 'pointer',

      // phet-io
      tandem: Tandem.OPTIONAL,
      phetioDocumentation: 'Item buttons shown in a popup menu',
      phetioEventType: EventType.USER,

      // pdom
      tagName: 'button',
      containerTagName: 'li',
      containerAriaRole: 'none', // this is required for JAWS to handle focus correctly, see https://github.com/phetsims/john-travoltage/issues/225
      ariaRole: 'menuitem',

      // 'menuitem' role does not get click events on iOS VoiceOver, position siblings so that
      // we get Pointer events instead
      positionInPDOM: true
    }, providedOptions );

    super();

    text.link( string => {
      this.innerContent = string;
      this.voicingNameResponse = string;
    } );

    this.present = present;

    const textNode = new Text( text.value, {
      font: new PhetFont( FONT_SIZE ),
      fill: options.textFill,
      maxWidth: MAX_ITEM_WIDTH,
      textProperty: text
    } );

    const highlight = new Rectangle( {
      cornerRadius: CORNER_RADIUS
    } );

    textNode.boundsProperty.link( textBounds => {
      this.localMinimumWidth = textBounds.width + LEFT_X_MARGIN + RIGHT_X_MARGIN + CHECK_OFFSET;
      highlight.rectHeight = textBounds.height + Y_MARGIN + Y_MARGIN;
    } );

    this.localPreferredWidthProperty.link( preferredWidth => {
      if ( preferredWidth === null ) {
        preferredWidth = this.localMinimumWidth;
      }
      if ( preferredWidth ) {
        highlight.rectWidth = preferredWidth;
      }
    } );

    this.addChild( highlight );
    this.addChild( textNode );

    ManualConstraint.create( this, [ highlight, textNode ], ( highlightProxy, textNodeProxy ) => {
      textNodeProxy.left = highlightProxy.left + LEFT_X_MARGIN + CHECK_OFFSET; // text is left aligned
      textNodeProxy.centerY = highlightProxy.centerY;
    } );

    this.addInputListener( {
      enter: () => { highlight.fill = HIGHLIGHT_COLOR; },
      exit: () => { highlight.fill = null; }
    } );

    this.addInputListener( new FireListener( {
      tandem: options.tandem.createTandem( 'inputListener' ),
      fire: ( event: SceneryEvent ) => {
        closeCallback( event );
        callback( event );
        options.handleFocusCallback && options.handleFocusCallback( event );
      }
    } ) );

    this.separatorBefore = options.separatorBefore;

    // Optionally add a check mark and hook up visibility changes.
    let checkListener: ( ( isChecked: boolean ) => void ) | null = null;
    if ( options.checkedProperty ) {
      const checkMarkWrapper = new Node( {
        children: [ CHECK_MARK_NODE ],
        right: textNode.left - CHECK_PADDING,
        centerY: textNode.centerY
      } );
      checkListener = ( isChecked: boolean ) => {
        checkMarkWrapper.visible = isChecked;
      };
      options.checkedProperty.link( checkListener );
      this.addChild( checkMarkWrapper );
    }

    this.mutate( options );

    this.disposeMenuItem = () => {
      if ( options.checkedProperty && checkListener ) {
        options.checkedProperty.unlink( checkListener );
      }
    };
  }

  public override dispose(): void {
    this.disposeMenuItem();
    super.dispose();
  }
}

sun.register( 'MenuItem', MenuItem );