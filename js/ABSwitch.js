// Copyright 2014-2020, University of Colorado Boulder

/**
 * Control for switching between 2 choices (A & B).
 * Choice 'A' is to the left of the switch, choice 'B' is to the right.
 * This decorates OnOffSwitch, the iOS-like on/off switch.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Dimension2 = require( 'DOT/Dimension2' );
  const InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  const Line = require( 'SCENERY/nodes/Line' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const OnOffSwitch = require( 'SUN/OnOffSwitch' );
  const PressListener = require( 'SCENERY/listeners/PressListener' );
  const Property = require( 'AXON/Property' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );

  // constants
  const DEFAULT_SIZE = new Dimension2( 60, 30 );

  // Uses opacity as the default method of indicating whether a {Node} label is {boolean} enabled.
  const DEFAULT_SET_ENABLED = ( label, enabled ) => {
    label.opacity = enabled ? 1.0 : 0.5;
  };

  class ABSwitch extends Node {

    /**
     * @param {Property.<*>} property stores the value of the current choice
     * @param {*} valueA value for choice 'A'
     * @param {Node} labelA label for choice 'A'
     * @param {*} valueB value for choice 'B'
     * @param {Node} labelB label for choice 'B'
     * @param {Object} [options]
     */
    constructor( property, valueA, labelA, valueB, labelB, options ) {

      // default option values
      options = merge( {
        switchSize: DEFAULT_SIZE,
        xSpacing: 8,
        cursor: 'pointer',
        centerOnButton: false,

        // {function( Node, boolean )} method of making the switch look disabled
        setEnabled: DEFAULT_SET_ENABLED,

        // pointer areas for thumb
        thumbTouchAreaXDilation: 8,
        thumbTouchAreaYDilation: 8,
        thumbMouseAreaXDilation: 0,
        thumbMouseAreaYDilation: 0,
        tandem: Tandem.REQUIRED
      }, options );

      const defaultTrackFill = new LinearGradient( 0, 0, 0, options.switchSize.height )
        .addColorStop( 0, 'rgb( 40, 40, 40 )' )
        .addColorStop( 1, 'rgb( 200, 200, 200 )' );
      options.trackFillA = options.trackFillA || defaultTrackFill;
      options.trackFillB = options.trackFillB || defaultTrackFill;
      options.thumbFill = options.thumbFill ||
                          new LinearGradient( 0, 0, 0, options.switchSize.height )
                            .addColorStop( 0, 'white' )
                            .addColorStop( 1, 'rgb( 200, 200, 200 )' );

      super();

      // property for adapting to OnOffSwitch. 'true' is 'B', the object on the 'on' end of the OnOffSwitch.
      const onProperty = new Property( valueB === property.get() );

      const onOffSwitch = new OnOffSwitch( onProperty, {
        size: options.switchSize,
        cursor: options.cursor,
        thumbFill: options.thumbFill,
        trackOnFill: options.trackFillB,
        trackOffFill: options.trackFillA,
        thumbTouchAreaXDilation: options.thumbTouchAreaXDilation,
        thumbTouchAreaYDilation: options.thumbTouchAreaYDilation,
        thumbMouseAreaXDilation: options.thumbMouseAreaXDilation,
        thumbMouseAreaYDilation: options.thumbMouseAreaYDilation,

        // not named 'onOffSwitch' by design, see https://github.com/phetsims/sun/issues/559#issuecomment-585982604
        tandem: options.tandem.createTandem( 'switch' )
      } );

      // rendering order
      this.addChild( onOffSwitch );
      this.addChild( labelA );
      this.addChild( labelB );

      // layout: 'A' on the left, 'B' on the right
      labelA.right = onOffSwitch.left - options.xSpacing;
      labelA.centerY = onOffSwitch.centerY;
      labelB.left = onOffSwitch.right + options.xSpacing;
      labelB.centerY = onOffSwitch.centerY;

      // add a horizontal strut that will cause the 'centerX' of this node to be at the center of the button
      if ( options.centerOnButton ) {
        const additionalWidth = Math.abs( labelA.width - labelB.width );
        const strut = new Line( 0, 0, this.width + additionalWidth, 0 );
        this.addChild( strut );
        strut.moveToBack();
        if ( labelA.width < labelB.width ) {
          strut.left = labelA.left - ( additionalWidth / 2 );
        }
        else {
          strut.left = labelA.left;
        }
      }

      // sync properties, listeners must be disposed
      const propertyListener = object => onProperty.set( valueB === object );
      property.link( propertyListener );

      const onPropertyListener = on => {
        property.set( on ? valueB : valueA );
        if ( options.setEnabled ) {
          options.setEnabled( labelA, !on );
          options.setEnabled( labelB, on );
        }
      };
      onProperty.link( onPropertyListener );

      // click on labels to select, must be disposed
      const aPressListener = new PressListener( {
        release: () => onProperty.set( false ),
        tandem: labelA.tandem.createTandem( 'pressListener' )
      } );

      const bPressListener = new PressListener( {
        release: () => onProperty.set( true ),
        tandem: labelB.tandem.createTandem( 'pressListener' )
      } );
      labelA.addInputListener( aPressListener );
      labelB.addInputListener( bPressListener );

      // @private - for dispose
      this.disposeABSwitch = () => {
        property.unlink( propertyListener );
        onProperty.unlink( onPropertyListener );
        onOffSwitch.dispose();
        labelA.removeInputListener( aPressListener );
        labelB.removeInputListener( bPressListener );
      };

      this.mutate( options );

      // support for binder documentation, stripped out in builds and only runs when ?binder is specified
      assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ABSwitch', this );
    }

    /**
     * Make eligible for garbage collection.
     * @public
     * @override
     */
    dispose() {
      this.disposeABSwitch();
      super.dispose();
    }
  }

  return sun.register( 'ABSwitch', ABSwitch );
} );