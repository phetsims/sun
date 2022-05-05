// Copyright 2016-2022, University of Colorado Boulder

/**
 * Query parameters for the sun demo application.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import sun from './sun.js';

const sunQueryParameters = QueryStringMachine.getAll( {

  // background color of the screens
  backgroundColor: {
    type: 'string', // CSS color format, e.g. 'green', 'ff8c00', 'rgb(255,0,255)'
    defaultValue: 'white'
  },

  // initial selection on the Components screen, values are the same as the labels on combo box items
  component: {
    type: 'string',
    defaultValue: null
  },

  // initial selection on the Layout screen, values are the same as the labels on combo box items
  layout: {
    type: 'string',
    defaultValue: 'Width of multiple panels'
  }
} );

sun.register( 'sunQueryParameters', sunQueryParameters );

export default sunQueryParameters;