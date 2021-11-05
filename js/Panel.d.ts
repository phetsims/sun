// Copyright 2021, University of Colorado Boulder

import Node from '../../scenery/js/nodes/Node.js';
import HeightSizable from '../../scenery/js/layout/HeightSizable.js';
import WidthSizable from '../../scenery/js/layout/WidthSizable.js';

declare class Panel extends WidthSizable( HeightSizable( Node ) ) {
  constructor( content: Node, options?: Object | undefined );
  disposePanel: () => void;
  set stroke( arg: any );
  get stroke(): any;
  set fill( arg: any );
  get fill(): any;
  /**
   * @public
   * @override
   */
  public override dispose(): void;
  public setStroke( stroke: any ): void;
  public getStroke(): any;
  public setFill( fill: any ): void;
  public getFill(): any;
}

export default Panel;
