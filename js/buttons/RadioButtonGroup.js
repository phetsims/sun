// Copyright 2002-2014, University of Colorado Boulder

/**
 * Radio buttons. See ButtonsDemoView for example usage.
 * This type creates a group of radio buttons in either a horizontal or vertical formation.
 * Each button inherits from RectangularButtonView, and can take a Scenery Node as its content.
 * A typical use case is when you want to have different modes of a view to select from. Typically,
 * RadioButtonGroup radio buttons display some kind of icon or image, but that is not mandatory.
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RadioButtonGroupMember = require( 'SUN/buttons/RadioButtonGroupMember' );
  var Color = require( 'SCENERY/util/Color' );
  var RadioButtonGroupAppearance = require( 'SUN/buttons/RadioButtonGroupAppearance' );
  var Property = require( 'AXON/Property' );
  var ColorConstants = require( 'SUN/ColorConstants' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var Shape = require( 'KITE/Shape' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * RadioButtonGroup constructor.
   *
   * @param {Property} property
   * @param {Array} contentArray an array of objects that have two keys each: value and node
   * the node key holds a scenery Node that is the content for a given radio button.
   * the value key should hold the value that the property takes on for the corresponding
   * node to be selected. Optionally, these objects can have an attribute 'label', which is
   * a {Node} used to label the button.
   * @param {Object} [options]
   * @constructor
   */
  function RadioButtonGroup( property, contentArray, options ) {
    assert && assert( !options.hasOwnProperty( 'children' ), 'Cannot pass in children to a RadioButtonGroup, ' +
                                                             'create siblings in the parent node instead' );

    // make sure every object in the content array has properties 'node' and 'value'
    assert && assert( _.every( contentArray, function( obj ) {
      return obj.hasOwnProperty( 'node' ) && obj.hasOwnProperty( 'value' );
    } ), 'contentArray must be an array of objects with properties "node" and "value"' );

    var i; // for loops

    // make sure that each value passed into the contentArray is unique
    var uniqueValues = [];
    for ( i = 0; i < contentArray.length; i++ ) {
      if ( uniqueValues.indexOf( contentArray[i].value ) < 0 ) {
        uniqueValues.push( contentArray[i].value );
      }
      else {
        throw new Error( 'Duplicate value: "' + contentArray[i].value + '" passed into RadioButtonGroup.js' );
      }
    }

    // make sure that the property passed in currently has a value from the contentArray
    if ( uniqueValues.indexOf( property.get() ) === -1 ) {
      throw new Error( 'The property passed in to RadioButtonGroup has an illegal value "' + property.get() +
                       '" that is not present in the contentArray' );
    }

    options = _.extend( {

      // The distance between the radio buttons (as in VBox or HBox)
      spacing: 10,
      orientation: 'vertical',
      enabledProperty: new Property( true ), // whether or not the set of radio buttons as a whole is enabled

      // The fill for the rectangle behind the radio buttons.  Default color is bluish color, as in the other button library.
      baseColor: ColorConstants.LIGHT_BLUE,
      disabledBaseColor: ColorConstants.LIGHT_GRAY,

      // Opacity can be set separately for the buttons and button content.
      selectedButtonOpacity: 1,
      deselectedButtonOpacity: 0.6,
      selectedContentOpacity: 1,
      deselectedContentOpacity: 0.6,
      overButtonOpacity: 0.8,
      overContentOpacity: 0.8,

      selectedStroke: 'black',
      deselectedStroke: new Color( 50, 50, 50 ),
      selectedLineWidth: 1.5,
      deselectedLineWidth: 1,

      // The following options specify highlight behavior overrides, leave as null to get the default behavior
      // Note that highlighting applies only to deselected buttons
      overFill: null,
      overStroke: null,
      overLineWidth: null,

      // These margins are *within* each button
      buttonContentXMargin: 5,
      buttonContentYMargin: 5,

      // TouchArea expansion
      xTouchExpansion: 5,
      yTouchExpansion: 5,

      // MouseArea expansion
      xMouseExpansion: 0,
      yMouseExpansion: 0,

      //The radius for each button
      cornerRadius: 4,

      // How far from the button the text label is (only applies if labels are passed in)
      labelSpacing: 0,

      // Which side of the button the label will appear, options are 'top', 'bottom', 'left', 'right'
      // (only applies if labels are passed in)
      labelAlign: 'bottom',

      // The default appearances use the color values specified above, but other appearances could be specified for more
      // customized behavior.  Generally setting the color values above should be enough to specify the desired look.
      buttonAppearanceStrategy: RadioButtonGroupAppearance.defaultRadioButtonsAppearance,
      contentAppearanceStrategy: RadioButtonGroupAppearance.contentAppearanceStrategy
    }, options );

    // calculate the maximum width and height of the content so we can make all radio buttons the same size
    var maxWidth = _.max( contentArray, function( content ) { return content.node.width; } ).node.width;
    var maxHeight = _.max( contentArray, function( content ) { return content.node.height; } ).node.height;

    // make sure all radio buttons are the same size and create the RadioButtons
    var buttons = [];
    var button;
    for ( i = 0; i < contentArray.length; i++ ) {
      // each individual radio button will have a different margin to make sure they are all the same size
      var xMargin = ( ( maxWidth - contentArray[i].node.width ) / 2 ) + options.buttonContentXMargin;
      var yMargin = ( ( maxHeight - contentArray[i].node.height ) / 2 ) + options.buttonContentYMargin;

      var radioButton = new RadioButtonGroupMember( contentArray[i].value, property,
        _.extend( { content: contentArray[i].node, xMargin: xMargin, yMargin: yMargin }, options ) );

      // ensure the buttons don't resize when selected vs unselected by adding a rectangle with the max size
      var maxLineWidth = Math.max( options.selectedLineWidth, options.deselectedLineWidth );
      var maxButtonWidth = maxLineWidth + contentArray[i].node.width + xMargin * 2;
      var maxButtonHeight = maxLineWidth + contentArray[i].node.height + yMargin * 2;
      var boundingRect = new Rectangle( 0, 0, maxButtonWidth, maxButtonHeight,
        {
          fill: 'rgba(0,0,0,0)',
          center: radioButton.center
        } );
      radioButton.addChild( boundingRect );

      // if a label is given, the button becomes a LayoutBox with the label and button
      if ( contentArray[i].label ) {
        var label = contentArray[i].label;
        var labelOrientation = ( options.labelAlign === 'bottom' || options.labelAlign === 'top' ) ? 'vertical' : 'horizontal';
        var labelChildren = ( options.labelAlign === 'left' || options.labelAlign === 'top' ) ? [label, radioButton] : [radioButton, label];
        button = new LayoutBox( { children: labelChildren, spacing: options.labelSpacing, orientation: labelOrientation } );

        var xExpand = options.xTouchExpansion;
        var yExpand = options.yTouchExpansion;

        // override the touch and mouse areas defined in RectangularButtonView
        // extra width is added to the SingleRadioButtons so they don't change size if the line width changes,
        // that is why lineWidth is subtracted from the width and height when calculating these new areas
        radioButton.touchArea = Shape.rectangle( -xExpand, -yExpand, button.width + 2 * xExpand - maxLineWidth, button.height + 2 * yExpand - maxLineWidth);

        xExpand = options.xMouseExpansion;
        yExpand = options.yMouseExpansion;
        radioButton.mouseArea = Shape.rectangle( -xExpand, -yExpand, button.width + 2 * xExpand - maxLineWidth, button.height + 2 * yExpand - maxLineWidth);

        // make sure the label mouse and touch areas don't block the expanded button touch and mouse areas
        label.pickable = false;

        // use the same content appearance strategy for the labels that is used for the button content
        options.contentAppearanceStrategy( label, radioButton.interactionStateProperty, options );
      }
      else {
        button = radioButton;
      }
      buttons.push( button );
    }

    // @private
    this.enabledProperty = options.enabledProperty;

    // super call
    options.children = buttons;
    LayoutBox.call( this, options );
    var thisNode = this;

    // When the entire RadioButtonGroup gets disabled, gray them out and make them unpickable (and vice versa)
    this.enabledProperty.link( function( isEnabled ) {
      thisNode.pickable = isEnabled;

      for ( i = 0; i < contentArray.length; i++ ) {
        if ( buttons[i] instanceof LayoutBox ) {
          for ( var j = 0; j < 2; j++ ) {
            buttons[i].children[j].enabled = isEnabled;
          }
        }
        else {
          buttons[i].enabled = isEnabled;
        }
      }
    } );

    // make the unselected buttons pickable and have a pointer cursor
    property.link( function( value ) {
      if ( thisNode.enabledProperty.get() ) {
        for ( i = 0; i < contentArray.length; i++ ) {
          if ( contentArray[i].value === value ) {
            buttons[i].pickable = false;
            buttons[i].cursor = null;
          }
          else {
            buttons[i].pickable = true;
            buttons[i].cursor = 'pointer';
          }
        }
      }
    } );
  }

  return inherit( LayoutBox, RadioButtonGroup, {

    set enabled( value ) {
      assert && assert( typeof value === 'boolean', 'RadioButtonGroup.enabled must be a boolean value' );
      this.enabledProperty.set( value );
    },

    get enabled() { return this.enabledProperty.get(); }

  } );
} );
