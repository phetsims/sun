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
    Node.call( this, options );

    var path = new Rectangle( 0, 0, content.width + ( 2 * options.xMargin ), content.height + ( 2 * options.yMargin ), options.cornerRadius, options.cornerRadius,
                              {stroke: options.stroke, lineWidth: options.lineWidth, fill: options.fill } );
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