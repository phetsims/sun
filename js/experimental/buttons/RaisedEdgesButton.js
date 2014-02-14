// Copyright 2002-2013, University of Colorado Boulder

/**
 * Button with raised edges and an overall 3D-ish look.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Includes
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var RAISED_EDGE_WIDTH = 3;
  var OUTLINE_EDGE_WIDTH = 3;

  /**
   * @param {function} callback
   * @param {Node} label - Node to put on surface of button, could be text, icon, or whatever
   * @param {Object} options
   * @constructor
   */
  function RaisedEdgeButton( callback, label, options ) {

    var thisButton = this;
    Node.call( thisButton );

    options = _.extend( {
      // Default values.
      cursor: 'pointer',
      cornerRounding: 8,
      xMargin: 5,
      yMargin: 5,
      touchAreaExpansionFactor: 1.3,
      baseColor: new Color( 255, 242, 2 ),
      disabledBaseColor: new Color( 136, 137, 131 ),
      enabled: true
    }, options );

    thisButton.buttonWidth = label.width + options.xMargin * 2;
    thisButton.buttonHeight = label.height + options.yMargin * 2;
    thisButton._state = 'up';
    thisButton._enabled = new Property( options.enabled );
    thisButton._listeners = [];
    if ( options.listener ) { thisButton._listeners.push( callback ); }
    thisButton.baseColor = options.baseColor;
    thisButton.disabledBaseColor = options.disabledBaseColor;
    thisButton.label = label;
    thisButton.upCenter = new Vector2( thisButton.buttonWidth / 2 + OUTLINE_EDGE_WIDTH + RAISED_EDGE_WIDTH,
      thisButton.buttonHeight / 2 + OUTLINE_EDGE_WIDTH + RAISED_EDGE_WIDTH );
    thisButton.downCenter = thisButton.upCenter;

    // Gradient fills used for various button states
    thisButton.upFill = new LinearGradient( thisButton.buttonWidth / 2 - 6, 0, thisButton.buttonWidth / 2 + 6, thisButton.buttonHeight )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 0.2, thisButton.baseColor )
      .addColorStop( 0.8, thisButton.baseColor )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.1 ) );

    thisButton.overFill = new LinearGradient( thisButton.buttonWidth / 2 - 6, 0, thisButton.buttonWidth / 2 + 6, thisButton.buttonHeight )
      .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 0.8, thisButton.baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, thisButton.baseColor.colorUtilsDarker( 0.2 ) );

    thisButton.downFill = new LinearGradient( 0, 0, 0, thisButton.buttonHeight )
      .addColorStop( 0, thisButton.baseColor.colorUtilsDarker( 0.3 ) )
      .addColorStop( 0.8, thisButton.baseColor.colorUtilsDarker( 0.1 ) );

    // Use a rectangle for the outline instead of a stroke for better scaling.
    thisButton.outline = new Rectangle( 0, 0, thisButton.buttonWidth + ( OUTLINE_EDGE_WIDTH + RAISED_EDGE_WIDTH ) * 2,
      thisButton.buttonHeight + ( OUTLINE_EDGE_WIDTH + RAISED_EDGE_WIDTH ) * 2,
      options.cornerRounding, options.cornerRounding,
      {
        fill: new LinearGradient( 0, 0, thisButton.buttonWidth, thisButton.buttonWidth )
          .addColorStop( 0, 'rgb( 194, 195, 197 )' )
          .addColorStop( 1, 'black' )
      } );
    this.addChild( thisButton.outline );

    // Create and add the raised edge.
    thisButton.raisedEdge = new Rectangle( 0, 0, thisButton.buttonWidth + RAISED_EDGE_WIDTH * 2, thisButton.buttonHeight + RAISED_EDGE_WIDTH * 2,
      options.cornerRounding, options.cornerRounding,
      {
        fill: new LinearGradient( 0, 0, thisButton.buttonWidth, thisButton.buttonWidth )
          .addColorStop( 0, thisButton.baseColor.colorUtilsBrighter( 0.5 ) )
          .addColorStop( 1.0, thisButton.baseColor.colorUtilsDarker( 0.5 ) ),
        center: this.upCenter
      } );
    this.addChild( thisButton.raisedEdge );

    // Create and add the main button background.
    thisButton.buttonCenterBackground = new Rectangle( 0, 0, thisButton.buttonWidth, thisButton.buttonHeight,
      options.cornerRounding, options.cornerRounding,
      {
        fill: options.baseColor,
        center: this.upCenter
      } );
    this.addChild( thisButton.buttonCenterBackground );

    // Add the label.
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

  return inherit( Node, RaisedEdgeButton, {

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
      var enabled = this._enabled.get();
      this.raisedEdge.visible = enabled;
      if ( !enabled ) {
        this.buttonCenterBackground.fill = this.disabledBaseColor;
      }
      else {
        switch( this._state ) {

          case 'up':
            this.buttonCenterBackground.fill = this.upFill;
            this.label.center = this.upCenter;
            break;

          case 'down':
            this.buttonCenterBackground.fill = this.downFill;
            this.label.center = this.downCenter;
            break;

          case 'over':
            this.label.center = this.upCenter;
            this.buttonCenterBackground.fill = this.overFill;
            break;
        }
      }
    },

    set enabled( value ) {
      assert && assert( typeof value === 'boolean', 'enabled must be a boolean value' ); // Scenery complains about visible otherwise
      this._enabled.set( value );
    },

    get enabled() { return this._enabled.get(); }
  } );
} );