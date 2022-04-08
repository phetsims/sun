// Copyright 2014-2022, University of Colorado Boulder

/**
 * TextPushButton is a convenience class for creating a rectangular push button with a text label.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Font, IPaint, Text, TextOptions } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularPushButton, { RectangularPushButtonOptions } from './RectangularPushButton.js';

type SelfOptions = {
  font?: Font;
  textFill?: IPaint;
  maxTextWidth?: number | null;
  textNodeOptions?: TextOptions;
};

export type TextPushButtonOptions = SelfOptions & Omit<RectangularPushButtonOptions, 'content'>;

export default class TextPushButton extends RectangularPushButton {

  private readonly disposeTextPushButton: () => void;

  constructor( text: string, providedOptions?: TextPushButtonOptions ) {

    const options = optionize<TextPushButtonOptions, SelfOptions, RectangularPushButtonOptions, 'tandem'>( {

      // TextPushButtonOptions
      font: Font.DEFAULT,
      textFill: 'black',
      maxTextWidth: null,
      textNodeOptions: {},

      // RectangularPushButtonOptions
      tandem: Tandem.REQUIRED,
      innerContent: text
    }, providedOptions );

    const textNode = new Text( text, merge( {
      font: options.font,
      fill: options.textFill,
      maxWidth: options.maxTextWidth,
      tandem: options.tandem.createTandem( 'textNode' )
    }, options.textNodeOptions ) );

    assert && assert( !options.content, 'TextPushButton sets content' );
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