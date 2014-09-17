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
  var Node = require( 'SCENERY/nodes/Node' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var RadioButton = require( 'SUN/RadioButton' );
  var Color = require( 'SCENERY/util/Color' );
  var RadioButtonsAppearance = require( 'SUN/buttons/RadioButtonsAppearance' );
  var Property = require( 'AXON/Property' );
  var ColorConstants = require( 'SUN/ColorConstants' );

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

      selectedOpacity: 1,
      deselectedOpacity: 0.6,
      selectedStroke: 'black',
      deselectedStroke: new Color( 50, 50, 50 ),
      selectedLineWidth: 1.5,
      deselectedLineWidth: 1,

      //The following options speciy highlight behavior overrides, leave as null to get the default behavior
      selectedHighlightColor: null,
      deselectedHighlightColor: null,
      selectedHighlightStroke: null,
      deselectedHighlightStroke: null,
      selectedHighlightLineWidth: null,
      deselectedHighlightLineWidth: null,

      //These margins are *within* each button
      buttonContentXMargin: 5,
      buttonContentYMargin: 5,

      //The radius for each button
      cornerRadius: 4,

      //The default appearances use the color values specified above, but other appearances could be specified for more
      //customized behavior.  Generally setting the color values above should be enough to specify the desired look.
      selectedButtonAppearanceStrategy: RadioButtonsAppearance.defaultRadioButtonsAppearance,
      deselectedButtonAppearanceStrategy: RadioButtonsAppearance.defaultRadioButtonsAppearance,
      contentAppearanceStrategy: RectangularButtonView.fadeContentWhenDisabled
    }, options );

    // options for the RectangularPushButtons that house each radio button
    // These options are the same for buttons whether they are selected or deselected
    var buttonOptions = {
      xMargin: options.buttonContentXMargin,
      yMargin: options.buttonContentYMargin,
      cornerRadius: options.cornerRadius,
      baseColor: options.baseColor,
      disabledBaseColor: options.disabledBaseColor,
      contentAppearanceStrategy: options.contentAppearanceStrategy
    };

    // add extra options for selected vs deselected panels
    var selectedOptions = _.extend(
      {
        stroke: options.selectedStroke,
        lineWidth: options.selectedLineWidth,
        opacity: options.selectedOpacity,
        highlightColor: options.selectedHighlightColor,
        highlightStroke: options.selectedHighlightStroke,
        highlightLineWidth: options.selectedHighlightLineWidth,
        buttonAppearanceStrategy: options.selectedButtonAppearanceStrategy
      }, buttonOptions );

    var deselectedOptions = _.extend(
      {
        stroke: options.deselectedStroke,
        lineWidth: options.deselectedLineWidth,
        opacity: options.deselectedOpacity,
        highlightColor: options.deselectedHighlightColor,
        highlightStroke: options.deselectedHighlightStroke,
        highlightLineWidth: options.deselectedHighlightLineWidth,
        buttonAppearanceStrategy: options.deselectedButtonAppearanceStrategy
      }, buttonOptions );

    // calculate the maximum width and height of the content so we can make all radio buttons the same size
    var maxWidth = _.max( contentArray, function( content ) { return content.node.width; } ).node.width;
    var maxHeight = _.max( contentArray, function( content ) { return content.node.height; } ).node.height;

    // make sure all radio buttons are the same size and create the RadioButtons
    var buttons = [];
    var selectedNodes = [];
    var deselectedNodes = [];
    for ( var i = 0; i < contentArray.length; i++ ) {

      var xMargin = ( ( maxWidth - contentArray[i].node.width ) / 2 ) + options.buttonContentXMargin;
      var yMargin = ( ( maxHeight - contentArray[i].node.height ) / 2 ) + options.buttonContentYMargin;

      selectedOptions.xMargin = xMargin;
      selectedOptions.yMargin = yMargin;

      deselectedOptions.xMargin = xMargin;
      deselectedOptions.yMargin = yMargin;

      selectedNodes.push( new RectangularPushButton( _.extend( { content: contentArray[i].node }, selectedOptions ) ) );
      deselectedNodes.push( new RectangularPushButton( _.extend( { content: contentArray[i].node }, deselectedOptions ) ) );

      // Create the RadioButton itself, which switches between rendering the selected node and the deselected node.
      // By default, RadioButton uses a cursor 'pointer' but that is being handled below (so that selected nodes don't
      // have 'pointer')
      buttons.push( new RadioButton( property, contentArray[i].value, selectedNodes[i], deselectedNodes[i], { cursor: null } ) );
    }

    this.enabledProperty = options.enabledProperty;

    // When the entire RadioButtonGroup gets disabled, gray them out and make them unpickable (and vice versa)
    this.enabledProperty.link( function( isEnabled ) {
      for ( i = 0; i < contentArray.length; i++ ) {
        selectedNodes[i].enabled = isEnabled;
        deselectedNodes[i].enabled = isEnabled;
        buttons[i].pickable = isEnabled;
      }
    } );

    // make the unselected buttons pickable and have a pointer cursor
    var thisNode = this;
    property.link( function( value ) {
      if ( thisNode.enabledProperty.get() ) {
        for ( i = 0; i < contentArray.length; i++ ) {
          if ( contentArray[i].value === value ) {
            selectedNodes[i].pickable = false;
            selectedNodes[i].cursor = null;
          }
          else {
            deselectedNodes[i].pickable = true;
            deselectedNodes[i].cursor = 'pointer';
          }
        }
      }
    } );

    var boxOptions = { children: buttons, spacing: options.spacing };
    var box;
    if ( options.orientation === 'vertical' ) {
      box = new VBox( boxOptions );
    }
    else if ( options.orientation === 'horizontal' ) {
      box = new HBox( boxOptions );
    }
    else {
      throw new Error( 'options.orientation must be either horizontal or vertical' );
    }

    Node.call( this, { children: [box] } );

    this.mutate( options );
  }

  return inherit( Node, RadioButtonGroup,
    {

      set enabled( value ) {
        assert && assert( typeof value === 'boolean', 'RadioButtonGroup.enabled must be a boolean value' );
        this.enabledProperty.set( value );
      },

      get enabled() { return this.enabledProperty.get(); }

    } );
} );
