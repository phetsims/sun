// Copyright 2013-2021, University of Colorado Boulder

/**
 * Provides access to Font Awesome glyphs as scenery nodes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Matrix3 from '../../dot/js/Matrix3.js';
import Shape from '../../kite/js/Shape.js';
import merge from '../../phet-core/js/merge.js';
import Path from '../../scenery/js/nodes/Path.js';
import sun from './sun.js';
import ICONS from '../../sherpa/js/fontawesome-4/FontAwesomeIcons4_5.js';

/*
 * The ICONS data structure contains SVG descriptions of Font Awesome icons used in PhET simulations.
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

// constants
const SHAPE_MATRIX = Matrix3.createFromPool( 0.025, 0, 0, 0, -0.025, 0, 0, 0, 1 ); // to create a unity-scale icon

// keys are fontawesome icon names, values are Shape instances.
// Shapes are immutable so that Path doesn't add a listener, which creates a memory leak.
const shapeCache = {};

class FontAwesomeNode extends Path {

  /**
   * @param {string} iconName - the fontawesome icon name
   * @param {Object} [options]
   */
  constructor( iconName, options ) {

    // default values
    options = merge( {
      fill: '#000',

      // Font awesome nodes are expensive to pick (and have a lot of holes in them which you may wish to pick anyways,
      // such as the door of the 'home' icon, so don't pick by default.
      pickable: false,

      // {boolean} use Shape caching for this instance? Note that there is no way to remove an entry from the cache
      // so only cache a shape if it will persist for the lifetime of the simulation.
      enableCache: true
    }, options );

    let shape;
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
    assert && assert( shape, 'expected shape to be defined' );

    super( shape, options );
  }

  /**
   * Creates an immutable Shape for a specified fontawesome icon.
   * @param {string} iconName - the fontawesome icon name
   * @returns {Shape}
   * @public
   */
  static createShape( iconName ) {
    assert && assert( ICONS[ iconName ], `unsupported iconName: ${iconName}` );
    return new Shape( ICONS[ iconName ] ).transformed( SHAPE_MATRIX ).makeImmutable();
  }
}

sun.register( 'FontAwesomeNode', FontAwesomeNode );
export default FontAwesomeNode;