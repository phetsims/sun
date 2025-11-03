// Copyright 2014-2025, University of Colorado Boulder

/**
 * TextPushButton is a convenience class for creating a rectangular push button with a text label.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import AlignGroup from '../../../scenery/js/layout/constraints/AlignGroup.js';
import AlignBox from '../../../scenery/js/layout/nodes/AlignBox.js';
import Text, { type TextOptions } from '../../../scenery/js/nodes/Text.js';
import Font from '../../../scenery/js/util/Font.js';
import type TPaint from '../../../scenery/js/util/TPaint.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularPushButton, { type RectangularPushButtonOptions } from './RectangularPushButton.js';

type SelfOptions = {
  font?: Font;
  textFill?: TPaint;
  maxTextWidth?: number | null;
  textNodeOptions?: TextOptions;
  alignGroup?: AlignGroup | null; // if provided, the Text node will be added to this align group.
};

export type TextPushButtonOptions = SelfOptions & StrictOmit<RectangularPushButtonOptions, 'content'>;

export default class TextPushButton extends RectangularPushButton {

  private readonly disposeTextPushButton: () => void;

  public constructor( string: string | TReadOnlyProperty<string>, providedOptions?: TextPushButtonOptions ) {

    const options = optionize<TextPushButtonOptions, StrictOmit<SelfOptions, 'textNodeOptions'>, RectangularPushButtonOptions>()( {
      alignGroup: null,

      // TextPushButtonOptions
      font: Font.DEFAULT,
      textFill: 'black',
      maxTextWidth: null,

      // RectangularPushButtonOptions
      tandem: Tandem.REQUIRED,
      innerContent: string
    }, providedOptions );
    const text = new Text( string, combineOptions<TextOptions>( {
      font: options.font,
      fill: options.textFill,
      maxWidth: options.maxTextWidth
    }, options.textNodeOptions ) );

    if ( options.alignGroup ) {
      options.content = options.alignGroup.createBox( text );
    }
    else {
      options.content = text;
    }

    super( options );

    this.disposeTextPushButton = () => {
      options.alignGroup && options.alignGroup.removeAlignBox( options.content as AlignBox );
      text.dispose();
    };
  }

  public override dispose(): void {
    this.disposeTextPushButton();
    super.dispose();
  }
}

sun.register( 'TextPushButton', TextPushButton );