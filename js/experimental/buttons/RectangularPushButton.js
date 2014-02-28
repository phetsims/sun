// Copyright 2002-2013, University of Colorado Boulder

/**
 * Push Button - prototype of a version that draws gradients and such in order
 * to try to get a somewhat 2D effect.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Includes
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var ButtonModel = require( 'SUN/experimental/buttons/ButtonModel' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.

  /**
   * @param {function} callback
   * @param {Node} content - Node to put on surface of button, could be text, icon, or whatever
   * @param {Object} options
   * @constructor
   */
  function RectangularPushButton( callback, content, options ) {

    var thisButton = this;
    Node.call( thisButton );

    options = _.extend( {
      // Default values.
      cursor: 'pointer',
      cornerRounding: 4,
      baseColor: new Color( 153, 206, 255 ),
      disabledBaseColor: new Color( 220, 220, 220 ),
      xPadding: 5,
      yPadding: 5,
      touchAreaExpansionFactor: 1.3
    }, options );

    thisButton.buttonWidth = content.width + options.xPadding * 2;
    thisButton.buttonHeight = content.height + options.yPadding * 2;
    thisButton._state = 'up';
    thisButton._enabled = new Property( options.enabled );
    thisButton._listeners = [];
    if ( options.listener ) { thisButton._listeners.push( options.listener ); }
    thisButton.baseColor = options.baseColor;
    thisButton.disabledBaseColor = options.disabledBaseColor;
    thisButton.label = content;
    thisButton.upCenter = new Vector2( thisButton.buttonWidth / 2, thisButton.buttonHeight / 2 );
    thisButton.downCenter = thisButton.upCenter;

    var verticalHighlightStop = HIGHLIGHT_GRADIENT_LENGTH / thisButton.buttonHeight;
    var verticalShadowStop = 1 - SHADE_GRADIENT_LENGTH / thisButton.buttonHeight;
    var horizontalHighlightStop = HIGHLIGHT_GRADIENT_LENGTH / thisButton.buttonWidth;
    var horizontalShadowStop = 1 - SHADE_GRADIENT_LENGTH / thisButton.buttonWidth;

    // Gradient fills used for various button states
    thisButton.upFillVertical = new LinearGradient( 0, 0, 0, thisButton.buttonHeight )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, thisButton.baseColor )
      .addColorStop( verticalShadowStop, thisButton.baseColor )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.5 ) );

    var transparentBaseColor = new Color( thisButton.baseColor.getRed(), thisButton.baseColor.getGreen(), thisButton.baseColor.getBlue(), 0 );
    thisButton.upFillHorizontal = new LinearGradient( 0, 0, thisButton.buttonWidth, 0 )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( horizontalHighlightStop, transparentBaseColor )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.5 ) );

    thisButton.overFillVertical = new LinearGradient( 0, 0, 0, thisButton.buttonHeight )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, thisButton.baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalShadowStop, thisButton.baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.5 ) );

    thisButton.overFillHorizontal = new LinearGradient( 0, 0, thisButton.buttonWidth, 0 )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( horizontalHighlightStop, transparentBaseColor )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.5 ) );

    thisButton.downFill = new LinearGradient( 0, 0, 0, thisButton.buttonHeight )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop * 0.67, thisButton.baseColor.colorUtilsDarker( 0.3 ) )
      .addColorStop( verticalShadowStop, thisButton.baseColor.colorUtilsBrighter( 0.2 ) )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.5 ) );

    thisButton.background = new Rectangle( 0, 0, thisButton.buttonWidth, thisButton.buttonHeight, options.cornerRounding, options.cornerRounding,
      {
        fill: options.baseColor,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );
    this.addChild( thisButton.background );

    thisButton.overlayForHorizGradient = new Rectangle( 0, 0, thisButton.buttonWidth, thisButton.buttonHeight, options.cornerRounding, options.cornerRounding,
      {
        fill: options.baseColor,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );
    this.addChild( thisButton.overlayForHorizGradient );

    thisButton.label.center = thisButton.upCenter;
    thisButton.addChild( thisButton.label );

    // Hook up the button listener to modify the appearance as the state
    // changes and to hook up the callback function.
    thisButton.addInputListener( new ButtonListener( {

      up: function() {
        thisButton._state = 'up';
        thisButton._update();
      },

      over: function() {
        thisButton._state = 'over';
        thisButton._update();
      },

      down: function() {
        thisButton._state = 'down';
        thisButton._update();
      },

      out: function() {
        thisButton._state = 'up'; //NOTE: 'out' state looks the same as 'up'
        thisButton._update();
      },

      fire: function() {
        if ( thisButton._enabled.get() ) {
          thisButton._fire();
        }
      }
    } ) );

    var buttonModel = new ButtonModel( callback );
    this.addInputListener( buttonModel );
    buttonModel.interactionState.link( function( state ) {
      console.log( 'interactionState changed, new value = ' + state );
    } );

    // Add an explicit mouse area so that the child nodes can all be non-pickable.
    this.mouseArea = Shape.rectangle( 0, 0, thisButton.buttonWidth, thisButton.buttonHeight );

    // Expand the touch area so that the button works better on touch devices.
    var touchAreaWidth = thisButton.buttonWidth * options.touchAreaExpansionFactor;
    var touchAreaHeight = thisButton.buttonHeight * options.touchAreaExpansionFactor;
    this.touchArea = Shape.rectangle( -touchAreaWidth / 2, -touchAreaHeight / 2, touchAreaWidth, touchAreaHeight );

    // accessibility
    thisButton.addPeer( '<input type="button" aria-label="' + _.escape( options.label ) + '">',
      { click: thisButton._fire.bind( thisButton ) }
    );

    thisButton._enabled.link( function( enabled ) {
      thisButton.cursor = enabled ? options.cursor : 'default';
      thisButton._update();
    } );

    // Mutate with the options after the layout is complete so that you can
    // use width-dependent fields like centerX, etc.
    thisButton.mutate( options );
  }

  return inherit( Node, RectangularPushButton, {

    // Adds a listener. If already a listener, this is a no-op.
    addListener: function( listener ) {
      if ( this._listeners.indexOf( listener ) === -1 ) {
        this._listeners.push( listener );
      }
    },

    // Remove a listener. If not a listener, this is a no-op.
    removeListener: function( listener ) {
      var i = this._listeners.indexOf( listener );
      if ( i !== -1 ) {
        this._listeners.splice( i, 1 );
      }
    },

    _fire: function() {
      var copy = this._listeners.slice( 0 );
      copy.forEach( function( listener ) {
        listener();
      } );
    },

    _update: function() {
      // use visible instead of add/removeChild to prevent flickering
      var enabled = this._enabled.get();
      if ( enabled ) {
        this.background.fill = this.disabledBaseColor;
      }
      else {
        switch( this._state ) {

          case 'up':
            this.background.fill = this.upFillVertical;
            this.overlayForHorizGradient.fill = this.upFillHorizontal;
            this.label.center = this.upCenter;
            break;

          case 'down':
            this.background.fill = this.downFill;
            this.overlayForHorizGradient.fill = this.overFillHorizontal;
            this.label.center = this.downCenter;
            break;

          case 'over':
            this.label.center = this.upCenter;
            this.background.fill = this.overFillVertical;
            this.overlayForHorizGradient.fill = this.overFillHorizontal;
            break;
        }
      }
    },

    set enabled( value ) {
      assert && assert( typeof value === 'boolean', 'RectangularPushButton.enabled must be a boolean value' ); // Scenery complains about visible otherwise
      this._enabled.set( value );
    },

    get enabled() { return this._enabled.get(); }
  } );
} );