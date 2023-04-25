// Copyright 2013-2023, University of Colorado Boulder

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
import CompletePiecewiseLinearFunction from '../../dot/js/CompletePiecewiseLinearFunction.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import Orientation from '../../phet-core/js/Orientation.js';
import swapObjectKeys from '../../phet-core/js/swapObjectKeys.js';
import { DragListener, FocusHighlightFromNode, LayoutConstraint, Node, NodeOptions, SceneryConstants, Sizable, TPaint } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ValueChangeSoundPlayer, { ValueChangeSoundPlayerOptions } from '../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import AccessibleSlider, { AccessibleSliderOptions } from './accessibility/AccessibleSlider.js';
import DefaultSliderTrack from './DefaultSliderTrack.js';
import SliderThumb from './SliderThumb.js';
import SliderTrack from './SliderTrack.js';
import SliderTick, { SliderTickOptions } from './SliderTick.js';
import sun from './sun.js';
import PickOptional from '../../phet-core/js/types/PickOptional.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import TProperty from '../../axon/js/TProperty.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import SunConstants from './SunConstants.js';
import createObservableArray, { ObservableArray } from '../../axon/js/createObservableArray.js';
import LinkableElement from '../../tandem/js/LinkableElement.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';

// constants
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
  trackPickable?: boolean; // May be set to false if a slider track is not visible and user interaction is therefore undesirable.

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
} & SliderTickOptions;

type ParentOptions = AccessibleSliderOptions & NodeOptions;


type RequiredParentOptionsSuppliedBySlider = 'panTargetNode' | 'valueProperty' | 'enabledRangeProperty' | 'ariaOrientation';
type OptionalParentOptions = StrictOmit<ParentOptions, RequiredParentOptionsSuppliedBySlider>;

// We provide these options to the super, also enabledRangeProperty is turned from required to optional
export type SliderOptions = SelfOptions & OptionalParentOptions & PickOptional<ParentOptions, 'enabledRangeProperty'>;

export default class Slider extends Sizable( AccessibleSlider( Node, 0 ) ) {

  public readonly enabledRangeProperty: TReadOnlyProperty<Range>;

  // public so that clients can access Properties of these DragListeners that tell us about its state
  // See https://github.com/phetsims/sun/issues/680
  public readonly thumbDragListener: DragListener;
  public readonly trackDragListener: DragListener;

  private readonly orientation: Orientation;

  // options needed by prototype functions that add ticks
  private readonly tickOptions: Required<SliderTickOptions>;

  // ticks are added to these parents, so they are behind the knob
  private readonly majorTicksParent: Node;
  private readonly minorTicksParent: Node;

  private readonly track: SliderTrack;

  private readonly disposeSlider: () => void;

  private readonly ticks: ObservableArray<SliderTick> = createObservableArray();

  // This is a marker to indicate that we should create the actual default slider sound.
  public static readonly DEFAULT_SOUND = new ValueChangeSoundPlayer( new Range( 0, 1 ) );

  // If the user is holding down the thumb outside of the enabled range, and the enabled range expands, the value should
  // adjust to the new extremum of the range, see https://github.com/phetsims/mean-share-and-balance/issues/29
  // This value is set during thumb drag, or null if not currently being dragged.
  private proposedValue: number | null = null;

  public constructor( valueProperty: LinkableProperty<number>,
                      range: Range | TReadOnlyProperty<Range>,
                      providedOptions?: SliderOptions ) {

    // Guard against mutually exclusive options before defaults are filled in.
    assert && assertMutuallyExclusiveOptions( providedOptions, [ 'thumbNode' ], [
      'thumbSize', 'thumbFill', 'thumbFillHighlighted', 'thumbStroke', 'thumbLineWidth', 'thumbCenterLineStroke',
      'thumbTouchAreaXDilation', 'thumbTouchAreaYDilation', 'thumbMouseAreaXDilation', 'thumbMouseAreaYDilation'
    ] );

    assert && assertMutuallyExclusiveOptions( providedOptions, [ 'trackNode' ], [
      'trackSize', 'trackFillEnabled', 'trackFillDisabled', 'trackStroke', 'trackLineWidth', 'trackCornerRadius' ] );

    const options = optionize<SliderOptions, SelfOptions, OptionalParentOptions>()( {

      orientation: Orientation.HORIZONTAL,
      trackNode: null,

      trackSize: null,
      trackFillEnabled: 'white',
      trackFillDisabled: 'gray',
      trackStroke: 'black',
      trackLineWidth: 1,
      trackCornerRadius: 0,
      trackPickable: true,

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
      tandemNameSuffix: 'Slider',
      phetioType: Slider.SliderIO,
      visiblePropertyOptions: { phetioFeatured: true },
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions );

    const rangeProperty = range instanceof Range ? new TinyProperty( range ) : range;

    // assert && assert( options.soundGenerator === Slider.DEFAULT_SOUND || _.isEmpty( options.valueChangeSoundGeneratorOptions ),
    //   'options should only be supplied when using default sound generator' );

    // If no sound generator was provided, create the default.
    if ( options.soundGenerator === Slider.DEFAULT_SOUND ) {
      options.soundGenerator = new ValueChangeSoundPlayer( rangeProperty.value, options.valueChangeSoundGeneratorOptions || {} );
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

    if ( options.orientation === Orientation.VERTICAL ) {

      // For a vertical slider, the client should provide dimensions that are specific to a vertical slider.
      // But Slider expects dimensions for a horizontal slider, and then creates the vertical orientation using rotation.
      // So if the client provides any dimensions for a vertical slider, swap those dimensions to horizontal.
      if ( options.trackSize ) {
        options.trackSize = options.trackSize.swapped();
      }
      if ( options.thumbSize ) {
        options.thumbSize = options.thumbSize.swapped();
      }
      swapObjectKeys( options, 'thumbTouchAreaXDilation', 'thumbTouchAreaYDilation' );
      swapObjectKeys( options, 'thumbMouseAreaXDilation', 'thumbMouseAreaYDilation' );
    }
    options.trackSize = options.trackSize || DEFAULT_HORIZONTAL_TRACK_SIZE;
    options.thumbSize = options.thumbSize || DEFAULT_HORIZONTAL_THUMB_SIZE;

    const thumbTandem = options.tandem.createTandem( Slider.THUMB_NODE_TANDEM_NAME );
    if ( Tandem.VALIDATION && options.thumbNode ) {
      assert && assert( options.thumbNode.tandem.equals( thumbTandem ),
        `Passed-in thumbNode must have the correct tandem. Expected: ${thumbTandem.phetioID}, actual: ${options.thumbNode.tandem.phetioID}`
      );
    }

    // The thumb of the slider
    const thumb = options.thumbNode || new SliderThumb( {

      // propagate superOptions that are specific to SliderThumb
      size: options.thumbSize,
      fill: options.thumbFill,
      fillHighlighted: options.thumbFillHighlighted,
      stroke: options.thumbStroke,
      lineWidth: options.thumbLineWidth,
      centerLineStroke: options.thumbCenterLineStroke,
      tandem: thumbTandem
    } );

    const ownsEnabledRangeProperty = !options.enabledRangeProperty;

    const boundsRequiredOptionKeys = _.pick( options, Node.REQUIRES_BOUNDS_OPTION_KEYS );

    // Now add in the required options when passing to the super type
    const superOptions = combineOptions<typeof options & PickRequired<ParentOptions, RequiredParentOptionsSuppliedBySlider>>( {

      ariaOrientation: options.orientation,
      valueProperty: valueProperty,
      panTargetNode: thumb,

      // controls the portion of the slider that is enabled
      enabledRangeProperty: options.enabledRangeProperty || ( range instanceof Range ? new Property( range, {
        valueType: Range,
        isValidValue: ( value: Range ) => ( value.min >= range.min && value.max <= range.max ),
        tandem: options.tandem.createTandem( 'enabledRangeProperty' ),
        phetioValueType: Range.RangeIO,
        phetioDocumentation: 'Sliders support two ranges: the outer range which specifies the min and max of the track and ' +
                             'the enabledRangeProperty, which determines how low and high the thumb can be dragged within the track.'
      } ) : range )
    }, options );

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

    const trackSpacer = new Node();
    sliderParts.push( trackSpacer );

    // Assertion to get around mutating the null-default based on the slider orientation.
    assert && assert( superOptions.trackSize, 'trackSize should not be null' );

    this.track = options.trackNode || new DefaultSliderTrack( valueProperty, range, {

      // propagate options that are specific to SliderTrack
      size: superOptions.trackSize!,
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
      sliderPartsNode.rotation = SunConstants.SLIDER_VERTICAL_ROTATION;
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
          this.proposedValue = this.track.valueToPositionProperty.value.inverse( x );

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
    const valueMultilink = Multilink.multilink( [ valueProperty, this.track.valueToPositionProperty ], ( value, valueToPosition ) => {
      thumb.centerX = valueToPosition.evaluate( value );
    } );

    // when the enabled range changes, the value to position linear function must change as well
    const enabledRangeObserver = ( enabledRange: Range ) => {
      const joistGlobal = _.get( window, 'phet.joist', null ); // returns null if global isn't found

      // When restoring PhET-iO state, prevent the clamp from setting a stale, incorrect value to a deferred Property
      // (which may have already restored the correct value from phet-io state), see https://github.com/phetsims/mean-share-and-balance/issues/21
      if ( !joistGlobal || !valueProperty.isPhetioInstrumented() || !joistGlobal.sim.isSettingPhetioStateProperty.value ) {


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

    const constraint = new SliderConstraint( this, this.track, thumb, sliderPartsNode, options.orientation, trackSpacer, this.ticks );

    this.disposeSlider = () => {
      constraint.dispose();

      thumb.dispose && thumb.dispose(); // in case a custom thumb is provided via options.thumbNode that doesn't implement dispose
      this.track.dispose && this.track.dispose();

      if ( ownsEnabledRangeProperty ) {
        this.enabledRangeProperty.dispose();
      }
      else {
        this.enabledRangeProperty.unlink( enabledRangeObserver );
      }
      valueMultilink.dispose();
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
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Slider', this );
  }

  public get majorTicksVisible(): boolean { return this.getMajorTicksVisible(); }

  public set majorTicksVisible( value: boolean ) { this.setMajorTicksVisible( value ); }

  public get minorTicksVisible(): boolean { return this.getMinorTicksVisible(); }

  public set minorTicksVisible( value: boolean ) { this.setMinorTicksVisible( value ); }

  public override dispose(): void {
    this.disposeSlider();

    this.ticks.forEach( tick => {
      tick.dispose();
    } );

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
    this.ticks.push( new SliderTick( parent, value, label, length, stroke, lineWidth, this.tickOptions, this.orientation, this.track ) );
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
  public static readonly THUMB_NODE_TANDEM_NAME = 'thumbNode' as const;
  public static readonly TRACK_NODE_TANDEM_NAME = 'trackNode' as const;

  public static readonly SliderIO = new IOType( 'SliderIO', {
    valueType: Slider,
    documentation: 'A traditional slider component, with a knob and possibly tick marks',
    supertype: Node.NodeIO
  } );
}

class SliderConstraint extends LayoutConstraint {

  private readonly preferredProperty: TProperty<number | null>;
  private readonly disposeSliderConstraint: () => void;

  public constructor(
    private readonly slider: Slider,
    private readonly track: SliderTrack,
    private readonly thumb: Node,
    private readonly sliderPartsNode: Node,
    private readonly orientation: Orientation,
    private readonly trackSpacer: Node,
    private readonly ticks: ObservableArray<SliderTick>
  ) {

    super( slider );

    // We need to make it sizable in both dimensions (VSlider vs HSlider), but we'll still want to make the opposite
    // axis non-sizable (since it won't be sizable in both orientations at once).
    if ( orientation === Orientation.HORIZONTAL ) {
      slider.heightSizable = false;
      this.preferredProperty = this.slider.localPreferredWidthProperty;
    }
    else {
      slider.widthSizable = false;
      this.preferredProperty = this.slider.localPreferredHeightProperty;
    }
    this.preferredProperty.lazyLink( this._updateLayoutListener );

    // So range changes or minimum changes will trigger layouts (since they can move ticks)
    this.track.rangeProperty.lazyLink( this._updateLayoutListener );

    // Thumb size changes should trigger layout, since we check the width of the thumb
    // NOTE: This is ignoring thumb scale changing, but for performance/correctness it makes sense to avoid that for now
    // so we can rule out infinite loops of thumb movement.
    this.thumb.localBoundsProperty.lazyLink( this._updateLayoutListener );

    // As ticks are added, add a listener to each that will update the layout if the tick's bounds changes.
    const tickAddedListener = ( addedTick: SliderTick ) => {
      addedTick.tickNode.localBoundsProperty.lazyLink( this._updateLayoutListener );
      ticks.addItemRemovedListener( removedTick => {
        if ( removedTick === addedTick &&
             removedTick.tickNode.localBoundsProperty.hasListener( this._updateLayoutListener ) ) {
          addedTick.tickNode.localBoundsProperty.unlink( this._updateLayoutListener );
        }
      } );
    };
    ticks.addItemAddedListener( tickAddedListener );

    this.addNode( track );

    this.layout();

    this.disposeSliderConstraint = () => {
      ticks.removeItemAddedListener( tickAddedListener );
      this.preferredProperty.unlink( this._updateLayoutListener );
      this.track.rangeProperty.unlink( this._updateLayoutListener );
      this.thumb.localBoundsProperty.unlink( this._updateLayoutListener );
    };
  }

  protected override layout(): void {
    super.layout();

    const slider = this.slider;
    const track = this.track;
    const thumb = this.thumb;

    // Dilate the local bounds horizontally so that it extends beyond where the thumb can reach.  This prevents layout
    // asymmetry when the slider thumb is off the edges of the track.  See https://github.com/phetsims/sun/issues/282
    this.trackSpacer.localBounds = track.localBounds.dilatedX( thumb.width / 2 );

    assert && assert( track.minimumWidth !== null );

    // Our track's (exterior) minimum width will INCLUDE "visual overflow" e.g. stroke. The actual range used for
    // computation of where the thumb/ticks go will be the "interior" width (excluding the visual overflow), e.g.
    // without the stroke. We'll need to track and handle these separately, and only handle tick positioning based on
    // the interior width.
    const totalOverflow = track.leftVisualOverflow + track.rightVisualOverflow;
    const trackMinimumExteriorWidth = track.minimumWidth!;
    const trackMinimumInteriorWidth = trackMinimumExteriorWidth - totalOverflow;

    // Takes a tick's value into the [0,1] range. This should be multiplied times the potential INTERIOR track width
    // in order to get the position the tick should be at.
    const normalizeTickValue = ( value: number ) => {
      return Utils.linear( track.rangeProperty.value.min, track.rangeProperty.value.max, 0, 1, value );
    };

    // NOTE: Due to visual overflow, our track's range (including the thumb extension) will actually go from
    // ( -thumb.width / 2 - track.leftVisualOverflow ) on the left to
    // ( trackExteriorWidth + thumb.width / 2 + track.rightVisualOverflow ) on the right.
    // This is because our track's width is reduced to account for stroke, but the logical rectangle is still located
    // at x=0, meaning the stroke (with lineWidth=1) will typically go out to -0.5 (negative left visual overflow).
    // Our horizontal bounds are thus effectively offset by this left visual overflow amount.

    // NOTE: This actually goes PAST where the thumb should go when there is visual overflow, but we also
    // included this "imprecision" in the past (localBounds INCLUDING the stroke was dilated by the thumb width), so we
    // will have a slight bit of additional padding included here.

    // NOTE: Documentation was added before dynamic layout integration (noting the extension BEYOND the bounds):
    // > Dilate the local bounds horizontally so that it extends beyond where the thumb can reach.  This prevents layout
    // > asymmetry when the slider thumb is off the edges of the track.  See https://github.com/phetsims/sun/issues/282
    const leftExteriorOffset = -thumb.width / 2 - track.leftVisualOverflow;
    const rightExteriorOffset = thumb.width / 2 - track.leftVisualOverflow;

    // Start with the size our minimum track would be WITH the added spacing for the thumb
    // NOTE: will be mutated below
    const minimumRange = new Range( leftExteriorOffset, trackMinimumExteriorWidth + rightExteriorOffset );

    // We'll need to consider where the ticks would be IF we had our minimum size (since the ticks would potentially
    // be spaced closer together). So we'll check the bounds of each tick if it was at that location, and
    // ensure that ticks are included in our minimum range (since tick labels may stick out past the track).
    this.ticks.forEach( tick => {

      // Where the tick will be if we have our minimum size
      const tickMinimumPosition = trackMinimumInteriorWidth * normalizeTickValue( tick.value );

      // Adjust the minimum range to include the tick.
      const halfTickWidth = tick.tickNode.width / 2;

      // The tick will be centered
      minimumRange.includeRange( new Range( -halfTickWidth, halfTickWidth ).shifted( tickMinimumPosition ) );
    } );

    if ( slider.widthSizable && this.preferredProperty.value !== null ) {
      // Here's where things get complicated! Above, it's fairly easy to go from "track exterior width" => "slider width",
      // however we need to do the opposite (when our horizontal slider has a preferred width, we need to compute what
      // track width we'll have to make that happen). As I noted in the issue for this work:

      // There's a fun linear optimization problem hiding in plain sight (perhaps a high-performance iterative solution will work):
      // - We can compute a minimum size (given the minimum track size, see where the tick labels go, and include those).
      // - HOWEVER adjusting the track size ALSO adjusts how much the tick labels stick out to the sides (the expansion
      //   of the track will push the tick labels away from the edges).
      // - Different ticks will be the limiting factor for the bounds at different track sizes (a tick label on the very
      //   end should not vary the bounds offset, but a tick label that's larger but slightly offset from the edge WILL
      //   vary the offset)
      // - So it's easy to compute the resulting size from the track size, BUT the inverse problem is more difficult.
      //   Essentially we have a convex piecewise-linear function mapping track size to output size (implicitly defined
      //   by where tick labels swap being the limiting factor), and we need to invert it.

      // Effectively the "track width" => "slider width" is a piecewise-linear function, where the breakpoints occur
      // where ONE tick either becomes the limiting factor or stops being the limiting factor. Mathematically, this works
      // out to be based on the following formulas:

      // The LEFT x is the minimum of all the following:
      //   -thumb.width / 2 - track.leftVisualOverflow
      //   FOR EVERY TICK: -tickWidth / 2 + ( trackWidth - overflow ) * normalizedTickValue
      // The RIGHT x is the maximum of all the following:
      //   trackWidth + thumb.width / 2 - track.leftVisualOverflow
      //   (for every tick) tickWidth / 2 + ( trackWidth - overflow ) * normalizedTickValue
      // NOTE: the "trackWidth - overflow" is the INTERNAL width (not including the stroke) that we use for tick
      // computation
      // This effectively computes how far everything "sticks out" and would affect the bounds.
      //
      // The TOTAL width of the slider will simply be the above RIGHT - LEFT.

      // Instead of using numerical solutions, we're able to solve this analytically with piecewise-linear functions that
      // implement the above functions. We'll consider each of those individual functions as a linear function where
      // the input is the exterior track length, e.g. f(trackLength) = A * trackLength + B, for given A,B values.
      // By min/max-ing these together and then taking the difference, we'll have an accurate function of
      // f(trackLength) = sliderWidth. Then we'll invert that function, e.g. f^-1(sliderWidth) = trackLength, and then
      // we'll be able to pass in our preferred slider width in order to compute the preferred track length.

      // We'll need to factor the trackWidth out for the tick functions, so:
      // LEFT tick computations:
      //   -tickWidth / 2 + ( trackWidth - overflow ) * normalizedTickValue
      // = -tickWidth / 2 + trackWidth * normalizedTickValue - overflow * normalizedTickValue
      // = normalizedTickValue * trackWidth + ( -tickWidth / 2 - overflow * normalizedTickValue )
      // So when we put it in the form of A * trackWidth + B, we get:
      //   A = normalizedTickValue, B = -tickWidth / 2 - overflow * normalizedTickValue
      // Similarly happens for the RIGHT tick computation.

      const trackWidthToFullWidthFunction = CompletePiecewiseLinearFunction.max(
        // Right side (track/thumb)
        CompletePiecewiseLinearFunction.linear( 1, rightExteriorOffset ),
        // Right side (ticks)
        ...this.ticks.map( tick => {
          const normalizedTickValue = normalizeTickValue( tick.value );
          return CompletePiecewiseLinearFunction.linear( normalizedTickValue, tick.tickNode.width / 2 - totalOverflow * normalizedTickValue );
        } )
      ).minus( CompletePiecewiseLinearFunction.min(
        // Left side (track/thumb)
        CompletePiecewiseLinearFunction.constant( leftExteriorOffset ),
        // Left side (ticks)
        ...this.ticks.map( tick => {
            const normalizedTickValue = normalizeTickValue( tick.value );
            return CompletePiecewiseLinearFunction.linear( normalizedTickValue, -tick.tickNode.width / 2 - totalOverflow * normalizedTickValue );
          }
        ) ) );

      // NOTE: This function is only monotonically increasing when trackWidth is positive! We'll drop the values
      // underneath our minimum track width (they won't be needed), but we'll need to add an extra point below to ensure
      // that the slope is maintained (due to how CompletePiecewiseLinearFunction works).
      const fullWidthToTrackWidthFunction = trackWidthToFullWidthFunction.withXValues( [
        trackMinimumExteriorWidth - 1,
        trackMinimumExteriorWidth,
        ...trackWidthToFullWidthFunction.points.map( point => point.x ).filter( x => x > trackMinimumExteriorWidth + 1e-10 )
      ] ).inverted();

      track.preferredWidth = Math.max(
        // Ensure we're NOT dipping below the minimum track width (for some reason).
        trackMinimumExteriorWidth,
        fullWidthToTrackWidthFunction.evaluate( this.preferredProperty.value )
      );
    }
    else {
      track.preferredWidth = track.minimumWidth;
    }

    const minimumWidth = minimumRange.getLength();

    // Set minimums at the end
    if ( this.orientation === Orientation.HORIZONTAL ) {
      slider.localMinimumWidth = minimumWidth;
    }
    else {
      slider.localMinimumHeight = minimumWidth;
    }
  }

  public override dispose(): void {
    this.disposeSliderConstraint();
    super.dispose();
  }
}

sun.register( 'Slider', Slider );
