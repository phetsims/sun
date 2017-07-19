// Copyright 2013-2017, University of Colorado Boulder

/**
 * Provides access to Font Awesome glyphs as scenery nodes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );

  /*
   * This data structure contains SVG descriptions of Font Awesome icons used in PhET simulations.
   * This entire data structure is included in sims that use FontAwesomeNode, so only icons that are
   * actually used should be included.
   *
   * Keys are based on Font Awesome icon names, values are {string} SVG data.
   *
   * To add a new icon:
   * (1) Find the icon at http://fontawesome.io/icons/
   * (2) Note the icon's name and Unicode value.
   *     E.g. http://fontawesome.io/icon/level-down/ is 'fa-level-down' and 'f149'
   * (3) Navigate to sherpa/lib/font-awesome-*\/fonts/fontawesome-webfont.svg
   * (4) Locate the Unicode value in fontawesome-webfont.svg.
   *     If it's not there, you'll likely need to download a more recent version of fontawesome-webfont.svg.
   * (5) Locate the SVG data from the corresponding d="..." field.
   * (6) Create a new field name in the ICONS hash below. The field name should be based on the icon's name.
   *     Remove the 'fa-' prefix and replace '-' with '_'.
   *     E.g. 'fa-level-down' -> level_down.
   * (7) Copy the SVG data to the new field in ICONS.
   */
  var ICONS = {
    camera: 'M960 864q119 0 203.5 -84.5t84.5 -203.5t-84.5 -203.5t-203.5 -84.5t-203.5 84.5t-84.5 203.5t84.5 203.5t203.5 84.5zM1664 1280q106 0 181 -75t75 -181v-896q0 -106 -75 -181t-181 -75h-1408q-106 0 -181 75t-75 181v896q0 106 75 181t181 75h224l51 136 q19 49 69.5 84.5t103.5 35.5h512q53 0 103.5 -35.5t69.5 -84.5l51 -136h224zM960 128q185 0 316.5 131.5t131.5 316.5t-131.5 316.5t-316.5 131.5t-316.5 -131.5t-131.5 -316.5t131.5 -316.5t316.5 -131.5z',
    check: 'M1671 970q0 -40 -28 -68l-724 -724l-136 -136q-28 -28 -68 -28t-68 28l-136 136l-362 362q-28 28 -28 68t28 68l136 136q28 28 68 28t68 -28l294 -295l656 657q28 28 68 28t68 -28l136 -136q28 -28 28 -68z',
    check_empty: 'M1120 1280h-832q-66 0 -113 -47t-47 -113v-832q0 -66 47 -113t113 -47h832q66 0 113 47t47 113v832q0 66 -47 113t-113 47zM1408 1120v-832q0 -119 -84.5 -203.5t-203.5 -84.5h-832q-119 0 -203.5 84.5t-84.5 203.5v832q0 119 84.5 203.5t203.5 84.5h832 q119 0 203.5 -84.5t84.5 -203.5z',
    check_square_o: 'M1408 606v-318q0 -119 -84.5 -203.5t-203.5 -84.5h-832q-119 0 -203.5 84.5t-84.5 203.5v832q0 119 84.5 203.5t203.5 84.5h832q63 0 117 -25q15 -7 18 -23q3 -17 -9 -29l-49 -49q-10 -10 -23 -10q-3 0 -9 2q-23 6 -45 6h-832q-66 0 -113 -47t-47 -113v-832 q0 -66 47 -113t113 -47h832q66 0 113 47t47 113v254q0 13 9 22l64 64q10 10 23 10q6 0 12 -3q20 -8 20 -29zM1639 1095l-814 -814q-24 -24 -57 -24t-57 24l-430 430q-24 24 -24 57t24 57l110 110q24 24 57 24t57 -24l263 -263l647 647q24 24 57 24t57 -24l110 -110 q24 -24 24 -57t-24 -57z',
    cut: 'M960 640q26 0 45 -19t19 -45t-19 -45t-45 -19t-45 19t-19 45t19 45t45 19zM1260 576l507 -398q28 -20 25 -56q-5 -35 -35 -51l-128 -64q-13 -7 -29 -7q-17 0 -31 8l-690 387l-110 -66q-8 -4 -12 -5q14 -49 10 -97q-7 -77 -56 -147.5t-132 -123.5q-132 -84 -277 -84 q-136 0 -222 78q-90 84 -79 207q7 76 56 147t131 124q132 84 278 84q83 0 151 -31q9 13 22 22l122 73l-122 73q-13 9 -22 22q-68 -31 -151 -31q-146 0 -278 84q-82 53 -131 124t-56 147q-5 59 15.5 113t63.5 93q85 79 222 79q145 0 277 -84q83 -52 132 -123t56 -148 q4 -48 -10 -97q4 -1 12 -5l110 -66l690 387q14 8 31 8q16 0 29 -7l128 -64q30 -16 35 -51q3 -36 -25 -56zM579 836q46 42 21 108t-106 117q-92 59 -192 59q-74 0 -113 -36q-46 -42 -21 -108t106 -117q92 -59 192 -59q74 0 113 36zM494 91q81 51 106 117t-21 108 q-39 36 -113 36q-100 0 -192 -59q-81 -51 -106 -117t21 -108q39 -36 113 -36q100 0 192 59zM672 704l96 -58v11q0 36 33 56l14 8l-79 47l-26 -26q-3 -3 -10 -11t-12 -12q-2 -2 -4 -3.5t-3 -2.5zM896 480l96 -32l736 576l-128 64l-768 -431v-113l-160 -96l9 -8q2 -2 7 -6 q4 -4 11 -12t11 -12l26 -26zM1600 64l128 64l-520 408l-177 -138q-2 -3 -13 -7z',
    eye_close: 'M555 201l78 141q-87 63 -136 159t-49 203q0 121 61 225q-229 -117 -381 -353q167 -258 427 -375zM944 960q0 20 -14 34t-34 14q-125 0 -214.5 -89.5t-89.5 -214.5q0 -20 14 -34t34 -14t34 14t14 34q0 86 61 147t147 61q20 0 34 14t14 34zM1307 1151q0 -7 -1 -9 q-105 -188 -315 -566t-316 -567l-49 -89q-10 -16 -28 -16q-12 0 -134 70q-16 10 -16 28q0 12 44 87q-143 65 -263.5 173t-208.5 245q-20 31 -20 69t20 69q153 235 380 371t496 136q89 0 180 -17l54 97q10 16 28 16q5 0 18 -6t31 -15.5t33 -18.5t31.5 -18.5t19.5 -11.5 q16 -10 16 -27zM1344 704q0 -139 -79 -253.5t-209 -164.5l280 502q8 -45 8 -84zM1792 576q0 -35 -20 -69q-39 -64 -109 -145q-150 -172 -347.5 -267t-419.5 -95l74 132q212 18 392.5 137t301.5 307q-115 179 -282 294l63 112q95 -64 182.5 -153t144.5 -184q20 -34 20 -69z',
    eye_open: 'M1664 576q-152 236 -381 353q61 -104 61 -225q0 -185 -131.5 -316.5t-316.5 -131.5t-316.5 131.5t-131.5 316.5q0 121 61 225q-229 -117 -381 -353q133 -205 333.5 -326.5t434.5 -121.5t434.5 121.5t333.5 326.5zM944 960q0 20 -14 34t-34 14q-125 0 -214.5 -89.5 t-89.5 -214.5q0 -20 14 -34t34 -14t34 14t14 34q0 86 61 147t147 61q20 0 34 14t14 34zM1792 576q0 -34 -20 -69q-140 -230 -376.5 -368.5t-499.5 -138.5t-499.5 139t-376.5 368q-20 35 -20 69t20 69q140 229 376.5 368t499.5 139t499.5 -139t376.5 -368q20 -35 20 -69z',
    exchange: 'M1792 352v-192q0 -13 -9.5 -22.5t-22.5 -9.5h-1376v-192q0 -13 -9.5 -22.5t-22.5 -9.5q-12 0 -24 10l-319 320q-9 9 -9 22q0 14 9 23l320 320q9 9 23 9q13 0 22.5 -9.5t9.5 -22.5v-192h1376q13 0 22.5 -9.5t9.5 -22.5zM1792 896q0 -14 -9 -23l-320 -320q-9 -9 -23 -9 q-13 0 -22.5 9.5t-9.5 22.5v192h-1376q-13 0 -22.5 9.5t-9.5 22.5v192q0 13 9.5 22.5t22.5 9.5h1376v192q0 14 9 23t23 9q12 0 24 -10l319 -319q9 -9 9 -23z',
    home: 'M1408 544v-480q0 -26 -19 -45t-45 -19h-384v384h-256v-384h-384q-26 0 -45 19t-19 45v480q0 1 0.5 3t0.5 3l575 474l575 -474q1 -2 1 -6zM1631 613l-62 -74q-8 -9 -21 -11h-3q-13 0 -21 7l-692 577l-692 -577q-12 -8 -24 -7q-13 2 -21 11l-62 74q-8 10 -7 23.5t11 21.5 l719 599q32 26 76 26t76 -26l244 -204v195q0 14 9 23t23 9h192q14 0 23 -9t9 -23v-408l219 -182q10 -8 11 -21.5t-7 -23.5z',
    info_circle: 'M1024 160v160q0 14 -9 23t-23 9h-96v512q0 14 -9 23t-23 9h-320q-14 0 -23 -9t-9 -23v-160q0 -14 9 -23t23 -9h96v-320h-96q-14 0 -23 -9t-9 -23v-160q0 -14 9 -23t23 -9h448q14 0 23 9t9 23zM896 1056v160q0 14 -9 23t-23 9h-192q-14 0 -23 -9t-9 -23v-160q0 -14 9 -23 t23 -9h192q14 0 23 9t9 23zM1536 640q0 -209 -103 -385.5t-279.5 -279.5t-385.5 -103t-385.5 103t-279.5 279.5t-103 385.5t103 385.5t279.5 279.5t385.5 103t385.5 -103t279.5 -279.5t103 -385.5z',
    level_down: 'M32 1280h704q13 0 22.5 -9.5t9.5 -23.5v-863h192q40 0 58 -37t-9 -69l-320 -384q-18 -22 -49 -22t-49 22l-320 384q-26 31 -9 69q18 37 58 37h192v640h-320q-14 0 -25 11l-160 192q-13 14 -4 34q9 19 29 19z',
    pencil_square_o: 'M888 352l116 116l-152 152l-116 -116v-56h96v-96h56zM1328 1072q-16 16 -33 -1l-350 -350q-17 -17 -1 -33t33 1l350 350q17 17 1 33zM1408 478v-190q0 -119 -84.5 -203.5t-203.5 -84.5h-832q-119 0 -203.5 84.5t-84.5 203.5v832q0 119 84.5 203.5t203.5 84.5h832 q63 0 117 -25q15 -7 18 -23q3 -17 -9 -29l-49 -49q-14 -14 -32 -8q-23 6 -45 6h-832q-66 0 -113 -47t-47 -113v-832q0 -66 47 -113t113 -47h832q66 0 113 47t47 113v126q0 13 9 22l64 64q15 15 35 7t20 -29zM1312 1216l288 -288l-672 -672h-288v288zM1756 1084l-92 -92 l-288 288l92 92q28 28 68 28t68 -28l152 -152q28 -28 28 -68t-28 -68z',
    refresh: 'M1511 480q0 -5 -1 -7q-64 -268 -268 -434.5t-478 -166.5q-146 0 -282.5 55t-243.5 157l-129 -129q-19 -19 -45 -19t-45 19t-19 45v448q0 26 19 45t45 19h448q26 0 45 -19t19 -45t-19 -45l-137 -137q71 -66 161 -102t187 -36q134 0 250 65t186 179q11 17 53 117 q8 23 30 23h192q13 0 22.5 -9.5t9.5 -22.5zM1536 1280v-448q0 -26 -19 -45t-45 -19h-448q-26 0 -45 19t-19 45t19 45l138 138q-148 137 -349 137q-134 0 -250 -65t-186 -179q-11 -17 -53 -117q-8 -23 -30 -23h-199q-13 0 -22.5 9.5t-9.5 22.5v7q65 268 270 434.5t480 166.5 q146 0 284 -55.5t245 -156.5l130 129q19 19 45 19t45 -19t19 -45z',
    reply: 'M1792 416q0 -166 -127 -451q-3 -7 -10.5 -24t-13.5 -30t-13 -22q-12 -17 -28 -17q-15 0 -23.5 10t-8.5 25q0 9 2.5 26.5t2.5 23.5q5 68 5 123q0 101 -17.5 181t-48.5 138.5t-80 101t-105.5 69.5t-133 42.5t-154 21.5t-175.5 6h-224v-256q0 -26 -19 -45t-45 -19t-45 19 l-512 512q-19 19 -19 45t19 45l512 512q19 19 45 19t45 -19t19 -45v-256h224q713 0 875 -403q53 -134 53 -333z',
    times: 'M1298 214q0 -40 -28 -68l-136 -136q-28 -28 -68 -28t-68 28l-294 294l-294 -294q-28 -28 -68 -28t-68 28l-136 136q-28 28 -28 68t28 68l294 294l-294 294q-28 28 -28 68t28 68l136 136q28 28 68 28t68 -28l294 -294l294 294q28 28 68 28t68 -28l136 -136q28 -28 28 -68 t-28 -68l-294 -294l294 -294q28 -28 28 -68z',
    times_circle: 'M1149 414q0 26 -19 45l-181 181l181 181q19 19 19 45q0 27 -19 46l-90 90q-19 19 -46 19q-26 0 -45 -19l-181 -181l-181 181q-19 19 -45 19q-27 0 -46 -19l-90 -90q-19 -19 -19 -46q0 -26 19 -45l181 -181l-181 -181q-19 -19 -19 -45q0 -27 19 -46l90 -90q19 -19 46 -19 q26 0 45 19l181 181l181 -181q19 -19 45 -19q27 0 46 19l90 90q19 19 19 46zM1536 640q0 -209 -103 -385.5t-279.5 -279.5t-385.5 -103t-385.5 103t-279.5 279.5t-103 385.5t103 385.5t279.5 279.5t385.5 103t385.5 -103t279.5 -279.5t103 -385.5z',
    trash: 'M512 800v-576q0 -14 -9 -23t-23 -9h-64q-14 0 -23 9t-9 23v576q0 14 9 23t23 9h64q14 0 23 -9t9 -23zM768 800v-576q0 -14 -9 -23t-23 -9h-64q-14 0 -23 9t-9 23v576q0 14 9 23t23 9h64q14 0 23 -9t9 -23zM1024 800v-576q0 -14 -9 -23t-23 -9h-64q-14 0 -23 9t-9 23v576 q0 14 9 23t23 9h64q14 0 23 -9t9 -23zM1152 76v948h-896v-948q0 -22 7 -40.5t14.5 -27t10.5 -8.5h832q3 0 10.5 8.5t14.5 27t7 40.5zM480 1152h448l-48 117q-7 9 -17 11h-317q-10 -2 -17 -11zM1408 1120v-64q0 -14 -9 -23t-23 -9h-96v-948q0 -83 -47 -143.5t-113 -60.5h-832 q-66 0 -113 58.5t-47 141.5v952h-96q-14 0 -23 9t-9 23v64q0 14 9 23t23 9h309l70 167q15 37 54 63t79 26h320q40 0 79 -26t54 -63l70 -167h309q14 0 23 -9t9 -23z',
    undo: 'M1536 640q0 -156 -61 -298t-164 -245t-245 -164t-298 -61q-179 0 -336.5 76t-266 213t-147.5 312q-3 14 7 27q9 12 25 12h199q23 0 30 -23q50 -162 185 -261.5t304 -99.5q104 0 198.5 40.5t163.5 109.5t109.5 163.5t40.5 198.5t-40.5 198.5t-109.5 163.5t-163.5 109.5 t-198.5 40.5q-98 0 -188 -35.5t-160 -101.5l137 -138q31 -30 14 -69q-17 -40 -59 -40h-448q-26 0 -45 19t-19 45v448q0 42 40 59q39 17 69 -14l130 -129q107 101 244.5 156.5t284.5 55.5q156 0 298 -61t245 -164t164 -245t61 -298z',
    volume_off: 'M768 1184v-1088q0 -26 -19 -45t-45 -19t-45 19l-333 333h-262q-26 0 -45 19t-19 45v384q0 26 19 45t45 19h262l333 333q19 19 45 19t45 -19t19 -45z',
    volume_up: 'M768 1184v-1088q0 -26 -19 -45t-45 -19t-45 19l-333 333h-262q-26 0 -45 19t-19 45v384q0 26 19 45t45 19h262l333 333q19 19 45 19t45 -19t19 -45zM1152 640q0 -76 -42.5 -141.5t-112.5 -93.5q-10 -5 -25 -5q-26 0 -45 18.5t-19 45.5q0 21 12 35.5t29 25t34 23t29 35.5 t12 57t-12 57t-29 35.5t-34 23t-29 25t-12 35.5q0 27 19 45.5t45 18.5q15 0 25 -5q70 -27 112.5 -93t42.5 -142zM1408 640q0 -153 -85 -282.5t-225 -188.5q-13 -5 -25 -5q-27 0 -46 19t-19 45q0 39 39 59q56 29 76 44q74 54 115.5 135.5t41.5 173.5t-41.5 173.5 t-115.5 135.5q-20 15 -76 44q-39 20 -39 59q0 26 19 45t45 19q13 0 26 -5q140 -59 225 -188.5t85 -282.5zM1664 640q0 -230 -127 -422.5t-338 -283.5q-13 -5 -26 -5q-26 0 -45 19t-19 45q0 36 39 59q7 4 22.5 10.5t22.5 10.5q46 25 82 51q123 91 192 227t69 289t-69 289 t-192 227q-36 26 -82 51q-7 4 -22.5 10.5t-22.5 10.5q-39 23 -39 59q0 26 19 45t45 19q13 0 26 -5q211 -91 338 -283.5t127 -422.5z',
    warning_sign: 'M1024 161v190q0 14 -9.5 23.5t-22.5 9.5h-192q-13 0 -22.5 -9.5t-9.5 -23.5v-190q0 -14 9.5 -23.5t22.5 -9.5h192q13 0 22.5 9.5t9.5 23.5zM1022 535l18 459q0 12 -10 19q-13 11 -24 11h-220q-11 0 -24 -11q-10 -7 -10 -21l17 -457q0 -10 10 -16.5t24 -6.5h185 q14 0 23.5 6.5t10.5 16.5zM1008 1469l768 -1408q35 -63 -2 -126q-17 -29 -46.5 -46t-63.5 -17h-1536q-34 0 -63.5 17t-46.5 46q-37 63 -2 126l768 1408q17 31 47 49t65 18t65 -18t47 -49z'
  };

  // constants
  var SHAPE_MATRIX = Matrix3.createFromPool( 0.025, 0, 0, 0, -0.025, 0, 0, 0, 1 ); // to create a unity-scale icon

  // keys are fontawesome icon names, values are Shape instances.
  // Shapes are immutable so that Path doesn't add a listener, which creates a memory leak.
  var shapeCache = {};

  /**
   * @param {string} iconName - the fontawesome icon name
   * @param {Object} [options]
   * @constructor
   */
  function FontAwesomeNode( iconName, options ) {

    // default values
    options = _.extend( {
      fill: '#000',

      // Font awesome nodes are expensive to pick (and have a lot of holes in them which you may wish to pick anyways,
      // such as the door of the 'home' icon, so don't pick by default.
      pickable: false,

      // {boolean} use Shape caching for this instance? Note that there is no way to remove an entry from the cache
      // so only cache a shape if it will persist for the lifetime of the simulation.
      enableCache: true
    }, options );

    var shape;
    if ( options.enableCache ) {

      // cache the shape
      if ( !shapeCache[ iconName ] ) {
        shapeCache[ iconName ] = FontAwesomeNode.createShape( iconName );
      }

      // get the shape from the cache
      shape = shapeCache[ iconName ];
    }
    else {

      // don't use the cache
      shape = FontAwesomeNode.createShape( iconName );
    }

    Path.call( this, shape, options );
  }

  sun.register( 'FontAwesomeNode', FontAwesomeNode );

  return inherit( Path, FontAwesomeNode, {}, {

    /**
     * Creates an immutable Shape for a specified fontawesome icon.
     *
     * @param {string} iconName - the fontawesome icon name
     * @returns {Shape}
     */
    createShape: function( iconName ) {
      assert && assert( ICONS[ iconName ], 'unsupported iconName: ' + iconName );
      return new Shape( ICONS[ iconName ] ).transformed( SHAPE_MATRIX ).makeImmutable();
    }
  } );
} );