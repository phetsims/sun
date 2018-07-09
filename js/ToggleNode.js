// Copyright 2018, University of Colorado Boulder

/**
 * Display one of N nodes based on a given Property.  Maintains the bounds of the union of children for layout.
 * Supports null and undefined as possible values.  Will not work correctly if the children are changed externally
 * after instantiation (manages its own children and their visibility).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {Object[]} elements - Array of {value:{Object}, node:{Node}}
   * @param {Property.<Object>} valueProperty
   * @param {Object} [options]
   * @constructor
   */
  function ToggleNode( elements, valueProperty, options ) {

    assert && assert( Array.isArray( elements ), 'elements should be an array' );
    if ( assert ) {
      elements.forEach( function( element ) {
        var keys = _.keys( element );
        assert( keys.length === 2, 'each element should have two keys' );
        assert( keys[ 0 ] === 'value' || keys[ 1 ] === 'value', 'element should have a value key' );
        assert( element.node instanceof Node, 'element.node should be a node' );
      } );
    }

    options = _.extend( {

      // By default, line up the centers of all nodes with the center of the first node (horizontally and vertically)
      alignChildren: ToggleNode.CENTER
    }, options );

    var valueChangeListener = function( value ) {
      var matchCount = 0;
      for ( var i = 0; i < elements.length; i++ ) {
        var element = elements[ i ];
        var visible = element.value === value;
        element.node.visible = visible;
        if ( visible ) {
          matchCount++;
        }
      }
      assert && assert( matchCount === 1, 'Wrong number of matches: ' + matchCount );
    };
    valueProperty.link( valueChangeListener );

    options.children = _.map( elements, 'node' );
    options.alignChildren( options.children );
    Node.call( this, options );

    // @private
    this.disposeToggleNode = function() {
      valueProperty.unlink( valueChangeListener );
    };
  }

  sun.register( 'ToggleNode', ToggleNode );

  return inherit( Node, ToggleNode, {

    /**
     * Make eligible for garbage collection.
     * @public
     */
    dispose: function() {
      this.disposeToggleNode();
      Node.prototype.dispose.call( this );
    }
  }, {

    /**
     * Center the latter nodes on the x center of the first node.
     * @param {Node[]} children
     * @public
     * @static
     */
    HORIZONTAL: function( children ) {
      for ( var i = 1; i < children.length; i++ ) {
        children[ i ].centerX = children[ 0 ].centerX;
      }
    },

    /**
     * Center the latter nodes on the x center of the first node.
     * @param {Node[]} children
     * @public
     * @static
     */
    LEFT: function( children ) {
      for ( var i = 1; i < children.length; i++ ) {
        children[ i ].left = children[ 0 ].left;
      }
    },

    /**
     * Center the latter nodes on the y center of the first node.
     * @param {Node[]} children
     * @public
     * @static
     */
    VERTICAL: function( children ) {
      for ( var i = 1; i < children.length; i++ ) {
        children[ i ].centerY = children[ 0 ].centerY;
      }
    },

    /**
     * Center the latter nodes on the x,y center of the first node.
     * @param {Node[]} children
     * @public
     * @static
     */
    CENTER: function( children ) {
      for ( var i = 1; i < children.length; i++ ) {
        children[ i ].center = children[ 0 ].center;
      }
    }
  } );
} );