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

  /**
   * @param {Property} property
   * @param {Array<Object>} content an array of objects that have two keys each: value and node
                                    the node key holds a scenery Node that is the content for a given radio button.
                                    the value key should hold the value that the property takes on for the corrosponding
                                    node to be selected.
   * @param {Object} options
   * @constructor
   */
  function RadioButtons( property, content, options ) {

    // make sure every object in the content array has properties 'node' and 'value'
    assert && assert( _.every( content, function( obj ) {
      return obj.hasOwnProperty( 'node' ) && obj.hasOwnProperty( 'value' );
    } ) );

    options = _.extend( {
      baseColor: new Color( 153, 206, 255 ),
      disabledBaseColor: new Color( 220, 220, 220 ),
      selectedStroke: 'black',
      deselectedStroke: 'rgb(50,50,50)',
      selectedLineWidth: 1.5,
      deselectedLineWidth: 1,
      spacing: 10,
      contentXMargin: 5,
      contentYMargin: 5,
      alignVertically: false,
      cornerRadius: 4,
      deselectedOpacity: 0.6,
      enabledProperty: new Property( true ), // whether or not the set of radio buttons as a whole is enabled
      selectedButtonAppearanceStrategy: RadioButtonsAppearance.flatAppearanceStrategyWithBorder,
      deselectedButtonAppearanceStrategy: RadioButtonsAppearance.flatAppearanceStrategyDeselected,
      contentAppearanceStrategy: RectangularButtonView.fadeContentWhenDisabled
    }, options );

    // options for the panels that house each radio button
    var panelOptions = {
      xMargin: options.contentXMargin,
      yMargin: options.contentYMargin,
      cornerRadius: options.cornerRadius,
      baseColor: options.baseColor,
      disabledBaseColor: options.disabledBaseColor,
      contentAppearanceStrategy: options.contentAppearanceStrategy
    };

    // add extra for selected vs deselcted panels
    var selectedOptions = _.extend(
      {
        stroke: options.selectedStroke,
        lineWidth: options.selectedLineWidth,
        buttonAppearanceStrategy: options.selectedButtonAppearanceStrategy
      }, panelOptions );

    var deselectedOptions = _.extend(
      {
        stroke: options.deselectedStroke,
        lineWidth: options.deselectedLineWidth,
        opacity: options.deselectedOpacity,
        buttonAppearanceStrategy: options.deselectedButtonAppearanceStrategy
      }, panelOptions );

    // calculate the maximum width and height of the content so we can make all radio buttons the same size
    var maxWidth = _.max( content, function( obj ) { return obj.node.width; } ).node.width;
    var maxHeight = _.max( content, function( obj ) { return obj.node.height; } ).node.height;

    var buttons = [];
    var selectedNodes = [];
    var deselectedNodes = [];
    for ( var i = 0; i < content.length; i++ ) {
      // make sure all radio buttons are the same size
      selectedOptions.xMargin = ( ( maxWidth - content[i].node.width ) / 2 ) + options.contentXMargin;
      selectedOptions.yMargin = ( ( maxHeight - content[i].node.height ) / 2 ) + options.contentYMargin;
      deselectedOptions.xMargin = ( ( maxWidth - content[i].node.width ) / 2 ) + options.contentXMargin;
      deselectedOptions.yMargin = ( ( maxHeight - content[i].node.height ) / 2 ) + options.contentYMargin;

      selectedNodes.push( new RectangularPushButton( _.extend( { content: content[i].node }, selectedOptions ) ) );
      deselectedNodes.push( new RectangularPushButton( _.extend( { content: content[i].node }, deselectedOptions ) ) );
      buttons.push( new RadioButton( property, content[i].value, selectedNodes[i], deselectedNodes[i], { cursor: null } ) );
    }

    this.enabledProperty = options.enabledProperty;
    this.enabledProperty.link( function( isEnabled ) {
      for ( i = 0; i < content.length; i++ ) {
        selectedNodes[i].enabled = isEnabled;
        deselectedNodes[i].enabled = isEnabled;
        buttons[i].pickable = isEnabled;
      }
    } );

    // make the unselected buttons pickable and have a pointer cursor
    var thisNode = this;
    property.link( function( value ) {
      if ( thisNode.enabledProperty.get() ) {
        for ( i = 0; i < content.length; i++ ) {
          if ( content[i].value === value ) {
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
    var box = ( options.alignVertically ) ? new VBox( boxOptions ) : new HBox( boxOptions );

    Node.call( this, { children: [box] } );

    this.mutate( options );
  }

  return inherit( Node, RadioButtons,
    {

      set enabled( value ) {
        assert && assert( typeof value === 'boolean', 'RadioButtons.enabled must be a boolean value' );
        this.enabledProperty.set( value );
      },

      get enabled() { return this.enabledProperty.get(); }

    } );
} );
