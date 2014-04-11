// Copyright 2002-2013, University of Colorado Boulder

/*
 * RequireJS configuration file for Sun button test app. Paths are relative to
 * the location of this file.
 *
 * @author John Blanco
 */

require.config( {

  deps: ['button-test-1-main'],

  paths: {

    // PhET libs, uppercase names to identify them in require.js imports
    ASSERT: '../../assert/js',
    AXON: '../../axon/js',
    BRAND: '../../brand/js',
    DOT: '../../dot/js',
    KITE: '../../kite/js',
    PHET_CORE: '../../phet-core/js',
    PHETCOMMON: '../../phetcommon/js',
    SCENERY: '../../scenery/js',
    SCENERY_PHET: '../../scenery-phet/js',
    SUN: '../../sun/js',

    // this app
    BUTTON_TEST: "."
  },

  urlArgs: new Date().getTime()  // cache buster to make browser refresh load all included scripts
} );
