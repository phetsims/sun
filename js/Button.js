//Render a simple button
//TODO: Button.js is not ready for use in simulations, it will need further development & discussion first.
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var AccessibilityPeer = require( 'SCENERY/util/AccessibilityPeer' );

  /**
   * @param {Node} content
   * @param {function} callback
   * @param {object} options
   * @constructor
   */
  function Button( content, callback, options ) {

    var button = this;
    Node.call( this, options );

    // options
    options = options || {};
    button.cursor = 'pointer';
    var fill = options.fill || 'white';
    var stroke = options.stroke || 'black';
    var lineWidth = options.lineWidth || 1;
    //TODO default margins should be computed based on content dimensions
    var xMargin = options.xMargin || 5;
    var yMargin = options.yMargin || 5;
    var cornerRadius = 10;

    var path = new Rectangle( 0, 0, content.width + ( 2 * xMargin ), content.height + ( 2 * yMargin ), cornerRadius, cornerRadius,
                              {stroke: stroke, lineWidth: lineWidth, fill: fill } );
    button.addChild( path );
    content.centerX = path.width / 2;
    content.centerY = path.height / 2;
    button.addChild( content );
    button.addInputListener( {up: function() {callback();}} );

    button.accessibilityPeer = new AccessibilityPeer( button, '<input type="button">', {click: callback} );
  }

  inherit( Button, Node );

  return Button;
} );