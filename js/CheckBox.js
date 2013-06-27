// Copyright 2002-2013, University of Colorado Boulder

/**
 * Check box.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  "use strict";

  // imports
  var ButtonListener = require( "SCENERY/input/ButtonListener" );
  var FontAwesomeNode = require( "SUN/FontAwesomeNode" );
  var inherit = require( "PHET_CORE/inherit" );
  var Node = require( "SCENERY/nodes/Node" );
  var Rectangle = require( "SCENERY/nodes/Rectangle" );

  /**
   * @param {Node} content
   * @param {Property<Boolean>} property
   * @constructor
   * @param options
   */
  function CheckBox( content, property, options ) {
    var checkBox = this;
    options = _.extend(
      {
        spacing: 5,
        boxScale: 0.75,
        cursor: 'pointer'
      }, options );

    var thisNode = this;
    Node.call( this );

    var checkedNode = new FontAwesomeNode( "check", { scale: options.boxScale } );
    var uncheckedNode = new FontAwesomeNode( "check_empty", { scale: options.boxScale } );

    thisNode.addChild( checkedNode );
    thisNode.addChild( uncheckedNode );
    thisNode.addChild( content );

    content.left = checkedNode.right + options.spacing;
    content.centerY = checkedNode.centerY;

    // put a rectangle on top of everything to prevent dead zones which clicking
    thisNode.addChild( new Rectangle( thisNode.left, thisNode.top, thisNode.width, thisNode.height ) );

    // interactivity
    thisNode.addInputListener( new ButtonListener( {
      fire: function() {
        property.value = !property.value;
      }
    } ) );

    // sync with property
    property.link( function( checked ) {
      checkedNode.visible = checked;
      uncheckedNode.visible = !checked;
    } );

    //Add accessibility
    this.addPeer( '<input type="checkbox">', {click: function() {property.value = !property.value;}, label: options.label} );
    property.link( function( value ) {
      _.each( checkBox.instances, function( instance ) {

        //Make sure accessibility is enabled, then apply the change to the peer
        _.each( instance.peers, function( peer ) {
          peer.element.setAttribute( 'checked', value );
        } );
      } );
    } );

    // Apply additional options
    this.mutate( options );
  }

  inherit( Node, CheckBox );

  return CheckBox;
} );