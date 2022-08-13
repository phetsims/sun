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
import IProperty from '../../../axon/js/IProperty.js';

type SelfOptions = {
  font?: Font;
  textFill?: TPaint;
  maxTextWidth?: number | null;
  textNodeOptions?: TextOptions;
};

export type TextPushButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'content'>;

export default class TextPushButton extends RectangularPushButton {

  private readonly disposeTextPushButton: () => void;

  public constructor( text: string | IProperty<string>, providedOptions?: TextPushButtonOptions ) {

    const initialText = typeof text === 'string' ? text : text.value;

    const options = optionize<TextPushButtonOptions, StrictOmit<SelfOptions, 'textNodeOptions'>, RectangularPushButtonOptions>()( {

      // TextPushButtonOptions
      font: Font.DEFAULT,
      textFill: 'black',
      maxTextWidth: null,

      // RectangularPushButtonOptions
      tandem: Tandem.REQUIRED,
      innerContent: initialText
    }, providedOptions );

    const textNode = new Text( initialText, combineOptions<TextOptions>( {
      font: options.font,
      fill: options.textFill,
      maxWidth: options.maxTextWidth,
      tandem: options.tandem.createTandem( 'textNode' ),
      textProperty: typeof text === 'string' ? undefined : text
    }, options.textNodeOptions ) );

    options.content = textNode;

    super( options );

    if ( typeof text !== 'string' ) {
      text.lazyLink( string => {
        this.innerContent = string;
      } );
    }

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