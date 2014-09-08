// Copyright 2002-2014, University of Colorado Boulder

/**
 * Radio buttons.
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var RadioButton = require( 'SUN/RadioButton' );
  var Color = require( 'SCENERY/util/Color' );

  // constants
  var DEFAULT_COLOR = new Color( 153, 206, 255 );

  // this var is needed in this scope for the require return statement
  var alignVertically = false;

  /**
   * @param {Property} property
   * @param {Array<Node>} content an array of nodes that will be the content for each radio button
   * @param {Array<*>} values an array of values that enumerates all possible values for the property
   * @param {Object} options
   * @constructor
   */
  function RadioButtons( property, content, values, options ) {

    // the number of buttons must match the number of property values
    assert && assert( content.length === values.length );

    options = _.extend( {
      baseColor: DEFAULT_COLOR,
      stroke: null,
      selectedLineWidth: 0,
      deselectedLineWidth: 0,
      spacing: 10,
      contentXMargin: 5,
      contentYMargin: 5,
      alignVertically: false,
      cornerRadius: 4,
      deselectedOpacity: 1,
      selectedButtonAppearanceStrategy: RectangularButtonView.flatAppearanceStrategy,
      deselectedButtonAppearanceStrategy: RectangularButtonView.threeDAppearanceStrategy,
      contentAppearanceStrategy: RectangularButtonView.fadeContentWhenDisabled
    }, options );

    alignVertically = options.alignVertically;

    // options for the panels that house each radio button
    var panelOptions = {
      xMargin: options.contentXMargin,
      yMargin: options.contentYMargin,
      cornerRadius: options.cornerRadius,
      baseColor: options.baseColor,
      stroke: options.stroke,
      contentAppearanceStrategy: options.contentAppearanceStrategy
    };

    // add extra for selected vs deselcted panels
    var selectedOptions = _.extend( { lineWidth: options.selectedLineWidth, buttonAppearanceStrategy: options.selectedButtonAppearanceStrategy }, panelOptions );
    var deselectedOptions = _.extend( { lineWidth: options.deselectedLineWidth, opacity: options.deselectedOpacity, buttonAppearanceStrategy: options.deselectedButtonAppearanceStrategy }, panelOptions );

    // calculate the maximum width and height of the content so we can make all radio buttons the same size
    var maxWidth = 0, maxHeight = 0, i;
    for ( i = 0; i < content.length; i++ ) {
      if ( content[i].width > maxWidth ) {
        maxWidth = content[i].width;
      }
      if ( content[i].height > maxHeight ) {
        maxHeight = content[i].height;
      }
    }

    var buttons = [];
    var selectedNodes = [];
    var deselectedNodes = [];
    for ( i = 0; i < content.length; i++ ) {
      // make sure all radio buttons are the same size
      selectedOptions.xMargin = ( ( maxWidth - content[i].width ) / 2 ) + options.contentXMargin;
      selectedOptions.yMargin = ( ( maxHeight - content[i].height ) / 2 ) + options.contentYMargin;
      deselectedOptions.xMargin = ( ( maxWidth - content[i].width ) / 2 ) + options.contentXMargin;
      deselectedOptions.yMargin = ( ( maxHeight - content[i].height ) / 2 ) + options.contentYMargin;

      selectedNodes.push( new RectangularPushButton( _.extend( { content: content[i] }, selectedOptions ) ) );
      deselectedNodes.push( new RectangularPushButton( _.extend( { content: content[i] }, deselectedOptions ) ) );
      buttons.push( new RadioButton( property, values[i], selectedNodes[i], deselectedNodes[i], { cursor: null } ) );
    }

    // make the unselected buttons pickable and have a pointer cursor
    property.link( function( value ) {
      var index = values.indexOf( value );
      selectedNodes[index].pickable = false;
      selectedNodes[index].cursor = null;
      // selectedNodes[index].enabled = false;
      for ( var j = 0; j < values.length; j++ ) {
        if ( j !== index ) {
          deselectedNodes[j].pickable = true;
          deselectedNodes[j].cursor = 'pointer';
          // deselectedNodes[j].enabled = true;
        }
      }
    } );

    var boxOptions = { children: buttons, spacing: options.spacing };

    ( options.alignVertically ) ? VBox.call( this, boxOptions ) : HBox.call( this, boxOptions );

    this.mutate( options );
  }

  return ( alignVertically ) ? inherit( VBox, RadioButtons ) : inherit( HBox, RadioButtons );
} );
