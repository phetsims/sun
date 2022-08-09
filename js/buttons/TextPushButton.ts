// Copyright 2014-2022, University of Colorado Boulder

/**
 * TextPushButton is a convenience class for creating a rectangular push button with a text label.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { Font, TPaint, Text, TextOptions } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularPushButton, { RectangularPushButtonOptions } from './RectangularPushButton.js';

type SelfOptions = {
  font?: Font;
  textFill?: TPaint;
  maxTextWidth?: number | null;
  textNodeOptions?: TextOptions;
};

export type TextPushButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'content'>;

export default class TextPushButton extends RectangularPushButton {

  private readonly disposeTextPushButton: () => void;

  public constructor( text: string, providedOptions?: TextPushButtonOptions ) {

    const options = optionize<TextPushButtonOptions, StrictOmit<SelfOptions, 'textNodeOptions'>, RectangularPushButtonOptions>()( {

      // TextPushButtonOptions
      font: Font.DEFAULT,
      textFill: 'black',
      maxTextWidth: null,

      // RectangularPushButtonOptions
      tandem: Tandem.REQUIRED,
      innerContent: text
    }, providedOptions );

    const textNode = new Text( text, combineOptions<TextOptions>( {
      font: options.font,
      fill: options.textFill,
      maxWidth: options.maxTextWidth,
      tandem: options.tandem.createTandem( 'textNode' )
    }, options.textNodeOptions ) );

    options.content = textNode;

    super( options );

    this.disposeTextPushButton = () => {
      textNode.dispose();
    };
  }

  public override dispose(): void {
    this.disposeTextPushButton();
    super.dispose();
  }
}

sun.register( 'TextPushButton', TextPushButton );