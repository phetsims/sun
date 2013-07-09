// Copyright 2002-2013, University of Colorado Boulder

/**
 * Button with a rectangle around its content.
 */
define( function( require ) {
  "use strict";

  // import
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {Node} content
   * @param {function} callback
   * @param {object} options
   * @constructor
   */
  function Button( content, callback, options ) {

    options = _.extend( {
        cursor: 'pointer',
        fill: 'white',
        disabledFill: 'rgb(175,175,175)',
        stroke: 'black',
        disabledStroke: 'rgb(175,175,175)',
        lineWidth: 1,
        //TODO default margins should be computed based on content dimensions
        xMargin: 5,
        yMargin: 5,
        cornerRadius: 10,
        label: ''
      },
      options );

    var thisButton = this;
    Node.call( thisButton );

    thisButton._enabled = new Property( true );
    thisButton._listeners = [ callback ];

    // rectangle around the content
    var rectangle = new Rectangle( 0, 0, content.width + ( 2 * options.xMargin ), content.height + ( 2 * options.yMargin ), options.cornerRadius, options.cornerRadius,
      {stroke: options.stroke, lineWidth: options.lineWidth, fill: options.fill } );
    thisButton.addChild( rectangle );

    // content centered in the rectangle
    content.centerX = rectangle.width / 2;
    content.centerY = rectangle.height / 2;
    thisButton.addChild( content );

    thisButton.addInputListener( new ButtonListener( {
      fire: function() { thisButton._fire(); }
    } ) );

    // accessibility
    thisButton.addPeer( '<input type="button" aria-label="' + _.escape( options.label ) + '">',
      { click: thisButton._fire.bind( thisButton ) }
    );

    thisButton._enabled.link( function( enabled ) {
      //TODO: enable/disable the content (if the content supports it)
      rectangle.fill = enabled ? options.fill : options.disabledFill;
      rectangle.stroke = enabled ? options.stroke : options.disabledStroke;
      thisButton.pickable = enabled;
    } );

    //Mutate with the options after the layout is complete so that you can use width-dependent fields like centerX, etc.
    //TODO: Does this remove the need to put options in the super call above?
    thisButton.mutate( options );
  }

  inherit( Node, Button, {

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
      this._listeners.forEach( function( listener ) {
        listener();
      } );
    },

    set enabled( enabled ) { this._enabled.set( enabled ); },

    get enabled() { return this._enabled.get(); }
  } );

  return Button;
} );
