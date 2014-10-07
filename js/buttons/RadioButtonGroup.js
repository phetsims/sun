// Copyright 2002-2014, University of Colorado Boulder

/**
 * Radio buttons. See ButtonsDemoView for example usage.
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var SingleRadioButton = require( 'SUN/buttons/SingleRadioButton' );
  var Color = require( 'SCENERY/util/Color' );
  var RadioButtonsAppearance = require( 'SUN/buttons/RadioButtonsAppearance' );
  var Property = require( 'AXON/Property' );
  var ColorConstants = require( 'SUN/ColorConstants' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );

  /**
   * RadioButtonGroup constructor.
   *
   * @param {Property} property
   * @param {Array} contentArray an array of objects that have two keys each: value and node
   * the node key holds a scenery Node that is the content for a given radio button.
   * the value key should hold the value that the property takes on for the corresponding
   * node to be selected. Optionally, these object can contain an attribute 'label', which contains a label node (possibly text)
   * label that will appear under the button.
   * @param {Object} [options]
   * @constructor
   */
  function RadioButtonGroup( property, contentArray, options ) {
    assert && assert( !options.hasOwnProperty( 'children' ), 'Cannot pass in children to a RadioButtonGroup, ' +
                                                             'use siblings instead' );

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

      //The distance between the radio buttons (as in VBox or HBox)
      spacing: 10,
      orientation: 'vertical',
      enabledProperty: new Property( true ), // whether or not the set of radio buttons as a whole is enabled

      //The fill for the rectangle behind the radio buttons.  Default color is bluish color, as in the other button library.
      baseColor: ColorConstants.LIGHT_BLUE,
      disabledBaseColor: ColorConstants.LIGHT_GRAY,

      //Opacity can be set separately for the buttons and button content. If the button content is an Image, setting
      //the opacity on the button as a whole seems to have no effect on it.
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

      //The following options speciy highlight behavior overrides, leave as null to get the default behavior
      //Note that highlighting applies only to deselected buttons
      overFill: null,
      overStroke: null,
      overLineWidth: null,

      //These margins are *within* each button
      buttonContentXMargin: 5,
      buttonContentYMargin: 5,

      //The radius for each button
      cornerRadius: 4,

      //How far from the button the text label is (only applies if labels are passed in)
      labelSpacing: 0,

      //Which side of the button the label will appear, options are 'top', 'bottom', 'left', 'right'
      //(only applies if labels are passed in)
      labelAlign: 'bottom',

      //The default appearances use the color values specified above, but other appearances could be specified for more
      //customized behavior.  Generally setting the color values above should be enough to specify the desired look.
      buttonAppearanceStrategy: RadioButtonsAppearance.defaultRadioButtonsAppearance,
      contentAppearanceStrategy: RadioButtonsAppearance.contentAppearanceStrategy
    }, options );

    // calculate the maximum width and height of the content so we can make all radio buttons the same size
    var maxWidth = _.max( contentArray, function( content ) { return content.node.width; } ).node.width;
    var maxHeight = _.max( contentArray, function( content ) { return content.node.height; } ).node.height;

    // make sure all radio buttons are the same size and create the RadioButtons
    var buttons = [];
    var button, radioButton;
    for ( i = 0; i < contentArray.length; i++ ) {
      options.xMargin = ( ( maxWidth - contentArray[i].node.width ) / 2 ) + options.buttonContentXMargin;
      options.yMargin = ( ( maxHeight - contentArray[i].node.height ) / 2 ) + options.buttonContentYMargin;

      radioButton = new SingleRadioButton( contentArray[i].value, property, _.extend( { content: contentArray[i].node }, options ) );
      if ( contentArray[i].label ) {
        var labelOrientation = ( options.labelAlign === 'bottom' || options.labelAlign === 'top' ) ? 'vertical' : 'horizontal';
        var labelChildren = ( options.labelAlign === 'left' || options.labelAlign === 'top' ) ?
                            [contentArray[i].label, radioButton] : [radioButton, contentArray[i].label];
        button = new LayoutBox( { children: labelChildren, spacing: options.labelSpacing, orientation: labelOrientation } );
      }
      else {
        button = radioButton;
      }
      buttons.push( button );
    }

    this.enabledProperty = options.enabledProperty;

    // When the entire RadioButtonGroup gets disabled, gray them out and make them unpickable (and vice versa)
    this.enabledProperty.link( function( isEnabled ) {
      for ( i = 0; i < contentArray.length; i++ ) {
        buttons[i].pickable = isEnabled;
        buttons[i].enabled = isEnabled;
      }
    } );

    // make the unselected buttons pickable and have a pointer cursor
    var thisNode = this;
    property.link( function( value ) {
      if ( thisNode.enabledProperty.get() ) {

        var count = 0; // for making sure there is exactly one selected button

        for ( i = 0; i < contentArray.length; i++ ) {
          if ( contentArray[i].value === value ) {
            buttons[i].pickable = false;
            buttons[i].cursor = null;
            if ( contentArray[i].label ) {
              contentArray[i].label.opacity = 1;
            }
            count++;
          }
          else {
            buttons[i].pickable = true;
            buttons[i].cursor = 'pointer';
            if ( contentArray[i].label ) {
              contentArray[i].label.opacity = 0.5;
            }
          }
        }
        if ( count !== 1 ) {
          throw new Error( 'RadioButtonGroup does not have exactly one selected button for value=' + value );
        }
      }
    } );
    options.children = buttons;
    LayoutBox.call( this, options );
  }

  return inherit( LayoutBox, RadioButtonGroup,
    {

      set enabled( value ) {
        assert && assert( typeof value === 'boolean', 'RadioButtonGroup.enabled must be a boolean value' );
        this.enabledProperty.set( value );
      },

      get enabled() { return this.enabledProperty.get(); }

    } );
} );
