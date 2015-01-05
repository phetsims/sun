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
   * @param {Property.<boolean>} property
   * @constructor
   * @param {Object} [options]
   */
  function CheckBox( content, property, options ) {
    var checkBox = this;
    options = _.extend( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkBoxColor: 'black',
      checkBoxColorDisabled: 'gray',
      checkBoxColorBackground: 'white',
      tabIndex: 0,
      componentID: 'componentID'
    }, options );

    var thisNode = this;
    Node.call( this );

    thisNode._checkBoxColor = options.checkBoxColor; // @private
    thisNode._checkBoxColorDisabled = options.checkBoxColorDisabled; // @private
    thisNode._checkBoxColorBackground = options.checkBoxColorBackground; // @private

    // save this stuff for use in prototype functions
    thisNode.options = options; // @private
    thisNode.content = content; // @private
    thisNode._enabled = true; // @private

    // Make the background.  Until we are creating our own shapes, just
    // put a rectangle behind the font awesome check box icons.
    thisNode.backgroundNode = new Rectangle( 0, -options.boxWidth, options.boxWidth * 0.95, options.boxWidth * 0.95,
        options.boxWidth * 0.2, options.boxWidth * 0.2 );

    thisNode.uncheckedNode = new FontAwesomeNode( 'check_empty' ); // @private
    var iconScale = options.boxWidth / thisNode.uncheckedNode.width;
    thisNode.uncheckedNode.scale( iconScale );
    thisNode.checkedNode = new FontAwesomeNode( 'check', { scale: iconScale } ); // @private

    thisNode.addChild( thisNode.backgroundNode );
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
      fire: phet.arch.wrap( 'user', options.componentID, 'CheckBox', 'toggled', function() {
        if ( thisNode._enabled ) {
          property.value = !property.value;
        }
      } )
    } ) );

    // sync with property
    property.link( function( checked ) {
      thisNode.checkedNode.visible = checked;
      thisNode.uncheckedNode.visible = !checked;
    } );

    //Add accessibility
    thisNode.addPeer( '<input type="checkbox">', {
      click: function() {property.value = !property.value;},
      label: options.label,

      //This is here solely to support FAMB accessibility, see https://github.com/phetsims/forces-and-motion-basics/issues/110
      tabIndex: options.tabIndex
    } );
    property.link( function( value ) {
      _.each( checkBox.instances, function( instance ) {

        //Make sure accessibility is enabled, then apply the change to the peer
        _.each( instance.peers, function( peer ) {
          peer.element.setAttribute( 'checked', value );
        } );
      } );
    } );

    this.updateColors();

    // Apply additional options
    thisNode.mutate( options );
  }

  return inherit( Node, CheckBox, {

    // prototype properties

    get checkBoxColorBackground() { return this._checkBoxColorBackground; },
    set checkBoxColorBackground( value ) {
      if ( this._checkBoxColorBackground !== value ) {
        this._checkBoxColorBackground = value;
        this.updateColors();
      }
    },

    get checkBoxColor() { return this._checkBoxColor; },
    set checkBoxColor( value ) {
      if ( this._checkBoxColor !== value ) {
        this._checkBoxColor = value;
        this.updateColors();
      }
    },

    get checkBoxColorDisabled() { return this._checkBoxColorDisabled; },
    set checkBoxColorDisabled( value ) {
      if ( this._checkBoxColorDisabled !== value ) {
        this._checkBoxColorDisabled = value;
        this.updateColors();
      }
    },

    // @private
    updateColors: function() {
      this.backgroundNode.fill = this._checkBoxColorBackground;
      this.checkedNode.fill = this._enabled ? this._checkBoxColor : this._checkBoxColorDisabled;
      this.uncheckedNode.fill = this.checkedNode.fill;
    },

    get enabled() { return this._enabled; },

    set enabled( value ) {

      this._enabled = value;
      this.pickable = value;

      // set the color of the check box icons
      this.updateColors();

      // enable/disable the content, if it supports it
      if ( this.content.setEnabled ) {
        this.content.setEnabled( value );
      }
    }

  }, {

    // static properties

    /**
     * Factory method, creates a check box with a text label and optional icon.
     * @param {string} text
     * @param {*} textOptions options that apply to the text, same as scenery.Text
     * @param {Property.<boolean>} property
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