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
    'titleStringProperty': LinkableProperty<string>;
  };
  'a11y': {
    'numberSpinnerRoleDescriptionStringProperty': LinkableProperty<string>;
    'closeStringProperty': LinkableProperty<string>;
    'closedStringProperty': LinkableProperty<string>;
    'titleClosePatternStringProperty': LinkableProperty<string>;
  }
};

const SunStrings = getStringModule( 'SUN' ) as StringsType;

sun.register( 'SunStrings', SunStrings );

export default SunStrings;
