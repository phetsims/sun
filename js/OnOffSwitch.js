// Copyright 2002-2014, University of Colorado Boulder

/**
 * On/off switch, similar to iOS' UISwitch, used in iOS `'Settings' app.
 * Drag the thumb to change the value, or click anywhere to toggle the value.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {Property<String>} onProperty
   * @param {*} options
   * @constructor
   */
  function OnOffSwitch( onProperty, options ) {

    options = _.extend( {
      size: new Dimension2( 60, 30 ), // if you want the thumb to be a circle, use width that is 2x height
      cursor: 'pointer',
      thumbFill: 'white',
      thumbStroke: 'black',
      trackOffFill: 'white', // track fill when onProperty is false
      trackOnFill: 'rgb(0,200,0)', // track fill when onProperty is true
      trackStroke: 'black',
      toggleWhileDragging: false // set this to true if you want the property to toggle while you're dragging the thumb
    }, options );

    var thisNode = this;
    Node.call( thisNode );

    // track that the thumb slides in
    var cornerRadius = options.size.height / 2;
    var trackNode = new Rectangle( 0, 0, options.size.width, options.size.height, cornerRadius, cornerRadius, {
      fill: options.trackOffFill,
      stroke: options.trackStroke
    } );
    thisNode.addChild( trackNode );

    // thumb (aka knob)
    var thumbNode = new Rectangle( 0, 0, 0.5 * options.size.width, options.size.height, cornerRadius, cornerRadius, {
      fill: options.thumbFill,
      stroke: options.thumbStroke
    } );
    thisNode.addChild( thumbNode );
    var touchDelta = 0.25 * options.size.height;
    thumbNode.touchArea = Shape.roundRect( -touchDelta, -touchDelta, (0.5 * options.size.width) + (2 * touchDelta), options.size.height + (2 * touchDelta), cornerRadius, cornerRadius );

    // move thumb to on or off position
    var updateThumb = function( on ) {
      if ( on ) {
        thumbNode.right = options.size.width;
        trackNode.fill = options.trackOnFill;
      }
      else {
        thumbNode.left = 0;
        trackNode.fill = options.trackOffFill;
      }
    };

    // sync with onProperty
    onProperty.link( updateThumb.bind( thisNode ) );
    
    // converts the thumb position to a boolean on/off value
    var thumbPositionToValue = function() { return thumbNode.centerX > trackNode.centerX; }; 

    // thumb interactivity
    var dragging = false;
    thumbNode.addInputListener( new SimpleDragHandler( {

      allowTouchSnag: true,

      drag: function() { dragging = true; },

      translate: function( params ) {
        // move the thumb while it's being dragged
        if ( thumbNode.left + params.delta.x < 0 ) {
          thumbNode.left = 0;
        }
        else if ( thumbNode.right + params.delta.x > options.size.width ) {
          thumbNode.right = options.size.width;
        }
        else {
          thumbNode.x = thumbNode.x + params.delta.x;
        }
        // track fill changes based on the thumb positions
        trackNode.fill = thumbPositionToValue() ? options.trackOnFill : options.trackOffFill;
        // optionally toggle the property value
        if ( options.toggleWhileDragging ) {
          onProperty.set( thumbPositionToValue() );
        }
      },

      end: function() {
        // snap to whichever end the thumb is closest to
        onProperty.set( thumbPositionToValue() );
        updateThumb( onProperty.get() );
      }
    } ) );

    // clicking anywhere toggles on/off, if we aren't dragging the thumb
    thisNode.addInputListener( new ButtonListener( {
      fire: function() {
        if ( !dragging ) {
          onProperty.set( !onProperty.get() );
        }
        else {
          dragging = false;
        }
      }
    } ) );

    thisNode.mutate( options );
  }

  return inherit( Node, OnOffSwitch );
} );
