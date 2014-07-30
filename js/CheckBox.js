// Copyright 2002-2013, University of Colorado Boulder

/**
 * Check box.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {Node} content
   * @param {Property<Boolean>} property
   * @constructor
   * @param options
   */
  function CheckBox( content, property, options ) {
    var checkBox = this;
    options = _.extend( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkBoxColor: 'black',
      checkBoxColorDisabled: 'gray'
    }, options );

    var thisNode = this;
    Node.call( this );

    // save this stuff for use in prototype functions
    thisNode.options = options; // @private
    thisNode.content = content; // @private
    thisNode._enabled = true; // @private

    // Make the background white.  Until we are creating our own shapes, just
    // put a white rectangle behind the font awesome check box icons.
    var whiteBackground = new Rectangle( 0, -options.boxWidth, options.boxWidth * 0.95, options.boxWidth * 0.95,
      options.boxWidth * 0.2, options.boxWidth * 0.2, {fill: 'white'} );

    thisNode.uncheckedNode = new FontAwesomeNode( 'check_empty', { fill: options.checkBoxColor } ); // @private
    var iconScale = options.boxWidth / thisNode.uncheckedNode.width;
    thisNode.uncheckedNode.scale( iconScale );
    thisNode.checkedNode = new FontAwesomeNode( 'check', { scale: iconScale, fill: options.checkBoxColor } ); // @private

    thisNode.addChild( whiteBackground );
    thisNode.addChild( thisNode.checkedNode );
    thisNode.addChild( thisNode.uncheckedNode );
    thisNode.addChild( content );

    content.left = thisNode.checkedNode.right + options.spacing;
    content.centerY = thisNode.checkedNode.centerY;

    // put a rectangle on top of everything to prevent dead zones when clicking
    thisNode.addChild( new Rectangle( thisNode.left, thisNode.top, thisNode.width, thisNode.height ) );

    content.pickable = false; // since there's a pickable rectangle on top of content

    // interactivity
    thisNode.addInputListener( new ButtonListener( {
      fire: function() {
        if ( thisNode._enabled ) {
          property.value = !property.value;
        }
      }
    } ) );

    // sync with property
    property.link( function( checked ) {
      thisNode.checkedNode.visible = checked;
      thisNode.uncheckedNode.visible = !checked;
    } );

    //Add accessibility
    thisNode.addPeer( '<input type="checkbox">', {click: function() {property.value = !property.value;}, label: options.label} );
    property.link( function( value ) {
      _.each( checkBox.instances, function( instance ) {

        //Make sure accessibility is enabled, then apply the change to the peer
        _.each( instance.peers, function( peer ) {
          peer.element.setAttribute( 'checked', value );
        } );
      } );
    } );

    // Apply additional options
    thisNode.mutate( options );
  }

  return inherit( Node, CheckBox, {

    // prototype properties

    get enabled() { return this._enabled; },

    set enabled( value ) {

      this._enabled = value;
      this.pickable = value;

      // set the color of the check box icons
      this.checkedNode.fill = value ? this.options.checkBoxColor : this.options.checkBoxColorDisabled;
      this.uncheckedNode.fill = this.checkedNode.fill;

      // enable/disable the content, if it supports it
      if ( this.content.setEnabled ) {
        this.content.setEnabled( value );
      }
    }

  }, {

    // static properties

    /**
     * Factory method, creates a check box with a text label and optional icon.
     * @param {String} text
     * @param {*} textOptions options that apply to the text, same as scenery.Text
     * @param {Property<Boolean>} property
     * @returns {CheckBox}
     */
    createTextCheckBox: function( text, textOptions, property, checkBoxOptions ) {

      textOptions = _.extend( {
        fill: 'black',
        fillDisabled: 'rgb(220,220,220)'
      }, textOptions );

      checkBoxOptions = _.extend( {
        icon: null,  // an optional node, added to the right of the text
        iconSpacing: 15
      }, checkBoxOptions );

      var content = new Node();

      // text
      var textNode = new Text( text, textOptions );
      content.addChild( textNode );

      // options icon
      if ( checkBoxOptions.icon ) {
        content.addChild( checkBoxOptions.icon );
        //TODO support different layouts of text and image?
        checkBoxOptions.icon.left = textNode.right + checkBoxOptions.iconSpacing;
        checkBoxOptions.icon.centerY = textNode.centerY;
      }

      content.setEnabled = function( enabled ) {
        textNode.fill = enabled ? textOptions.fill : textOptions.fillDisabled;

        // if the check box has an icon...
        if ( checkBoxOptions.icon ) {
          if ( checkBoxOptions.icon.setEnabled ) {
            // use setEnabled if provided by icon
            checkBoxOptions.icon.setEnabled( enabled );
          }
          else {
            // fallback to using opacity
            checkBoxOptions.icon.opacity = enabled ? 1 : 0.3;
          }
        }
      };

      return new CheckBox( content, property, checkBoxOptions );
    }
  } );
} );