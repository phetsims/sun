// Copyright 2020-2024, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
/* @formatter:off */
import getStringModule from '../../chipper/js/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/LocalizedStringProperty.js';
import sun from './sun.js';

type StringsType = {
  'sun': {
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'buttonsStringProperty': LocalizedStringProperty;
    'componentsStringProperty': LocalizedStringProperty;
    'dialogsStringProperty': LocalizedStringProperty;
  };
  'a11y': {
    'numberSpinnerRoleDescriptionStringProperty': LocalizedStringProperty;
    'closedStringProperty': LocalizedStringProperty;
    'titleClosePatternStringProperty': LocalizedStringProperty;
  }
};

const SunStrings = getStringModule( 'SUN' ) as StringsType;

sun.register( 'SunStrings', SunStrings );

export default SunStrings;
