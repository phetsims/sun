// Copyright 2002-2014, University of Colorado Boulder

/**
 * Basic model for a push button, intended to be added as an input listener to
 * any Scenery node in order to allow it to behave as a button.
 *
 * IMPORTANT USAGE NOTES:
 * - The node to which this is added should not be made non-pickable when
 *   the disabled state is entered, or subsequent states may not be correct.
 * - Generally speaking, only one of these should be added to a given node.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @param {Object} options
   * @constructor
   */
  function ToggleButtonModel3( options ) {
    options = _.extend(
      {
        toggleOnDown: false
      }, options );

    PropertySet.call( this, {
      overPointer: null,
      downPointer: null,
      up: true,
      enabled: true
    } );

    //Example of how to map to the ButtonModelStates
    this.addDerivedProperty( 'interactionState', ['overPointer', 'downPointer', 'up', 'enabled'], function( overPointer, downPointer, up, enabled ) {
      if ( !enabled ) {
        return 'disabled';
      }
      else {
        if ( !overPointer && !downPointer ) {
          return 'idle';
        }
        else if ( overPointer && downPointer && overPointer === downPointer ) {
          return 'down';
        }

        //... etc.
      }
    } );

    //But what about just using these boolean states directly for rendering:  enabled, up, over
  }

  return inherit( PropertySet, ToggleButtonModel3, {
  } );
} );