// Copyright 2002-2014, University of Colorado Boulder

/**
 * A rectangular push button.  This is the file in which the appearance and
 * behavior are brought together.
 *
 * This class inherits from RectangularButtonView, which contains all of the
 * code that defines the button's appearance, and adds the button's behavior
 * by hooking up a button model.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/experimental/buttons/RectangularButtonView' );
  var PushButtonModel = require( 'SUN/experimental/buttons/PushButtonModel' );

  /**
   * @param {Node} content - Node to put on surface of button, could be text,
   * icon, or whatever
   * @param {Object} options - All of the general Scenery node options can be
   * used, see Node.js or the Scenery documentation. In addition, the
   * following options are available. Note that there is no automated process
   * to keep these up to date, so keep that in mind when using these (and
   * please fix any errors you notice!).
   *
   * All of these values have defaults, so only specify them when needed.
   *
   *    baseColor:              The color for the main portion of the button, other colors for highlights and shadows will be based off of this
   *    content:                The node to display on the button, can be null for a blank button
   *    cornerRounding:         Just like the usual option for a rectangular shape
   *    disabledBaseColor:      The color for the main portion of the button when disabled, other colors for highlights and shadows will be based of of this
   *    fireOnDown:             Boolean that controls whether the listener function(s) are fired when the button is pressed down instead of when released
   *    listener:               Function that is called when this button is fired
   *    minHeight:              Minimum height for the button, not needed unless a fixed height beyond that of the content is desired
   *    minWidth:               Minimum width for the button, not needed unless a fixed width beyond that of the content is desired
   *    setContentEnabledLook:  Function that controls how the content appearance changes when the button is disabled
   *    xMargin:                Margin between the content and the edge in the x (i.e. horizontal) direction
   *    yMargin:                Margin between the content and the edge in the y (i.e. vertical) direction
   *    xTouchExpansion:        Amount of space beyond the left and right edges where the button will sense touch events
   *    yTouchExpansion:        Amount of space beyond the top and bottom edges where the button will sense touch events
   *
   * @constructor
   */
  function RectangularPushButton( options ) {

    options = _.extend( options );

    // Safe to pass through options to the pushButtonModel like "fireOnDown".  Other scenery options will be safely ignored.
    RectangularButtonView.call( this, new PushButtonModel( options ), options );
  }

  return inherit( RectangularButtonView, RectangularPushButton );
} );