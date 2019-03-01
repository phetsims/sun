// Copyright 2014-2018, University of Colorado Boulder

/**
 * Control for switching between 2 choices (A & B).
 * Choice 'A' is to the left of the switch, choice 'B' is to the right.
 * This decorates OnOffProperty, the iOS-like on/off switch.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  var Line = require( 'SCENERY/nodes/Line' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var OnOffSwitch = require( 'SUN/OnOffSwitch' );
  var Property = require( 'AXON/Property' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Property.<*>} property stores the value of the current choice
   * @param {*} valueA value for choice 'A'
   * @param {Node} labelA label for choice 'A'
   * @param {*} valueB value for choice 'B'
   * @param {Node} labelB label for choice 'B'
   * @param {Object} [options]
   * @constructor
   */
  function ABSwitch( property, valueA, labelA, valueB, labelB, options ) {

    // default option values
    options = _.extend( {
      switchSize: new Dimension2( 60, 30 ),
      xSpacing: 8,
      cursor: 'pointer',
      centerOnButton: false,

      // uses opacity as the default method of indicating whether a {Node} label is {boolean} enabled
      setEnabled: function( label, enabled ) { label.opacity = enabled ? 1.0 : 0.5; },

      // pointer areas for thumb
      thumbTouchAreaXDilation: 8,
      thumbTouchAreaYDilation: 8,
      thumbMouseAreaXDilation: 0,
      thumbMouseAreaYDilation: 0,
      tandem: Tandem.required
    }, options );

    var defaultTrackFill = new LinearGradient( 0, 0, 0, options.switchSize.height ).addColorStop( 0, 'rgb(40,40,40)' ).addColorStop( 1, 'rgb(200,200,200)' );
    options.trackFillA = options.trackFillA || defaultTrackFill;
    options.trackFillB = options.trackFillB || defaultTrackFill;
    options.thumbFill = options.thumbFill ||
                        new LinearGradient( 0, 0, 0, options.switchSize.height ).addColorStop( 0, 'white' ).addColorStop( 1, 'rgb(200,200,200)' );

    Node.call( this );

    // property for adapting to OnOffSwitch. 'true' is 'B', the object on the 'on' end of the OnOffSwitch.
    var onProperty = new Property( valueB === property.get() );

    var onOffSwitch = new OnOffSwitch( onProperty, {
      size: options.switchSize,
      cursor: options.cursor,
      thumbFill: options.thumbFill,
      trackOnFill: options.trackFillB,
      trackOffFill: options.trackFillA,
      thumbTouchAreaXDilation: options.thumbTouchAreaXDilation,
      thumbTouchAreaYDilation: options.thumbTouchAreaYDilation,
      thumbMouseAreaXDilation: options.thumbMouseAreaXDilation,
      thumbMouseAreaYDilation: options.thumbMouseAreaYDilation,
      tandem: options.tandem.createTandem( 'onOffSwitch' )
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
      var additionalWidth = Math.abs( labelA.width - labelB.width );
      var strut = new Line( 0, 0, this.width + additionalWidth, 0 );
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
    var propertyListener = function( object ) {
      onProperty.set( valueB === object );
    };
    property.link( propertyListener );

    var onPropertyListener = function( on ) {
      property.set( on ? valueB : valueA );
      if ( options.setEnabled ) {
        options.setEnabled( labelA, !on );
        options.setEnabled( labelB, on );
      }
    };
    onProperty.link( onPropertyListener );

    // click on labels to select, must be disposed
    var aInputListener = new ButtonListener( {
      fire: function() { onProperty.set( false ); }
    } );
    var bInputListener = new ButtonListener( {
      fire: function() { onProperty.set( true ); }
    } );
    labelA.addInputListener( aInputListener );
    labelB.addInputListener( bInputListener );

    // @private - for dispose
    this.disposeABSwitch = function() {
      property.unlink( propertyListener );
      onProperty.unlink( onPropertyListener );
      labelA.removeInputListener( aInputListener );
      labelB.removeInputListener( bInputListener );
    };

    this.mutate( options );


    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ABSwitch', this );
  }

  sun.register( 'ABSwitch', ABSwitch );

  return inherit( Node, ABSwitch, {

    /**
     * Make eligible for garbage collection.
     * @public
     */
    dispose: function() {
      this.disposeABSwitch();
      Node.prototype.dispose.call( this );
    }
  } );
} );