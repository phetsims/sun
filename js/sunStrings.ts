// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import sun from './sun.js';

type StringsType = {
  'sun': {
    'title': string;
    'titleProperty': TReadOnlyProperty<string>;
  };
  'a11y': {
    'numberSpinnerRoleDescription': string;
    'numberSpinnerRoleDescriptionProperty': TReadOnlyProperty<string>;
    'close': string;
    'closeProperty': TReadOnlyProperty<string>;
    'closed': string;
    'closedProperty': TReadOnlyProperty<string>;
    'titleClosePattern': string;
    'titleClosePatternProperty': TReadOnlyProperty<string>;
  }
};

const sunStrings = getStringModule( 'SUN' ) as StringsType;

sun.register( 'sunStrings', sunStrings );

export default sunStrings;
