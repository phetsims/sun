// Copyright 2019-2020, University of Colorado Boulder

/**
 * Constants used in sun, scenery-phet, and potentially in other PhET UI components.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import sun from './sun.js';

const SunConstants = {

  /**
   * Named placeholder in string patterns where a value will be substituted.
   * Typically appears in translated strings (e.g. "{{value}} nm") and used with StringUtils.fillIn.
   */
  VALUE_NAMED_PLACEHOLDER: '{{value}}',

  /**
   * Numbered placeholder in string patterns where a value will be substituted.
   * Typically appears in translated strings (e.g. "{0} nm") and used with StringUtils.format.
   * @deprecated - Named placeholders are the new standard, and numbered placeholders should not be used in new code.
   */
  VALUE_NUMBERED_PLACEHOLDER: '{0}',

  // Opacity that is typically applied to a UI component in its disabled state, to make it look grayed out.
  DISABLED_OPACITY: .45,

  /**
   * The basic PhET enabled/disabled look and feel for interactive components.
   * @public
   * @param {Node} node
   * @param {Object} [options]
   * @returns {function(boolean):void}
   */
  getComponentEnabledListener( node, options ) {
    options = merge( {
      disabledOpacity: SunConstants.DISABLED_OPACITY
    }, options );

    return enabled => {
      !enabled && node.interruptSubtreeInput();
      node.pickable = enabled;
      node.opacity = enabled ? 1.0 : options.disabledOpacity;
    };
  }
};

sun.register( 'SunConstants', SunConstants );
export default SunConstants;