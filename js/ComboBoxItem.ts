// Copyright 2019-2022, University of Colorado Boulder

/**
 * Data structure for an item in a ComboBox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../phet-core/js/optionize.js';
import ISoundPlayer from '../../tambo/js/ISoundPlayer.js';
import { Node } from '../../scenery/js/imports.js';
import sun from './sun.js';

export type ComboBoxItemOptions = {

  // Sound that will be played when this item is selected.  If set to `null` a default sound will
  // be used that is based on this item's position in the combo box list.  SoundPlayer.NO_SOUND can be used to disable.
  soundPlayer?: ISoundPlayer | null;

  // phet-io - the tandem name for this item's associated Node in the combo box
  tandemName?: string | null;

  // pdom - the label for this item's associated Node in the combo box
  a11yLabel?: string | null;

};

class ComboBoxItem<T> {

  readonly node: Node;
  readonly value: T;
  readonly soundPlayer: ISoundPlayer | null;
  readonly tandemName: string | null;
  readonly a11yLabel: string | null;

  constructor( node: Node, value: T, providedOptions?: ComboBoxItemOptions ) {

    assert && assert( node instanceof Node, `invalid node: ${node}` );
    assert && assert( !node.hasPDOMContent, 'pdomContent is set by ComboBox, use options.a11yLabel' );

    const options = optionize<ComboBoxItemOptions, ComboBoxItemOptions>( {

      // {SoundPlayer|null} - Sound that will be played when this item is selected.  If set to `null` a default sound will
      // be used that is based on this item's position in the combo box list.  SoundPlayer.NO_SOUND can be used to disable.
      soundPlayer: null,

      // phet-io
      tandemName: null, // {string|null} the tandem name for this item's associated Node in the combo box

      // pdom
      a11yLabel: null // {string|null} the label for this item's associated Node in the combo box

    }, providedOptions );

    assert && assert( options.tandemName === null || typeof options.tandemName === 'string',
      `invalid tandemName: ${options.tandemName}` );
    assert && assert( !options.tandemName || options.tandemName.endsWith( 'Item' ),
      `ComboBoxItem tandemName must end with 'Item': ${options.tandemName}` );

    this.node = node;
    this.value = value;
    this.soundPlayer = options.soundPlayer;
    this.tandemName = options.tandemName;
    this.a11yLabel = options.a11yLabel;
  }
}

sun.register( 'ComboBoxItem', ComboBoxItem );
export default ComboBoxItem;