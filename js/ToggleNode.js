// Copyright 2013-2021, University of Colorado Boulder

/**
 * Display one of N nodes based on a given Property.  Maintains the bounds of the union of children for layout.
 * Supports null and undefined as possible values.  Will not work correctly if the children are changed externally
 * after instantiation (manages its own children and their visibility).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../phet-core/js/merge.js';
import Node from '../../scenery/js/nodes/Node.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

class ToggleNode extends Node {

  /**
   * @param {Property.<Object>} valueProperty
   * @param {Object[]} elements - each element has {value:{*}, node:{Node}}
   * @param {Object} [options]
   */
  constructor( valueProperty, elements, options ) {

    assert && assert( Array.isArray( elements ), 'elements should be an array' );
    if ( assert ) {
      elements.forEach( element => {
        const keys = _.keys( element );
        assert( keys.length === 2, 'each element should have two keys' );
        assert( keys[ 0 ] === 'value' || keys[ 1 ] === 'value', 'element should have a value key' );
        assert( element.node instanceof Node, 'element.node should be a node' );
      } );
    }

    options = merge( {

      // {function} determines the relative layout of element Nodes. See below for pre-defined layout.
      alignChildren: ToggleNode.CENTER,
      tandem: Tandem.OPTIONAL
    }, options );

    const valueListener = function( value ) {
      let matchCount = 0;
      for ( let i = 0; i < elements.length; i++ ) {
        const element = elements[ i ];
        const visible = element.value === value;
        element.node.visible = visible;
        if ( visible ) {
          matchCount++;
        }
      }
      assert && assert( matchCount === 1, `Wrong number of matches: ${matchCount}` );
    };
    valueProperty.link( valueListener );

    assert && assert( !options.children, 'ToggleNode sets children' );
    options.children = _.map( elements, 'node' );

    options.alignChildren( options.children );

    super( options );

    //TODO https://github.com/phetsims/sun/issues/420 delete this dead code or explain why it's commented out
    // this.addLinkedElement( valueProperty, {
    //   tandem: options.tandem.createTandem( 'valueProperty' )
    // } );

    // @private
    this.disposeToggleNode = function() {
      valueProperty.unlink( valueListener );
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeToggleNode();
    super.dispose();
  }

  /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the x,y center of the first node.
   * @param {Node[]} children
   * @public
   * @static
   */
  static CENTER( children ) {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].center = children[ 0 ].center;
    }
  }

  /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the x center of the first node.
   * @param {Node[]} children
   * @public
   * @static
   */
  static CENTER_X( children ) {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].centerX = children[ 0 ].centerX;
    }
  }

  /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the y center of the first node.
   * @param {Node[]} children
   * @public
   * @static
   */
  static CENTER_Y( children ) {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].centerY = children[ 0 ].centerY;
    }
  }

  /**
   * A value for the alignChildren option.
   * Left aligns nodes on the left of the first node.
   * @param {Node[]} children
   * @public
   * @static
   */
  static LEFT( children ) {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].left = children[ 0 ].left;
    }
  }

  /**
   * A value for the alignChildren option.
   * Aligns nodes on the bottom of the first node.
   * @param {Node[]} children
   * @public
   * @static
   */
  static BOTTOM( children ) {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].bottom = children[ 0 ].bottom;
    }
  }

  /**
   * A value for the alignChildren option.
   * Aligns nodes on the bottom of the first node.
   * @param {Node[]} children
   * @public
   * @static
   */
  static CENTER_BOTTOM( children ) {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].centerBottom = children[ 0 ].centerBottom;
    }
  }

  /**
   * A value for the alignChildren option.
   * Right aligns nodes on the right of the first node.
   * @param {Node[]} children
   * @public
   * @static
   */
  static RIGHT( children ) {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].right = children[ 0 ].right;
    }
  }

  /**
   * A value for the alignChildren option.
   * No alignment is performed.
   * @param {Node[]} children
   * @public
   * @static
   */
  static NONE( children ) {
  }
}

sun.register( 'ToggleNode', ToggleNode );
export default ToggleNode;