// Copyright 2024-2026, University of Colorado Boulder

/**
 * The default sound used for Slider if options.soundGenerator is not set.
 *
 * Separated out to avoid circular dependencies between Slider and DefaultSliderTrack/SliderTrack.
 * See https://github.com/phetsims/chipper/issues/1550#issuecomment-2550362697
 *
 * NOTE: If Slider/DefaultSliderTrack/SliderTrack are ever put in the same file, then this file can cease to exist.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Range from '../../dot/js/Range.js';
import ValueChangeSoundPlayer from '../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';

const SliderDefaultSoundGenerator = new ValueChangeSoundPlayer( new Range( 0, 1 ) );

export default SliderDefaultSoundGenerator;