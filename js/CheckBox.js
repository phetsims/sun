// Copyright 2002-2013, University of Colorado Boulder

/**
 * Check box.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );

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
        boxScale: 0.6,
        cursor: 'pointer',
        checkBoxColor: 'black',

        //TODO: Should these default to something larger?
        touchAreaTopPadding: 0,
        touchAreaBottomPadding: 0,
        touchAreaLeftPadding: 0,
        touchAreaRightPadding: 0
      }, options );

    var thisNode = this;
    Node.call( this );

    var x = options.boxScale / 0.75;

    //Make the background white.  Until we are creating our own shapes, just put a white rectangle behind the font awesome check box icons
    var whiteBackground = new Rectangle( 0, -25 * x, 25 * x, 25 * x, 5 * x, 5 * x, {fill: 'white'} );

    var checkedNode = new FontAwesomeNode( 'check', { scale: options.boxScale, fill: options.checkBoxColor } );
    var uncheckedNode = new FontAwesomeNode( 'check_empty', { scale: options.boxScale, fill: options.checkBoxColor } );

    thisNode.addChild( whiteBackground );
    thisNode.addChild( checkedNode );
    thisNode.addChild( uncheckedNode );
    thisNode.addChild( content );

    content.left = checkedNode.right + options.spacing;
    content.centerY = checkedNode.centerY;

    // put a rectangle on top of everything to prevent dead zones which clicking
    thisNode.mouseArea = thisNode.touchArea = Shape.rectangle( thisNode.left - options.touchAreaLeftPadding, thisNode.top - options.touchAreaTopPadding, thisNode.width + options.touchAreaLeftPadding + options.touchAreaRightPadding, thisNode.height + options.touchAreaTopPadding + options.touchAreaBottomPadding );

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

  return inherit( Node, CheckBox, { /* prototype properties */ }, {

    // static properties

    /**
     * Factory method, creates a check box with a text label.
     * @param {String} text
     * @param {*} textOptions options that apply to the text, same as scenery.Text
     * @param {Property<Boolean>} property
     * @param checkBoxOptions options that apply to the check box as a whole
     * @returns {CheckBox}
     */
    createTextCheckBox: function( text, textOptions, property, checkBoxOptions ) {
       return new CheckBox( new Text( text, textOptions ), property, checkBoxOptions );
    },

    /**
     * Factory method, creates a check box with an image.
     * @param {Image} image
     * @param {*} imageOptions options that apply to the image, same as scenery.Image
     * @param {Property<Boolean>} property
     * @param checkBoxOptions options that apply to the check box as a whole
     * @returns {CheckBox}
     */
    createImageCheckBox: function( image, imageOptions, property, checkBoxOptions ) {
      return new CheckBox( new Image( image, imageOptions ), property, checkBoxOptions );
    },

    /**
     * Factory method, creates a check box with text and and image.
     * The image is to the right of the text, and vertically centered.
     * @param {String} text
     * @param {*} textOptions options that apply to the text, same as scenery.Text
     * @param {Image} image
     * @param {*} imageOptions options that apply to the image, same as scenery.Image
     * @param {Property<Boolean>} property
     * @param checkBoxOptions options that apply to the check box as a whole
     * @returns {CheckBox}
     */
    createTextImageCheckBox: function( text, textOptions, image, imageOptions, property, checkBoxOptions ) {

      checkBoxOptions = _.extend( {
        xSpacing: 6
      }, checkBoxOptions );

      var textNode = new Text( text, textOptions );
      var imageNode = new Image( image, imageOptions );
      var content = new Node();
      content.addChild( textNode );
      content.addChild( imageNode );
      //TODO support different layouts of text and image?
      imageNode.left = textNode.right + checkBoxOptions.xSpacing;
      imageNode.centerY = textNode.centerY;

      return new CheckBox( content, property, checkBoxOptions );
    }
  } );
} );