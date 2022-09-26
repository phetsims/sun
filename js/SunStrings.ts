// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import sun from './sun.js';

type StringsType = {
  'sun': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'a11y': {
    'numberSpinnerRoleDescription': string;
    'numberSpinnerRoleDescriptionStringProperty': LinkableProperty<string>;
    'close': string;
    'closeStringProperty': LinkableProperty<string>;
    'closed': string;
    'closedStringProperty': LinkableProperty<string>;
    'titleClosePattern': string;
    'titleClosePatternStringProperty': LinkableProperty<string>;
  }
};

const SunStrings = getStringModule( 'SUN' ) as StringsType;

sun.register( 'SunStrings', SunStrings );

export default SunStrings;
