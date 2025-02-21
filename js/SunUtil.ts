// Copyright 2024-2025, University of Colorado Boulder

/**
 * Utility functions for sun.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type PhetioProperty from '../../axon/js/PhetioProperty.js';
import type IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import type Node from '../../scenery/js/nodes/Node.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

export default class SunUtil {

  /**
   * Assertions to remind devs that there should be a LinkedElement to the associated Property and that the Property itself should be featured.
   */
  public static validateLinkedElementInstrumentation( component: Node, property: PhetioProperty<IntentionalAny> ): void {

    if ( assert && Tandem.VALIDATION && component.isPhetioInstrumented() ) {
      assert && assert( property.isPhetioInstrumented(), 'Property should be instrumented if the controlling component is instrumented' );

      if ( component.phetioFeatured ) {
        assert && assert( property.phetioFeatured, `Property should be featured if the controlling the controlling component is featured: ${property.phetioID}` );
      }
    }
  }
}

sun.register( 'SunUtil', SunUtil );