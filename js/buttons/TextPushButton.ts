// Copyright 2014-2022, University of Colorado Boulder

/**
 * TextPushButton is a convenience class for creating a rectangular push button with a text label.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { Font, Text, TextOptions, TPaint } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularPushButton, { RectangularPushButtonOptions } from './RectangularPushButton.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';

type SelfOptions = {
  font?: Font;
  textFill?: TPaint;
  maxTextWidth?: number | null;
  textNodeOptions?: TextOptions;
};

export type TextPushButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'content'>;

export default class TextPushButton extends RectangularPushButton {

  private readonly disposeTextPushButton: () => void;

  public constructor( text: string | TReadOnlyProperty<string>, providedOptions?: TextPushButtonOptions ) {

    const options = optionize<TextPushButtonOptions, StrictOmit<SelfOptions, 'textNodeOptions'>, RectangularPushButtonOptions>()( {

      // TextPushButtonOptions
      font: Font.DEFAULT,
      textFill: 'black',
      maxTextWidth: null,

      // RectangularPushButtonOptions
      tandem: Tandem.REQUIRED,
      innerContent: typeof text === 'string' ? text : text.value
    }, providedOptions );

    const textNode = new Text( text, combineOptions<TextOptions>( {
      font: options.font,
      fill: options.textFill,
      maxWidth: options.maxTextWidth,
      tandem: options.tandem.createTandem( 'textNode' )
    }, options.textNodeOptions ) );

    options.content = textNode;

    super( options );

    let textListener: ( str: string ) => void;

    if ( typeof text !== 'string' ) {
      textListener = ( string => {
        this.innerContent = string;
      } );
      text.lazyLink( textListener );
    }

    this.disposeTextPushButton = () => {
      textNode.dispose();
      if ( typeof text !== 'string' && textListener ) {
        text.unlink( textListener );
      }
    };
  }

  public override dispose(): void {
    this.disposeTextPushButton();
    super.dispose();
  }
}

sun.register( 'TextPushButton', TextPushButton );