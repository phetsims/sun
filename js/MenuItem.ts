// Copyright 2017-2025, University of Colorado Boulder

/**
 * MenuItem is an item in the PhetMenu.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import type TProperty from '../../axon/js/TProperty.js';
import type TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import optionize from '../../phet-core/js/optionize.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import Voicing, { type VoicingOptions } from '../../scenery/js/accessibility/voicing/Voicing.js';
import type SceneryEvent from '../../scenery/js/input/SceneryEvent.js';
import ManualConstraint from '../../scenery/js/layout/constraints/ManualConstraint.js';
import WidthSizable from '../../scenery/js/layout/WidthSizable.js';
import FireListener from '../../scenery/js/listeners/FireListener.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import allowLinksProperty from '../../scenery/js/util/allowLinksProperty.js';
import type TPaint from '../../scenery/js/util/TPaint.js';
import EventType from '../../tandem/js/EventType.js';
import checkSolidShape from './shapes/checkSolidShape.js';
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

type SelfOptions = {

  // if there should be a horizontal separator between this MenuItem and the one immediately previous
  separatorBefore?: boolean;

  // if provided add a checkmark next to the MenuItem text whenever this Property is true.
  checkedProperty?: TProperty<boolean> | null;

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
   * @param closeCallback - called when firing the menu item, most likely this should close the PhetMenu.
   * @param labelStringProperty - label for the menu item
   * @param callback - called when the menu item is selected
   * @param present - see present field
   * @param shouldBeHiddenWhenLinksAreNotAllowed
   * @param [providedOptions]
   */
  public constructor( closeCallback: ( event: SceneryEvent | null ) => void,
                      labelStringProperty: TReadOnlyProperty<string>,
                      callback: ( event: SceneryEvent | null ) => void, present: boolean,
                      shouldBeHiddenWhenLinksAreNotAllowed: boolean,
                      providedOptions?: MenuItemOptions ) {

    // Extend the object with defaults.
    const options = optionize<MenuItemOptions, SelfOptions, ParentOptions>()( {

      // SelfOptions
      separatorBefore: false,
      checkedProperty: null,
      textFill: 'black',

      // VoicingOptions
      cursor: 'pointer',

      // phet-io
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

    if ( shouldBeHiddenWhenLinksAreNotAllowed ) {
      this.setVisibleProperty( allowLinksProperty );
    }

    const labelStringListener = ( labelString: string ) => {
      this.innerContent = labelString;
      this.voicingNameResponse = labelString;
    };
    labelStringProperty.link( labelStringListener );

    this.present = present;

    const labelText = new Text( labelStringProperty, {
      font: new PhetFont( FONT_SIZE ),
      fill: options.textFill,
      maxWidth: MAX_ITEM_WIDTH
    } );

    const highlight = new Rectangle( {
      cornerRadius: CORNER_RADIUS
    } );

    labelText.boundsProperty.link( textBounds => {
      this.localMinimumWidth = textBounds.width + LEFT_X_MARGIN + RIGHT_X_MARGIN + CHECK_OFFSET;
      highlight.rectHeight = textBounds.height + Y_MARGIN + Y_MARGIN;
    } );

    this.localPreferredWidthProperty.link( preferredWidth => {
      if ( preferredWidth === null ) {
        preferredWidth = this.localMinimumWidth;
      }
      else {
        preferredWidth = Math.max( this.localMinimumWidth || 0, preferredWidth );
      }
      if ( preferredWidth ) {
        highlight.rectWidth = preferredWidth;
      }
    } );

    this.addChild( highlight );
    this.addChild( labelText );

    ManualConstraint.create( this, [ highlight, labelText ], ( highlightProxy, labelTextProxy ) => {
      labelTextProxy.left = highlightProxy.left + LEFT_X_MARGIN + CHECK_OFFSET; // labelStringProperty is left aligned
      labelTextProxy.centerY = highlightProxy.centerY;
    } );

    this.addInputListener( {
      enter: () => { highlight.fill = HIGHLIGHT_COLOR; },
      exit: () => { highlight.fill = null; }
    } );

    this.addInputListener( new FireListener( {

      // Purposefully no nesting here, because we want the firedEmitter at the top level, and we don't instrument the enabledProperty
      tandem: options.tandem,
      fire: event => {
        closeCallback( event );
        callback( event );
      }
    } ) );

    this.separatorBefore = options.separatorBefore;

    // Optionally add a check mark and hook up visibility changes.
    let checkedListener: ( ( isChecked: boolean ) => void ) | null = null;
    if ( options.checkedProperty ) {
      const checkMarkWrapper = new Node( {
        children: [ CHECK_MARK_NODE ],
        right: labelText.left - CHECK_PADDING,
        centerY: labelText.centerY
      } );
      checkedListener = ( isChecked: boolean ) => {
        checkMarkWrapper.visible = isChecked;
      };
      options.checkedProperty.link( checkedListener );
      this.addChild( checkMarkWrapper );
    }

    this.mutate( options );

    this.disposeMenuItem = () => {
      if ( options.checkedProperty && checkedListener && options.checkedProperty.hasListener( checkedListener ) ) {
        options.checkedProperty.unlink( checkedListener );
      }

      if ( labelStringProperty.hasListener( labelStringListener ) ) {
        labelStringProperty.unlink( labelStringListener );
      }

      labelText.dispose();
    };
  }

  public override dispose(): void {
    this.disposeMenuItem();
    super.dispose();
  }
}

sun.register( 'MenuItem', MenuItem );