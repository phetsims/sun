// Copyright 2020-2025, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
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
    'aBSwitch': {
      'accessibleNamePatternStringProperty': LocalizedStringProperty;
    };
    'radioButtonGroup': {
      'combinedNameResponseStringProperty': LocalizedStringProperty;
    };
    'carousel': {
      'accessibleRoleDescriptionStringProperty': LocalizedStringProperty;
      'page': {
        'accessibleNameStringProperty': LocalizedStringProperty;
      };
      'nextPreviousButtons': {
        'nextButton': {
          'accessibleNameStringProperty': LocalizedStringProperty;
        };
        'previousButton': {
          'accessibleNameStringProperty': LocalizedStringProperty;
        };
        'accessibleContextResponseStringProperty': LocalizedStringProperty;
      }
    };
    'pageControl': {
      'accessibleNameStringProperty': LocalizedStringProperty;
      'dotNode': {
        'accessibleNamePatternStringProperty': LocalizedStringProperty;
      }
    }
  }
};

const SunStrings = getStringModule( 'SUN' ) as StringsType;

sun.register( 'SunStrings', SunStrings );

export default SunStrings;
