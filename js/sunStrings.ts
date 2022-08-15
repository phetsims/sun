// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import Property from '../../axon/js/Property.js';
import sun from './sun.js';

type StringsType = {
  'sun': {
    'title': string;
    'titleProperty': Property<string>;
  };
  'a11y': {
    'numberSpinnerRoleDescription': string;
    'numberSpinnerRoleDescriptionProperty': Property<string>;
    'close': string;
    'closeProperty': Property<string>;
    'closed': string;
    'closedProperty': Property<string>;
    'titleClosePattern': string;
    'titleClosePatternProperty': Property<string>;
  }
};

const sunStrings = getStringModule( 'SUN' ) as StringsType;

sun.register( 'sunStrings', sunStrings );

export default sunStrings;
