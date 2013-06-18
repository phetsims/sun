//Render a simple button
//TODO: Button.js is not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ButtonModel = require( 'SUN/ButtonModel' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );

  /**
   * @param {Node} content
   * @param {function} callback
   * @param {object} options
   * @constructor
   */
  function Button( content, callback, options ) {

    options = _.extend( {
        cursor: 'pointer',
        fill: 'white',
        stroke: 'black',
        lineWidth: 1,
        //TODO default margins should be computed based on content dimensions
        xMargin: 5,
        yMargin: 5,
        cornerRadius: 10
      },
      options );

    var button = this;
    Node.call( button, options );

    button.buttonModel = new ButtonModel();
    button.buttonModel.listeners.push( callback );

    var path = new Rectangle( 0, 0, content.width + ( 2 * options.xMargin ), content.height + ( 2 * options.yMargin ), options.cornerRadius, options.cornerRadius,
      {stroke: options.stroke, lineWidth: options.lineWidth, fill: options.fill } );
    button.addChild( path );
    content.centerX = path.width / 2;
    content.centerY = path.height / 2;
    button.addChild( content );
    button.addInputListener( new ButtonListener( {
      fire: function() {
        button.buttonModel.fireListeners();
      }
    } ) );

    button.addPeer( '<input type="button">', {click: button.buttonModel.fireListeners.bind( button.buttonModel )} );

    //Mutate with the options after the layout is complete so that you can use width-dependent fields like centerX, etc.
    //TODO: Does this remove the need to put options in the super call above?
    this.mutate( options );

    //TODO: Make it possible to enable/disable the content (if the content supports it)
    //TODO: gray out the border
    //TODO: Gray should be a bit brighter
    button.buttonModel.enabledProperty.link( function( enabled ) {
      path.fill = enabled ? options.fill : 'gray';
      path.stroke = enabled ? options.stroke : 'gray';
    } );
  }

  inherit( Node, Button, {
    addListener: function( listener ) {
      this.buttonModel.listeners.push( listener );
    },
    set enabled( enabled ) { this.buttonModel.enabled = enabled; },
    get enabled() { return this.buttonModel.enabled;}
  } );

  return Button;
} );
