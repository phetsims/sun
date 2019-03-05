// Copyright 2019, University of Colorado Boulder

/**
 * Constants used in sun, scenery-phet, and potentially in other PhET UI components.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const sun = require( 'SUN/sun' );

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
    DISABLED_OPACITY: 0.3
  };

  return sun.register( 'SunConstants', SunConstants );
} );