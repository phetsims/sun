// Copyright 2013-2020, University of Colorado Boulder

/**
 * Slider, with support for horizontal and vertical orientations. By default, the slider is constructed in the
 * horizontal orientation, then adjusted if the vertical orientation was specified.
 *
 * Note: This type was originally named HSlider, renamed in https://github.com/phetsims/sun/issues/380.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Property from '../../axon/js/Property.js';
import PropertyIO from '../../axon/js/PropertyIO.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import RangeIO from '../../dot/js/RangeIO.js';
import Utils from '../../dot/js/Utils.js';
import Shape from '../../kite/js/Shape.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import FocusHighlightFromNode from '../../scenery/js/accessibility/FocusHighlightFromNode.js';
import SimpleDragHandler from '../../scenery/js/input/SimpleDragHandler.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import AccessibleSlider from './accessibility/AccessibleSlider.js';
import DefaultSliderTrack from './DefaultSliderTrack.js';
import SliderIO from './SliderIO.js';
import SliderThumb from './SliderThumb.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';

// constants
const VERTICAL_ROTATION = -Math.PI / 2;

/**
 * @param {Property.<number>} valueProperty
 * @param {Range} range
 * @param {Object} [options]
 * @mixes AccessibleSlider
 * @constructor
 */
function Slider( valueProperty, range, options ) {

  const self = this;

  // Guard against mutually exclusive options before defaults are filled in.
  assert && assertMutuallyExclusiveOptions( options, [ 'thumbNode' ], [
    'thumbSize', 'thumbFill', 'thumbFillHighlighted', 'thumbStroke', 'thumbLineWidth', 'thumbCenterLineStroke',
    'thumbTouchAreaXDilation', 'thumbTouchAreaYDilation', 'thumbMouseAreaXDilation', 'thumbMouseAreaYDilation'
  ] );

  assert && assertMutuallyExclusiveOptions( options, [ 'trackNode' ], [
    'trackSize', 'trackFillEnabled', 'trackFillDisabled', 'trackStroke', 'trackLineWidth', 'trackCornerRadius' ] );

  options = merge( {

    orientation: 'horizontal', // 'horizontal'|'vertical'

    // {SliderTrack} optional track, replaces the default.
    // Client is responsible for highlighting, disable and pointer areas.
    trackNode: null,

    // track - options to create a SliderTrack if trackNode not supplied
    trackSize: new Dimension2( 100, 5 ),
    trackFillEnabled: 'white',
    trackFillDisabled: 'gray',
    trackStroke: 'black',
    trackLineWidth: 1,
    trackCornerRadius: 0,

    // {Node} optional thumb, replaces the default.
    // Client is responsible for highlighting, disabling and pointer areas.
    // The thumb is positioned based on its center and hence can have its origin anywhere
    thumbNode: null,

    // Options for the default thumb, ignored if thumbNode is set
    thumbSize: new Dimension2( 17, 34 ),
    thumbFill: 'rgb(50,145,184)',
    thumbFillHighlighted: 'rgb(71,207,255)',
    thumbStroke: 'black',
    thumbLineWidth: 1,
    thumbCenterLineStroke: 'white',
    thumbTouchAreaXDilation: 11,
    thumbTouchAreaYDilation: 11,
    thumbMouseAreaXDilation: 0,
    thumbMouseAreaYDilation: 0,

    // Applied to default or supplied thumb
    thumbYOffset: 0, // center of the thumb is vertically offset by this amount from the center of the track

    // ticks - if adding an option here, make sure it ends up in this.tickOptions
    tickLabelSpacing: 6,
    majorTickLength: 25,
    majorTickStroke: 'black',
    majorTickLineWidth: 1,
    minorTickLength: 10,
    minorTickStroke: 'black',
    minorTickLineWidth: 1,

    // other
    cursor: 'pointer',
    startDrag: _.noop, // called when a drag sequence starts
    drag: _.noop, // called at the beginning of a drag event, before any other drag work happens
    endDrag: _.noop, // called when a drag sequence ends
    constrainValue: _.identity, // called before valueProperty is set

    enabledProperty: null, // {BooleanProperty|null} determines whether this Slider is enabled
    enabledPropertyOptions: null, // {Object|null} options applied to the default enabledProperty
    enabledRangeProperty: null, // {Property.<Range>|null} determine the portion of range that is enabled
    disabledOpacity: SunConstants.DISABLED_OPACITY, // opacity applied to the entire Slider when disabled

    // phet-io
    tandem: Tandem.REQUIRED,
    phetioType: SliderIO,
    phetioComponentOptions: null, // filled in below with PhetioObject.mergePhetioComponentOptions()

    // {Property.<number>|null} - if provided, create a LinkedElement for this PhET-iO instrumented Property, instead
    // of using the passed in Property. This option was created to support passing DynamicProperty or "wrapping"
    // Property that are "implementation  details" to the PhET-iO API, and still support having a LinkedElement that
    // points to the underlying model Property.
    phetioLinkedProperty: null
  }, options );

  assert && assert( range instanceof Range, 'range must be of type Range:' + range );
  assert && assert( options.orientation === 'horizontal' || options.orientation === 'vertical',
    'invalid orientation: ' + options.orientation );
  assert && assert( !( options.enabledProperty && options.enabledPropertyOptions ),
    'enabledProperty and enabledPropertyOptions are mutually exclusive' );

  PhetioObject.mergePhetioComponentOptions( {
    visibleProperty: { phetioFeatured: true }
  }, options );

  this.orientation = options.orientation; // @private

  Node.call( this );

  const ownsEnabledProperty = !options.enabledProperty;
  const ownsEnabledRangeProperty = !options.enabledRangeProperty;

  if ( assert && Tandem.PHET_IO_ENABLED && !ownsEnabledProperty ) {
    this.isPhetioInstrumented() && assert( options.enabledProperty.isPhetioInstrumented(),
      'enabledProperty must be instrumented if slider is' );

    // This may be too strict long term, but for now, each enabledProperty should be phetioFeatured
    assert( options.enabledProperty.phetioFeatured,
      'provided enabledProperty must be phetioFeatured' );
  }

  // phet-io, Assign default options that need tandems.
  options.enabledProperty = options.enabledProperty || new BooleanProperty( true, merge( {
    tandem: options.tandem.createTandem( 'enabledProperty' ),
    phetioFeatured: true
  }, options.enabledPropertyOptions ) );

  // controls the portion of the slider that is enabled
  options.enabledRangeProperty = options.enabledRangeProperty || new Property( range, {
    valueType: Range,
    isValidValue: value => ( value.min >= range.min && value.max <= range.max ),
    tandem: options.tandem.createTandem( 'enabledRangeProperty' ),
    phetioType: PropertyIO( RangeIO ),
    phetioDocumentation: 'Sliders support two ranges: the outer range which specifies the min and max of the track and ' +
                         'the enabledRangeProperty, which determines how low and high the thumb can be dragged within the track.'
  } );

  // @public
  this.enabledProperty = options.enabledProperty;
  this.enabledRangeProperty = options.enabledRangeProperty;

  // @private options needed by prototype functions that add ticks
  this.tickOptions = _.pick( options, 'tickLabelSpacing',
    'majorTickLength', 'majorTickStroke', 'majorTickLineWidth',
    'minorTickLength', 'minorTickStroke', 'minorTickLineWidth' );

  const sliderParts = [];

  // @private ticks are added to these parents, so they are behind the knob
  this.majorTicksParent = new Node();
  this.minorTicksParent = new Node();
  sliderParts.push( this.majorTicksParent );
  sliderParts.push( this.minorTicksParent );

  // @private track
  this.track = options.trackNode || new DefaultSliderTrack( valueProperty, range, {

    // propagate options that are specific to SliderTrack
    size: options.trackSize,
    fillEnabled: options.trackFillEnabled,
    fillDisabled: options.trackFillDisabled,
    stroke: options.trackStroke,
    lineWidth: options.trackLineWidth,
    cornerRadius: options.trackCornerRadius,
    startDrag: options.startDrag,
    drag: options.drag,
    endDrag: options.endDrag,
    constrainValue: options.constrainValue,
    enabledRangeProperty: this.enabledRangeProperty,

    // phet-io
    tandem: options.tandem.createTandem( 'track' )
  } );

  // Position the track horizontally
  this.track.centerX = this.track.valueToPosition( ( range.max + range.min ) / 2 );

  // The thumb of the slider
  const thumb = options.thumbNode || new SliderThumb( {

    // propagate options that are specific to SliderThumb
    size: options.thumbSize,
    fill: options.thumbFill,
    fillHighlighted: options.thumbFillHighlighted,
    stroke: options.thumbStroke,
    lineWidth: options.thumbLineWidth,
    centerLineStroke: options.thumbCenterLineStroke,
    tandem: options.tandem.createTandem( 'thumb' )
  } );

  // Dilate the local bounds horizontally so that it extends beyond where the thumb can reach.  This prevents layout
  // asymmetry when the slider thumb is off the edges of the track.  See https://github.com/phetsims/sun/issues/282
  this.track.localBounds = this.track.localBounds.dilatedX( thumb.width / 2 );

  // Add the track
  sliderParts.push( this.track );

  // Position the thumb vertically.
  thumb.setCenterY( this.track.centerY + options.thumbYOffset );

  sliderParts.push( thumb );

  // Wrap all of the slider parts in a Node, and set the orientation of that Node.
  // This allows us to still decorate the Slider with additional children.
  // See https://github.com/phetsims/sun/issues/406
  const sliderPartsNode = new Node( { children: sliderParts } );
  if ( options.orientation === 'vertical' ) {
    sliderPartsNode.rotation = VERTICAL_ROTATION;
  }
  this.addChild( sliderPartsNode );

  // touchArea for the default thumb. If a custom thumb is provided, the client is responsible for its touchArea.
  if ( !options.thumbNode && ( options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation ) ) {
    thumb.touchArea = thumb.localBounds.dilatedXY( options.thumbTouchAreaXDilation, options.thumbTouchAreaYDilation );
  }

  // mouseArea for the default thumb. If a custom thumb is provided, the client is responsible for its mouseArea.
  if ( !options.thumbNode && ( options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation ) ) {
    thumb.mouseArea = thumb.localBounds.dilatedXY( options.thumbMouseAreaXDilation, options.thumbMouseAreaYDilation );
  }

  // update value when thumb is dragged
  let clickXOffset = 0; // x-offset between initial click and thumb's origin
  const thumbInputListener = new SimpleDragHandler( {

    tandem: options.tandem.createTandem( 'thumbInputListener' ),

    allowTouchSnag: true,
    attach: true,

    start: function( event, trail ) {
      if ( self.enabledProperty.get() ) {
        options.startDrag( event );
        const transform = trail.subtrailTo( sliderPartsNode ).getTransform();

        // Determine the offset relative to the center of the thumb
        clickXOffset = transform.inversePosition2( event.pointer.point ).x - thumb.centerX;
      }
    },

    drag: function( event, trail ) {
      if ( self.enabledProperty.get() ) {
        options.drag( event );
        const transform = trail.subtrailTo( sliderPartsNode ).getTransform(); // we only want the transform to our parent
        const x = transform.inversePosition2( event.pointer.point ).x - clickXOffset;
        const newValue = self.track.valueToPosition.inverse( x );
        const valueInRange = self.enabledRangeProperty.get().constrainValue( newValue );

        valueProperty.set( options.constrainValue( valueInRange ) );
      }
    },

    end: function( event ) {
      if ( self.enabledProperty.get() ) {
        options.endDrag( event );
      }
    }
  } );
  thumb.addInputListener( thumbInputListener );

  // enable/disable
  const enabledObserver = function( enabled ) {
    self.interruptSubtreeInput();
    self.pickable = enabled;
    self.cursor = enabled ? options.cursor : 'default';
    self.opacity = enabled ? 1 : options.disabledOpacity;
  };
  this.enabledProperty.link( enabledObserver ); // must be unlinked in disposeSlider

  // update thumb location when value changes
  const valueObserver = function( value ) {
    thumb.centerX = self.track.valueToPosition( value );
  };
  valueProperty.link( valueObserver ); // must be unlinked in disposeSlider

  // when the enabled range changes, the value to position linear function must change as well
  const enabledRangeObserver = function( enabledRange ) {

    // clamp the value to the enabled range if it changes
    valueProperty.set( Utils.clamp( valueProperty.value, enabledRange.min, enabledRange.max ) );
  };
  this.enabledRangeProperty.link( enabledRangeObserver ); // needs to be unlinked in dispose function

  this.mutate( options );

  // @private Called by dispose
  this.disposeSlider = function() {
    thumb.dispose && thumb.dispose(); // in case a custom thumb is provided via options.thumbNode that doesn't implement dispose
    self.track.dispose();

    self.disposeAccessibleSlider();

    valueProperty.unlink( valueObserver );
    ownsEnabledRangeProperty && self.enabledRangeProperty.dispose();
    ownsEnabledProperty && self.enabledProperty.dispose();
    thumbInputListener.dispose();
  };

  // a11y - custom focus highlight that surrounds and moves with the thumb
  this.focusHighlight = new FocusHighlightFromNode( thumb );

  assert && assert( !options.ariaOrientation, 'Slider sets its own ariaOrientation' );

  this.initializeAccessibleSlider( valueProperty, this.enabledRangeProperty, this.enabledProperty,
    merge( { ariaOrientation: options.orientation }, options ) );

  assert && Tandem.PHET_IO_ENABLED && assert( !options.phetioLinkedProperty || options.phetioLinkedProperty.isPhetioInstrumented(),
    'If provided, phetioLinkedProperty should be PhET-iO instrumented' );

  this.addLinkedElement( options.phetioLinkedProperty || valueProperty, {
    tandem: options.tandem.createTandem( 'valueProperty' )
  } );

  // support for binder documentation, stripped out in builds and only runs when ?binder is specified
  assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Slider', this );
}

sun.register( 'Slider', Slider );

inherit( Node, Slider, {

  // @public - ensures that this object is eligible for GC
  dispose: function() {
    this.disposeSlider();
    Node.prototype.dispose.call( this );
  },

  /**
   * Adds a major tick mark.
   * @param {number} value
   * @param {Node} [label] optional
   * @public
   */
  addMajorTick: function( value, label ) {
    this.addTick( this.majorTicksParent, value, label,
      this.tickOptions.majorTickLength, this.tickOptions.majorTickStroke, this.tickOptions.majorTickLineWidth );
  },

  /**
   * Adds a minor tick mark.
   * @param {number} value
   * @param {Node} [label] optional
   * @public
   */
  addMinorTick: function( value, label ) {
    this.addTick( this.minorTicksParent, value, label,
      this.tickOptions.minorTickLength, this.tickOptions.minorTickStroke, this.tickOptions.minorTickLineWidth );
  },

  /*
   * Adds a tick mark above the track.
   * @param {Node} parent
   * @param {number} value
   * @param {Node} [label] optional
   * @param {number} length
   * @param {number} stroke
   * @param {number} lineWidth
   * @private
   */
  addTick: function( parent, value, label, length, stroke, lineWidth ) {
    const labelX = this.track.valueToPosition( value );

    // ticks
    const tick = new Path( new Shape()
        .moveTo( labelX, this.track.top )
        .lineTo( labelX, this.track.top - length ),
      { stroke: stroke, lineWidth: lineWidth } );
    parent.addChild( tick );

    // label
    if ( label ) {

      // For a vertical slider, rotate labels opposite the rotation of the slider, so that they appear as expected.
      if ( this.orientation === 'vertical' ) {
        label.rotation = -VERTICAL_ROTATION;
      }
      parent.addChild( label );
      label.centerX = tick.centerX;
      label.bottom = tick.top - this.tickOptions.tickLabelSpacing;
      label.pickable = false;
    }
  },

  // @public
  setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
  set enabled( value ) { this.setEnabled( value ); },

  // @public
  getEnabled: function() { return this.enabledProperty.value; },
  get enabled() { return this.getEnabled(); },

  // @public
  setEnabledRange: function( enabledRange ) { this.enabledRangeProperty.value = enabledRange; },
  set enabledRange( range ) { this.setEnabledRange( range ); },

  // @public
  getEnabledRange: function() { return this.enabledRangeProperty.value; },
  get enabledRange() { return this.getEnabledRange(); },

  // @public - Sets visibility of major ticks.
  setMajorTicksVisible: function( visible ) {
    this.majorTicksParent.visible = visible;
  },
  set majorTicksVisible( value ) { this.setMajorTicksVisible( value ); },

  // @public - Gets visibility of major ticks.
  getMajorTicksVisible: function() {
    return this.majorTicksParent.visible;
  },
  get majorTicksVisible() { return this.getMajorTicksVisible(); },

  // @public - Sets visibility of minor ticks.
  setMinorTicksVisible: function( visible ) {
    this.minorTicksParent.visible = visible;
  },
  set minorTicksVisible( value ) { this.setMinorTicksVisible( value ); },

  // @public - Gets visibility of minor ticks.
  getMinorTicksVisible: function() {
    return this.minorTicksParent.visible;
  },
  get minorTicksVisible() { return this.getMinorTicksVisible(); }
} );

// mix accessibility into Slider
AccessibleSlider.mixInto( Slider );

export default Slider;