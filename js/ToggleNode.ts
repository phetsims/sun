// Copyright 2013-2022, University of Colorado Boulder

/**
 * Display one of N nodes based on a given Property.  Maintains the bounds of the union of children for layout.
 * Supports null and undefined as possible values.  Will not work correctly if the children are changed externally
 * after instantiation (manages its own children and their visibility).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import IProperty from '../../axon/js/IProperty.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, NodeOptions } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';

export type ToggleNodeElement<T> = {
  value: T;  // a value
  node: Node; // the Node associated with the value, to be shown by the ToggleNode
}

type SelfOptions = {

  // {function} determines the relative layout of element Nodes. See below for pre-defined layout.
  alignChildren?: ( children: Node[] ) => void;
};

export type ToggleNodeOptions = SelfOptions & NodeOptions;

export default class ToggleNode<T> extends Node {

  private readonly disposeToggleNode: () => void;

  constructor( valueProperty: IProperty<T>, elements: ToggleNodeElement<T>[], providedOptions?: ToggleNodeOptions ) {

    assert && assert( Array.isArray( elements ), 'elements should be an array' );
    if ( assert ) {
      elements.forEach( element => {
        const keys = _.keys( element );
        assert && assert( keys.length === 2, 'each element should have two keys' );
        assert && assert( keys[ 0 ] === 'value' || keys[ 1 ] === 'value', 'element should have a value key' );
      } );
    }

    const options = optionize<ToggleNodeOptions, SelfOptions, NodeOptions>( {

      // SelfOptions
      alignChildren: ToggleNode.CENTER,

      // NodeOptions
      tandem: Tandem.OPTIONAL
    }, providedOptions );

    const valueListener = ( value: T ) => {
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

  public override dispose(): void {
    this.disposeToggleNode();
    super.dispose();
  }

  /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the x,y center of the first node.
   */
  public static CENTER( children: Node[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].center = children[ 0 ].center;
    }
  }

  /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the x center of the first node.
   */
  public static CENTER_X( children: Node[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].centerX = children[ 0 ].centerX;
    }
  }

  /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the y center of the first node.
   */
  public static CENTER_Y( children: Node[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].centerY = children[ 0 ].centerY;
    }
  }

  /**
   * A value for the alignChildren option.
   * Left aligns nodes on the left of the first node.
   */
  public static LEFT( children: Node[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].left = children[ 0 ].left;
    }
  }

  /**
   * A value for the alignChildren option.
   * Aligns nodes on the bottom of the first node.
   */
  public static BOTTOM( children: Node[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].bottom = children[ 0 ].bottom;
    }
  }

  /**
   * A value for the alignChildren option.
   * Aligns nodes on the bottom of the first node.
   */
  public static CENTER_BOTTOM( children: Node[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].centerBottom = children[ 0 ].centerBottom;
    }
  }

  /**
   * A value for the alignChildren option.
   * Right aligns nodes on the right of the first node.
   */
  public static RIGHT( children: Node[] ): void {
    for ( let i = 1; i < children.length; i++ ) {
      children[ i ].right = children[ 0 ].right;
    }
  }

  /**
   * A value for the alignChildren option.
   * No alignment is performed.
   */
  public static NONE( children: Node[] ): void {}
}

sun.register( 'ToggleNode', ToggleNode );
