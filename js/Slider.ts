// Copyright 2013-2022, University of Colorado Boulder

/**
 * Slider, with support for horizontal and vertical orientations. By default, the slider is constructed in the
 * horizontal orientation, then adjusted if the vertical orientation was specified.
 *
 * Note: This type was originally named HSlider, renamed in https://github.com/phetsims/sun/issues/380.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Property from '../../axon/js/Property.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import Orientation from '../../phet-core/js/Orientation.js';
import swapObjectKeys from '../../phet-core/js/swapObjectKeys.js';
import { DragListener, FocusHighlightFromNode, Node, NodeOptions, Path, SceneryConstants, TPaint } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ValueChangeSoundPlayer, { ValueChangeSoundPlayerOptions } from '../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import AccessibleSlider, { AccessibleSliderOptions } from './accessibility/AccessibleSlider.js';
import DefaultSliderTrack from './DefaultSliderTrack.js';
import SliderThumb from './SliderThumb.js';
import SliderTrack from './SliderTrack.js';
import sun from './sun.js';
import PickOptional from '../../phet-core/js/types/PickOptional.js';
import { LinkableElement } from '../../tandem/js/PhetioObject.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';

// constants
const VERTICAL_ROTATION = -Math.PI / 2;
const DEFAULT_HORIZONTAL_TRACK_SIZE = new Dimension2( 100, 5 );
const DEFAULT_HORIZONTAL_THUMB_SIZE = new Dimension2( 17, 34 );

type SelfOptions = {
  orientation?: Orientation;

  // optional track, replaces the default.
  // Client is responsible for highlighting, disable and pointer areas.
  // For instrumented Sliders, a supplied trackNode must be instrumented.
  // The tandem component name must be Slider.TRACK_NODE_TANDEM_NAME and it must be nested under the Slider tandem.
  trackNode?: SliderTrack | null;

  // track - options to create a SliderTrack if trackNode not supplied
  trackSize?: Dimension2 | null; // specific to orientation, will be filled in with a default if not provided
  trackFillEnabled?: TPaint;
  trackFillDisabled?: TPaint;
  trackStroke?: TPaint;
  trackLineWidth?: number;
  trackCornerRadius?: number;
  trackPickable?: boolean;

  // Whether the track bounds should be dilated for layout issues, see details at the instantiation site.
  trackBoundsDilation?: boolean;

  // optional thumb, replaces the default.
  // Client is responsible for highlighting, disabling and pointer areas.
  // The thumb is positioned based on its center and hence can have its origin anywhere
  // Note for PhET-IO: This thumbNode should be instrumented. The thumb's dragListener is instrumented underneath
  // this thumbNode. The tandem component name must be Slider.THUMB_NODE_TANDEM_NAME and it must be nested under
  // the Slider tandem.
  thumbNode?: Node | null;

  // Options for the default thumb, ignored if thumbNode is set
  thumbSize?: Dimension2 | null; // specific to orientation, will be filled in with a default if not provided
  thumbFill?: TPaint;
  thumbFillHighlighted?: TPaint;
  thumbStroke?: TPaint;
  thumbLineWidth?: number;
  thumbCenterLineStroke?: TPaint;

  // dilations are specific to orientation
  thumbTouchAreaXDilation?: number;
  thumbTouchAreaYDilation?: number;
  thumbMouseAreaXDilation?: number;
  thumbMouseAreaYDilation?: number;

  // Applied to default or supplied thumb
  thumbYOffset?: number; // center of the thumb is vertically offset by this amount from the center of the track

  // ticks - if adding an option here, make sure it ends up in this.tickOptions
  tickLabelSpacing?: number;
  majorTickLength?: number;
  majorTickStroke?: TPaint;
  majorTickLineWidth?: number;
  minorTickLength?: number;
  minorTickStroke?: TPaint;
  minorTickLineWidth?: number;

  cursor?: string;

  // opacity applied to the entire Slider when disabled
  disabledOpacity?: number;

  // If provided, create a LinkedElement for this PhET-iO instrumented Property, instead
  // of using the passed in Property. This option was created to support passing DynamicProperty or "wrapping"
  // Property that are "implementation  details" to the PhET-iO API, and still support having a LinkedElement that
  // points to the underlying model Property.
  phetioLinkedProperty?: LinkableElement | null;

  // This is used to generate sounds as the slider is moved by the user.  If not provided, the default sound generator
  // will be created. If set to null, the slider will generate no sound.
  soundGenerator?: ValueChangeSoundPlayer | null;

  // Options for the default sound generator.  These should only be provided when using the default.
  valueChangeSoundGeneratorOptions?: ValueChangeSoundPlayerOptions;
};

type ParentOptions = AccessibleSliderOptions & NodeOptions;

// We provide these options to the super
export type SliderOptions = SelfOptions &
  StrictOmit<ParentOptions, 'panTargetNode' | 'valueProperty' | 'enabledRangeProperty' | 'ariaOrientation'> &
  PickOptional<ParentOptions, 'enabledRangeProperty'>;

type TickOptions = Pick<SelfOptions, 'tickLabelSpacing' | 'majorTickLength' | 'majorTickStroke' | 'majorTickLineWidth' | 'minorTickLength' | 'minorTickStroke' | 'minorTickLineWidth'>;

export default class Slider extends AccessibleSlider( Node, 0 ) {

  public readonly enabledRangeProperty: TReadOnlyProperty<Range>;

  // public so that clients can access Properties of these DragListeners that tell us about its state
  // See https://github.com/phetsims/sun/issues/680
  public readonly thumbDragListener: DragListener;
  public readonly trackDragListener: DragListener;

  private readonly orientation: Orientation;

  // options needed by prototype functions that add ticks
  private readonly tickOptions: Required<TickOptions>;

  // ticks are added to these parents, so they are behind the knob
  private readonly majorTicksParent: Node;
  private readonly minorTicksParent: Node;

  private readonly track: SliderTrack;

  private readonly disposeSlider: () => void;

  // This is a marker to indicate that we should create the actual default slider sound.
  public static DEFAULT_SOUND = new ValueChangeSoundPlayer( new Range( 0, 1 ) );

  // If the user is holding down the thumb outside of the enabled range, and the enabled range expands, the value should
  // adjust to the new extremum of the range, see https://github.com/phetsims/mean-share-and-balance/issues/29
  // This value is set during thumb drag, or null if not currently being dragged.
  private proposedValue: number | null = null;

  public constructor( valueProperty: LinkableProperty<number>, range: Range, providedOptions?: SliderOptions ) {

    // Guard against mutually exclusive options before defaults are filled in.
    assert && assertMutuallyExclusiveOptions( providedOptions, [ 'thumbNode' ], [
      'thumbSize', 'thumbFill', 'thumbFillHighlighted', 'thumbStroke', 'thumbLineWidth', 'thumbCenterLineStroke',
      'thumbTouchAreaXDilation', 'thumbTouchAreaYDilation', 'thumbMouseAreaXDilation', 'thumbMouseAreaYDilation'
    ] );

    assert && assertMutuallyExclusiveOptions( providedOptions, [ 'trackNode' ], [
      'trackSize', 'trackFillEnabled', 'trackFillDisabled', 'trackStroke', 'trackLineWidth', 'trackCornerRadius' ] );

    const options = optionize<SliderOptions, SelfOptions, ParentOptions>()( {

      orientation: Orientation.HORIZONTAL,
      trackNode: null,

      trackSize: null,
      trackFillEnabled: 'white',
      trackFillDisabled: 'gray',
      trackStroke: 'black',
      trackLineWidth: 1,
      trackCornerRadius: 0,
      trackPickable: true,

      // By default, tracks dilate the bounds of the track to accommodate layout issues
      trackBoundsDilation: true,

      thumbNode: null,

      thumbSize: null,
      thumbFill: 'rgb(50,145,184)',
      thumbFillHighlighted: 'rgb(71,207,255)',
      thumbStroke: 'black',
      thumbLineWidth: 1,
      thumbCenterLineStroke: 'white',

      thumbTouchAreaXDilation: 11,
      thumbTouchAreaYDilation: 11,
      thumbMouseAreaXDilation: 0,
      thumbMouseAreaYDilation: 0,

      thumbYOffset: 0,

      tickLabelSpacing: 6,
      majorTickLength: 25,
      majorTickStroke: 'black',
      majorTickLineWidth: 1,
      minorTickLength: 10,
      minorTickStroke: 'black',
      minorTickLineWidth: 1,

      cursor: 'pointer',
      startDrag: _.noop,
      drag: _.noop,
      endDrag: _.noop,
      constrainValue: _.identity,

      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      soundGenerator: Slider.DEFAULT_SOUND,
      valueChangeSoundGeneratorOptions: {},

      // phet-io
      phetioLinkedProperty: null,

      // Supertype options
      tandem: Tandem.REQUIRED,
      tandemSuffix: 'Slider',
      phetioType: Slider.SliderIO,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions );

    // ariaOrientation is omitted from ParentOptions, so we can fill it in here.
    options.ariaOrientation = options.orientation;

    assert && assert( options.soundGenerator === Slider.DEFAULT_SOUND || _.isEmpty( options.valueChangeSoundGeneratorOptions ),
      'options should only be supplied when using default sound generator' );

    // If no sound generator was provided, create the default.
    if ( options.soundGenerator === Slider.DEFAULT_SOUND ) {
      options.soundGenerator = new ValueChangeSoundPlayer( range, options.valueChangeSoundGeneratorOptions || {} );
    }
    else if ( options.soundGenerator === null ) {
      options.soundGenerator = ValueChangeSoundPlayer.NO_SOUND;
    }

    // Set up the drag handler to generate sound when drag events cause changes.
    if ( options.soundGenerator !== ValueChangeSoundPlayer.NO_SOUND ) {

      // variable to keep track of the value at the start of user drag interactions
      let previousValue = valueProperty.value;

      // Enhance the drag handler to perform sound generation.
      const providedDrag = options.drag;
      options.drag = event => {
        if ( event.isFromPDOM() ) {
          options.soundGenerator!.playSoundForValueChange( valueProperty.value, previousValue );
        }
        else {
          options.soundGenerator!.playSoundIfThresholdReached( valueProperty.value, previousValue );
        }
        providedDrag( event );
        previousValue = valueProperty.value;
      };
    }

    const boundsRequiredOptionKeys = _.pick( options, Node.REQUIRES_BOUNDS_OPTION_KEYS );
    const superOptions = _.omit( options, Node.REQUIRES_BOUNDS_OPTION_KEYS );

    if ( superOptions.orientation === Orientation.VERTICAL ) {

      // For a vertical slider, the client should provide dimensions that are specific to a vertical slider.
      // But Slider expects dimensions for a horizontal slider, and then creates the vertical orientation using rotation.
      // So if the client provides any dimensions for a vertical slider, swap those dimensions to horizontal.
      if ( superOptions.trackSize ) {
        superOptions.trackSize = superOptions.trackSize.swapped();
      }
      if ( superOptions.thumbSize ) {
        superOptions.thumbSize = superOptions.thumbSize.swapped();
      }
      swapObjectKeys( superOptions, 'thumbTouchAreaXDilation', 'thumbTouchAreaYDilation' );
      swapObjectKeys( superOptions, 'thumbMouseAreaXDilation', 'thumbMouseAreaYDilation' );
    }
    superOptions.trackSize = superOptions.trackSize || DEFAULT_HORIZONTAL_TRACK_SIZE;
    superOptions.thumbSize = superOptions.thumbSize || DEFAULT_HORIZONTAL_THUMB_SIZE;

    const thumbTandem = options.tandem.createTandem( Slider.THUMB_NODE_TANDEM_NAME );
    if ( Tandem.VALIDATION && superOptions.thumbNode ) {
      assert && assert( superOptions.thumbNode.tandem.equals( thumbTandem ),
        `Passed-in thumbNode must have the correct tandem. Expected: ${thumbTandem.phetioID}, actual: ${superOptions.thumbNode.tandem.phetioID}`
      );
    }

    // The thumb of the slider
    const thumb = superOptions.thumbNode || new SliderThumb( {

      // propagate superOptions that are specific to SliderThumb
      size: superOptions.thumbSize,
      fill: superOptions.thumbFill,
      fillHighlighted: superOptions.thumbFillHighlighted,
      stroke: superOptions.thumbStroke,
      lineWidth: superOptions.thumbLineWidth,
      centerLineStroke: superOptions.thumbCenterLineStroke,
      tandem: thumbTandem
    } );

    const ownsEnabledRangeProperty = !superOptions.enabledRangeProperty;

    // controls the portion of the slider that is enabled
    superOptions.enabledRangeProperty = superOptions.enabledRangeProperty || new Property( range, {
      valueType: Range,
      isValidValue: ( value: Range ) => ( value.min >= range.min && value.max <= range.max ),
      tandem: options.tandem.createTandem( 'enabledRangeProperty' ),
      phetioValueType: Range.RangeIO,
      phetioDocumentation: 'Sliders support two ranges: the outer range which specifies the min and max of the track and ' +
                           'the enabledRangeProperty, which determines how low and high the thumb can be dragged within the track.'
    } );

    superOptions.panTargetNode = thumb;

    superOptions.valueProperty = valueProperty;

    super( superOptions );

    this.orientation = superOptions.orientation!;
    this.enabledRangeProperty = superOptions.enabledRangeProperty;

    this.tickOptions = _.pick( options, 'tickLabelSpacing',
      'majorTickLength', 'majorTickStroke', 'majorTickLineWidth',
      'minorTickLength', 'minorTickStroke', 'minorTickLineWidth' );

    const sliderParts = [];

    // ticks are added to these parents, so they are behind the knob
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

    this.track = options.trackNode || new DefaultSliderTrack( valueProperty, range, {

      // propagate options that are specific to SliderTrack
      size: superOptions.trackSize,
      fillEnabled: superOptions.trackFillEnabled,
      fillDisabled: superOptions.trackFillDisabled,
      stroke: superOptions.trackStroke,
      lineWidth: superOptions.trackLineWidth,
      cornerRadius: superOptions.trackCornerRadius,
      startDrag: superOptions.startDrag,
      drag: superOptions.drag,
      endDrag: superOptions.endDrag,
      constrainValue: superOptions.constrainValue,
      enabledRangeProperty: this.enabledRangeProperty,
      soundGenerator: options.soundGenerator,
      pickable: superOptions.trackPickable,
      voicingOnEndResponse: this.voicingOnEndResponse.bind( this ),

      // phet-io
      tandem: trackTandem
    } );

    // Position the track horizontally
    this.track.centerX = this.track.valueToPosition.evaluate( ( range.max + range.min ) / 2 );

    // Dilate the local bounds horizontally so that it extends beyond where the thumb can reach.  This prevents layout
    // asymmetry when the slider thumb is off the edges of the track.  See https://github.com/phetsims/sun/issues/282
    if ( options.trackBoundsDilation ) {
      this.track.localBounds = this.track.localBounds.dilatedX( thumb.width / 2 );
    }

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
    let valueOnStart = valueProperty.value; // For description so we can describe value changes between interactions
    const thumbDragListener = new DragListener( {

      // Deviate from the variable name because we will nest this tandem under the thumb directly
      tandem: thumb.tandem.createTandem( 'dragListener' ),

      start: ( event, listener ) => {
        if ( this.enabledProperty.get() ) {
          valueOnStart = valueProperty.value;

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
          this.proposedValue = this.track.valueToPosition.inverse( x );

          const valueInRange = this.enabledRangeProperty.get().constrainValue( this.proposedValue );
          valueProperty.set( options.constrainValue( valueInRange ) );

          // after valueProperty is set so listener can use the new value
          options.drag( event );
        }
      },

      end: event => {
        if ( this.enabledProperty.get() ) {
          options.endDrag( event );

          // voicing - Default behavior is to speak the new object response at the end of interaction. If you want to
          // customize this response, you can modify supertype options VoicingOnEndResponseOptions.
          this.voicingOnEndResponse( valueOnStart );
        }
        this.proposedValue = null;
      }
    } );
    thumb.addInputListener( thumbDragListener );

    this.thumbDragListener = thumbDragListener;
    this.trackDragListener = this.track.dragListener;

    // update thumb position when value changes
    const valueObserver = ( value: number ) => {
      thumb.centerX = this.track.valueToPosition.evaluate( value );
    };
    valueProperty.link( valueObserver ); // must be unlinked in disposeSlider

    // when the enabled range changes, the value to position linear function must change as well
    const enabledRangeObserver = ( enabledRange: Range ) => {

      // When restoring PhET-iO state, prevent the clamp from setting a stale, incorrect value to a deferred Property
      // (which may have already restored the correct value from phet-io state), see https://github.com/phetsims/mean-share-and-balance/issues/21
      if ( !valueProperty.isPhetioInstrumented() || !phet.joist.sim.isSettingPhetioStateProperty.value ) {


        if ( this.proposedValue === null ) {

          // clamp the current value to the enabled range if it changes
          valueProperty.set( Utils.clamp( valueProperty.value, enabledRange.min, enabledRange.max ) );
        }
        else {

          // The user is holding the thumb, which may be outside the enabledRange.  In that case, expanding the range
          // could accommodate the outer value
          const proposedValueInEnabledRange = Utils.clamp( this.proposedValue, enabledRange.min, enabledRange.max );
          const proposedValueInConstrainedRange = options.constrainValue( proposedValueInEnabledRange );
          valueProperty.set( proposedValueInConstrainedRange );
        }
      }
    };
    this.enabledRangeProperty.link( enabledRangeObserver ); // needs to be unlinked in dispose function

    this.disposeSlider = () => {
      thumb.dispose && thumb.dispose(); // in case a custom thumb is provided via options.thumbNode that doesn't implement dispose
      this.track.dispose && this.track.dispose();

      valueProperty.unlink( valueObserver );
      ownsEnabledRangeProperty && this.enabledRangeProperty.dispose();
      thumbDragListener.dispose();
    };

    // pdom - custom focus highlight that surrounds and moves with the thumb
    this.focusHighlight = new FocusHighlightFromNode( thumb );

    assert && Tandem.VALIDATION && assert( !options.phetioLinkedProperty || options.phetioLinkedProperty.isPhetioInstrumented(),
      'If provided, phetioLinkedProperty should be PhET-iO instrumented' );

    // Must happen after instrumentation (in super call)
    const linkedProperty = options.phetioLinkedProperty || ( valueProperty instanceof ReadOnlyProperty ? valueProperty : null );
    if ( linkedProperty ) {
      this.addLinkedElement( linkedProperty, {
        tandem: options.tandem.createTandem( 'valueProperty' )
      } );
    }

    // must be after the button is instrumented
    // assert && assert( !this.isPhetioInstrumented() || this.enabledRangeProperty.isPhetioInstrumented() );
    !ownsEnabledRangeProperty && this.enabledRangeProperty instanceof ReadOnlyProperty && this.addLinkedElement( this.enabledRangeProperty, {
      tandem: options.tandem.createTandem( 'enabledRangeProperty' )
    } );

    this.mutate( boundsRequiredOptionKeys );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    // @ts-ignore chipper query parameters
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Slider', this );
  }

  public get majorTicksVisible(): boolean { return this.getMajorTicksVisible(); }

  public set majorTicksVisible( value: boolean ) { this.setMajorTicksVisible( value ); }

  public get minorTicksVisible(): boolean { return this.getMinorTicksVisible(); }

  public set minorTicksVisible( value: boolean ) { this.setMinorTicksVisible( value ); }

  public override dispose(): void {
    this.disposeSlider();
    super.dispose();
  }

  /**
   * Adds a major tick mark.
   */
  public addMajorTick( value: number, label?: Node ): void {
    this.addTick( this.majorTicksParent, value, label,
      this.tickOptions.majorTickLength, this.tickOptions.majorTickStroke, this.tickOptions.majorTickLineWidth );
  }

  /**
   * Adds a minor tick mark.
   */
  public addMinorTick( value: number, label?: Node ): void {
    this.addTick( this.minorTicksParent, value, label,
      this.tickOptions.minorTickLength, this.tickOptions.minorTickStroke, this.tickOptions.minorTickLineWidth );
  }

  /**
   * Adds a tick mark above the track.
   */
  private addTick( parent: Node, value: number, label: Node | undefined, length: number, stroke: TPaint, lineWidth: number ): void {
    const labelX = this.track.valueToPosition.evaluate( value );

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
      label.localBoundsProperty.link( () => {
        label.centerX = tick.centerX;
        label.bottom = tick.top - this.tickOptions.tickLabelSpacing;
      } );
      label.pickable = false;
    }
  }

  // Sets visibility of major ticks.
  public setMajorTicksVisible( visible: boolean ): void {
    this.majorTicksParent.visible = visible;
  }

  // Gets visibility of major ticks.
  public getMajorTicksVisible(): boolean {
    return this.majorTicksParent.visible;
  }

  // Sets visibility of minor ticks.
  public setMinorTicksVisible( visible: boolean ): void {
    this.minorTicksParent.visible = visible;
  }

  // Gets visibility of minor ticks.
  public getMinorTicksVisible(): boolean {
    return this.minorTicksParent.visible;
  }

  // standardized tandem names, see https://github.com/phetsims/sun/issues/694
  public static THUMB_NODE_TANDEM_NAME = 'thumbNode' as const;
  public static TRACK_NODE_TANDEM_NAME = 'trackNode' as const;

  public static SliderIO: IOType;
}

Slider.SliderIO = new IOType( 'SliderIO', {
  valueType: Slider,
  documentation: 'A traditional slider component, with a knob and possibly tick marks',
  supertype: Node.NodeIO
} );

sun.register( 'Slider', Slider );
