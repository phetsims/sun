// Copyright 2013-2021, University of Colorado Boulder

/**
 * Slider, with support for horizontal and vertical orientations. By default, the slider is constructed in the
 * horizontal orientation, then adjusted if the vertical orientation was specified.
 *
 * Note: This type was originally named HSlider, renamed in https://github.com/phetsims/sun/issues/380.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import Shape from '../../kite/js/Shape.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../phet-core/js/merge.js';
import Orientation from '../../phet-core/js/Orientation.js';
import FocusHighlightFromNode from '../../scenery/js/accessibility/FocusHighlightFromNode.js';
import DragListener from '../../scenery/js/listeners/DragListener.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import SceneryConstants from '../../scenery/js/SceneryConstants.js';
import Tandem from '../../tandem/js/Tandem.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import VoidIO from '../../tandem/js/types/VoidIO.js';
import AccessibleSlider from './accessibility/AccessibleSlider.js';
import DefaultSliderTrack from './DefaultSliderTrack.js';
import SliderThumb from './SliderThumb.js';
import SliderTrack from './SliderTrack.js';
import sun from './sun.js';

// constants
const VERTICAL_ROTATION = -Math.PI / 2;

class Slider extends Node {

  /**
   * @param {Property.<number>} valueProperty
   * @param {Range} range
   * @param {Object} [options]
   * @mixes AccessibleSlider
   */
  constructor( valueProperty, range, options ) {

    // Guard against mutually exclusive options before defaults are filled in.
    assert && assertMutuallyExclusiveOptions( options, [ 'thumbNode' ], [
      'thumbSize', 'thumbFill', 'thumbFillHighlighted', 'thumbStroke', 'thumbLineWidth', 'thumbCenterLineStroke',
      'thumbTouchAreaXDilation', 'thumbTouchAreaYDilation', 'thumbMouseAreaXDilation', 'thumbMouseAreaYDilation'
    ] );

    assert && assertMutuallyExclusiveOptions( options, [ 'trackNode' ], [
      'trackSize', 'trackFillEnabled', 'trackFillDisabled', 'trackStroke', 'trackLineWidth', 'trackCornerRadius' ] );

    options = merge( {

      orientation: Orientation.HORIZONTAL, // {Orientation}

      // {SliderTrack} optional track, replaces the default.
      // Client is responsible for highlighting, disable and pointer areas.
      // For instrumented Sliders, a supplied trackNode must be instrumented.
      // The tandem component name must be Slider.TRACK_NODE_TANDEM_NAME and it must be nested under the Slider tandem.
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
      // Note for PhET-IO: This thumbNode should be instrumented. The thumb's dragListener is instrumented underneath
      // this thumbNode. The tandem component name must be Slider.THUMB_NODE_TANDEM_NAME and it must be nested under
      // the Slider tandem.
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
      startDrag: _.noop, // called when a drag sequence starts, passed to AccessibleSlider as well
      drag: _.noop, // called at the end of a drag event, after the valueProperty changes, passed to AccessibleSlider as well
      endDrag: _.noop, // called when a drag sequence ends, passed to AccessibleSlider as well
      constrainValue: _.identity, // called before valueProperty is set, passed to AccessibleValueHandler as well

      enabledRangeProperty: null, // {Property.<Range>|null} determine the portion of range that is enabled
      disabledOpacity: SceneryConstants.DISABLED_OPACITY, // opacity applied to the entire Slider when disabled

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: Slider.SliderIO,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true, // opt into default PhET-iO instrumented enabledProperty

      // {Property.<number>|null} - if provided, create a LinkedElement for this PhET-iO instrumented Property, instead
      // of using the passed in Property. This option was created to support passing DynamicProperty or "wrapping"
      // Property that are "implementation  details" to the PhET-iO API, and still support having a LinkedElement that
      // points to the underlying model Property.
      phetioLinkedProperty: null
    }, options );

    assert && assert( range instanceof Range, `range must be of type Range:${range}` );
    assert && assert( Orientation.includes( options.orientation ), `invalid orientation: ${options.orientation}` );
    assert && assert( options.trackNode === null || options.trackNode instanceof SliderTrack, 'trackNode must be of type SliderTrack' );
    assert && assert( options.thumbNode === null || options.thumbNode instanceof Node, 'thumbNode must be of type Node' );

    super();

    // @private {Orientation}
    this.orientation = options.orientation;

    const ownsEnabledRangeProperty = !options.enabledRangeProperty;

    // controls the portion of the slider that is enabled
    options.enabledRangeProperty = options.enabledRangeProperty || new Property( range, {
      valueType: Range,
      isValidValue: value => ( value.min >= range.min && value.max <= range.max ),
      tandem: options.tandem.createTandem( 'enabledRangeProperty' ),
      phetioType: Property.PropertyIO( Range.RangeIO ),
      phetioDocumentation: 'Sliders support two ranges: the outer range which specifies the min and max of the track and ' +
                           'the enabledRangeProperty, which determines how low and high the thumb can be dragged within the track.'
    } );

    // @public {Property.<Range>|null}
    this.enabledRangeProperty = options.enabledRangeProperty;

    // @private {Object} - options needed by prototype functions that add ticks
    this.tickOptions = _.pick( options, 'tickLabelSpacing',
      'majorTickLength', 'majorTickStroke', 'majorTickLineWidth',
      'minorTickLength', 'minorTickStroke', 'minorTickLineWidth' );

    const sliderParts = [];

    // @private {Node} ticks are added to these parents, so they are behind the knob
    this.majorTicksParent = new Node();
    this.minorTicksParent = new Node();
    sliderParts.push( this.majorTicksParent );
    sliderParts.push( this.minorTicksParent );

    const trackTandem = options.tandem.createTandem( Slider.TRACK_NODE_TANDEM_NAME );

    if ( Tandem.VALIDATION && options.trackNode ) {
      assert && assert( options.trackNode.tandem.equals( trackTandem ),
        `Passed-in trackNode must have the correct tandem. Expected: ${trackTandem.phetioID}, actual: ${options.trackNode.tandem.phetioID}`
      );
    }

    // @private {Node} track
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
      tandem: trackTandem
    } );

    // Position the track horizontally
    this.track.centerX = this.track.valueToPosition( ( range.max + range.min ) / 2 );

    const thumbTandem = options.tandem.createTandem( Slider.THUMB_NODE_TANDEM_NAME );
    if ( Tandem.VALIDATION && options.thumbNode ) {
      assert && assert( options.thumbNode.tandem.equals( thumbTandem ),
        `Passed-in thumbNode must have the correct tandem. Expected: ${thumbTandem.phetioID}, actual: ${options.thumbNode.tandem.phetioID}`
      );
    }

    // The thumb of the slider
    const thumb = options.thumbNode || new SliderThumb( {

      // propagate options that are specific to SliderThumb
      size: options.thumbSize,
      fill: options.thumbFill,
      fillHighlighted: options.thumbFillHighlighted,
      stroke: options.thumbStroke,
      lineWidth: options.thumbLineWidth,
      centerLineStroke: options.thumbCenterLineStroke,
      tandem: thumbTandem
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
    if ( options.orientation === Orientation.VERTICAL ) {
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
    const thumbDragListener = new DragListener( {

      // Deviate from the variable name because we will nest this tandem under the thumb directly
      tandem: thumb.tandem.createTandem( 'dragListener' ),

      start: ( event, listener ) => {
        if ( this.enabledProperty.get() ) {
          options.startDrag( event );
          const transform = listener.pressedTrail.subtrailTo( sliderPartsNode ).getTransform();

          // Determine the offset relative to the center of the thumb
          clickXOffset = transform.inversePosition2( event.pointer.point ).x - thumb.centerX;
        }
      },

      drag: ( event, listener ) => {
        if ( this.enabledProperty.get() ) {
          const transform = listener.pressedTrail.subtrailTo( sliderPartsNode ).getTransform(); // we only want the transform to our parent
          const x = transform.inversePosition2( event.pointer.point ).x - clickXOffset;
          const newValue = this.track.valueToPosition.inverse( x );
          const valueInRange = this.enabledRangeProperty.get().constrainValue( newValue );

          valueProperty.set( options.constrainValue( valueInRange ) );

          // after valueProperty is set so listener can use the new value
          options.drag( event );
        }
      },

      end: event => {
        if ( this.enabledProperty.get() ) {
          options.endDrag( event );
        }
      }
    } );
    thumb.addInputListener( thumbDragListener );

    // @public (read-only) so that clients can access Properties of these DragListeners that tell us about its state
    // See https://github.com/phetsims/sun/issues/680
    this.thumbDragListener = thumbDragListener;
    this.trackDragListener = this.track.dragListener;

    // update thumb position when value changes
    const valueObserver = value => {
      thumb.centerX = this.track.valueToPosition( value );
    };
    valueProperty.link( valueObserver ); // must be unlinked in disposeSlider

    // when the enabled range changes, the value to position linear function must change as well
    const enabledRangeObserver = function( enabledRange ) {

      // clamp the value to the enabled range if it changes
      valueProperty.set( Utils.clamp( valueProperty.value, enabledRange.min, enabledRange.max ) );
    };
    this.enabledRangeProperty.link( enabledRangeObserver ); // needs to be unlinked in dispose function

    this.mutate( options );

    // @private {function} - Called by dispose
    this.disposeSlider = () => {
      thumb.dispose && thumb.dispose(); // in case a custom thumb is provided via options.thumbNode that doesn't implement dispose
      this.track.dispose && this.track.dispose();

      valueProperty.unlink( valueObserver );
      ownsEnabledRangeProperty && this.enabledRangeProperty.dispose();
      thumbDragListener.dispose();
    };

    // pdom - custom focus highlight that surrounds and moves with the thumb
    this.focusHighlight = new FocusHighlightFromNode( thumb );

    assert && assert( !options.ariaOrientation, 'Slider sets its own ariaOrientation' );

    this.initializeAccessibleSlider( valueProperty, this.enabledRangeProperty, this.enabledProperty,
      merge( { ariaOrientation: options.orientation, panTargetNode: thumb }, options ) );

    assert && Tandem.VALIDATION && assert( !options.phetioLinkedProperty || options.phetioLinkedProperty.isPhetioInstrumented(),
      'If provided, phetioLinkedProperty should be PhET-iO instrumented' );

    this.addLinkedElement( options.phetioLinkedProperty || valueProperty, {
      tandem: options.tandem.createTandem( 'valueProperty' )
    } );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Slider', this );
  }

  get enabledRange() { return this.getEnabledRange(); }

  set enabledRange( range ) { this.setEnabledRange( range ); }

  get majorTicksVisible() { return this.getMajorTicksVisible(); }

  set majorTicksVisible( value ) { this.setMajorTicksVisible( value ); }

  get minorTicksVisible() { return this.getMinorTicksVisible(); }

  set minorTicksVisible( value ) { this.setMinorTicksVisible( value ); }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeSlider();
    this.disposeAccessibleSlider();
    super.dispose();
  }

  /**
   * Adds a major tick mark.
   * @param {number} value
   * @param {Node} [label] optional
   * @public
   */
  addMajorTick( value, label ) {
    this.addTick( this.majorTicksParent, value, label,
      this.tickOptions.majorTickLength, this.tickOptions.majorTickStroke, this.tickOptions.majorTickLineWidth );
  }

  /**
   * Adds a minor tick mark.
   * @param {number} value
   * @param {Node} [label] optional
   * @public
   */
  addMinorTick( value, label ) {
    this.addTick( this.minorTicksParent, value, label,
      this.tickOptions.minorTickLength, this.tickOptions.minorTickStroke, this.tickOptions.minorTickLineWidth );
  }

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
  addTick( parent, value, label, length, stroke, lineWidth ) {
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
      if ( this.orientation === Orientation.VERTICAL ) {
        label.rotation = -VERTICAL_ROTATION;
      }
      parent.addChild( label );
      label.centerX = tick.centerX;
      label.bottom = tick.top - this.tickOptions.tickLabelSpacing;
      label.pickable = false;
    }
  }

  // @public
  setEnabledRange( enabledRange ) { this.enabledRangeProperty.value = enabledRange; }

  // @public
  getEnabledRange() { return this.enabledRangeProperty.value; }

  // @public - Sets visibility of major ticks.
  setMajorTicksVisible( visible ) {
    this.majorTicksParent.visible = visible;
  }

  // @public - Gets visibility of major ticks.
  getMajorTicksVisible() {
    return this.majorTicksParent.visible;
  }

  // @public - Sets visibility of minor ticks.
  setMinorTicksVisible( visible ) {
    this.minorTicksParent.visible = visible;
  }

  // @public - Gets visibility of minor ticks.
  getMinorTicksVisible() {
    return this.minorTicksParent.visible;
  }
}

// mix accessibility into Slider
AccessibleSlider.mixInto( Slider );

// @public standardized tandem names, see https://github.com/phetsims/sun/issues/694
Slider.THUMB_NODE_TANDEM_NAME = 'thumbNode';
Slider.TRACK_NODE_TANDEM_NAME = 'trackNode';

Slider.SliderIO = new IOType( 'SliderIO', {
  valueType: Slider,
  documentation: 'A traditional slider component, with a knob and possibly tick marks',
  supertype: Node.NodeIO,
  methods: {
    setMajorTicksVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.setMajorTicksVisible( visible );
      },
      documentation: 'Set whether the major tick marks should be shown',
      invocableForReadOnlyElements: false
    },

    setMinorTicksVisible: {
      returnType: VoidIO,
      parameterTypes: [ BooleanIO ],
      implementation: function( visible ) {
        this.setMinorTicksVisible( visible );
      },
      documentation: 'Set whether the minor tick marks should be shown',
      invocableForReadOnlyElements: false
    }
  }
} );

sun.register( 'Slider', Slider );
export default Slider;