// Copyright 2002-2014, University of Colorado Boulder

// RequireJS configuration file for Sun (UI component lib) demo.
require.config( {
  deps: [ 'sun-main' ],

  paths: {

    // third party libs
    text: '../../sherpa/lib/text-2.0.12',

    // plugins
    image: '../../chipper/js/requirejs-plugins/image',
    mipmap: '../../chipper/js/requirejs-plugins/mipmap',
    string: '../../chipper/js/requirejs-plugins/string',

    // PhET libs, uppercase names to identify them in require.js imports
    AXON: '../../axon/js',
    BRAND: '../../brand/' + phet.chipper.getBrandName() + '/js',
    DOT: '../../dot/js',
    JOIST: '../../joist/js',
    KITE: '../../kite/js',
    PHETCOMMON: '../../phetcommon/js',
    REPOSITORY: '..',
    PHET_CORE: '../../phet-core/js',
    SCENERY: '../../scenery/js',
    SCENERY_PHET: '../../scenery-phet/js',
    SHERPA: '../../sherpa',
    SUN: '../../sun/js'
  },

  // optional cache buster to make browser refresh load all included scripts, can be disabled with ?cacheBuster=false
  urlArgs: phet.chipper.getCacheBusterArgs()
} );
