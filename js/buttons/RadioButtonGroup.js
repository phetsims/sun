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
   * @param {Array<Object>} contentArray an array of objects that have two keys each: value and node
   * the node key holds a scenery Node that is the content for a given radio button.
   * the value key should hold the value that the property takes on for the corresponding
   * node to be selected.
   * @param {Object} [options]
   * @constructor
   */
  function RadioButtonGroup( property, contentArray, options ) {
    console.log( options );
    assert && assert( options.hasOwnProperty( 'children' ), 'Cannot pass in children to a RadioButtonGroup, ' +
                                                            'use siblings instead' );

    // make sure every object in the content array has properties 'node' and 'value'
    assert && assert( _.every( contentArray, function( obj ) {
      return obj.hasOwnProperty( 'node' ) && obj.hasOwnProperty( 'value' );
    } ) );

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
    var i;
    for ( i = 0; i < contentArray.length; i++ ) {
      options.xMargin = ( ( maxWidth - contentArray[i].node.width ) / 2 ) + options.buttonContentXMargin;
      options.yMargin = ( ( maxHeight - contentArray[i].node.height ) / 2 ) + options.buttonContentYMargin;

      buttons.push( new SingleRadioButton( contentArray[i].value, property,
        _.extend( { content: contentArray[i].node }, options )
      ) );
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
