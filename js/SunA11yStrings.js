// Copyright 2018, University of Colorado Boulder

/**
 * Single location of all accessibility strings used in sun.  These
 * strings are not meant to be translatable yet.  Rosetta needs some work to
 * provide translators with context for these strings, and we want to receive
 * some community feedback before these strings are submitted for translation.
 *
 * @author Andrea Lin
 */
define( function( require ) {
  'use strict';

  var sun = require( 'SUN/sun' );

  var SunA11yStrings = {
    accordionBoxCollapse: {
      value: 'Collapse'
    },
    accordionBoxExpand: {
      value: 'Expand'
    },

    // dialogs
    close: {
      value: 'Close'
    }
  };

  if ( phet.chipper.queryParameters.stringTest === 'xss' ) {
    for ( var key in SunA11yStrings ) {
      SunA11yStrings[ key ].value += '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.location.href=atob(\'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==\')" />';
    }
  }

  // verify that object is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( SunA11yStrings ); }

  sun.register( 'SunA11yStrings', SunA11yStrings );

  return SunA11yStrings;
} );