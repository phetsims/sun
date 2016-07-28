// Copyright 2014-2015, University of Colorado Boulder

/**
 * A single radio button. This class is designed to be part of a RadioButtonGroup and there should be no need to use it
 * outside of RadioButtonGroup. It is called RadioButtonGroupMember to differentiate from RadioButton, which already
 * exists.
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var Color = require( 'SCENERY/util/Color' );
  var ColorConstants = require( 'SUN/ColorConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var RadioButtonGroupAppearance = require( 'SUN/buttons/RadioButtonGroupAppearance' );
  var RadioButtonGroupMemberModel = require( 'SUN/buttons/RadioButtonGroupMemberModel' );
  var RadioButtonInteractionStateProperty = require( 'SUN/buttons/RadioButtonInteractionStateProperty' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );

  // phet-io modules
  var TRadioButton = require( 'ifphetio!PHET_IO/types/sun/buttons/TRadioButton' );

  /**
   * @param {Property} property axon property that can take on a set of values, one for each radio button in the group
   * @param {Object} value value when this radio button is selected
   * @param {Object} [options]
   * @constructor
   */
  function RadioButtonGroupMember( property, value, options ) {

    var self = this;

    options = _.extend( {
      // The fill for the rectangle behind the radio buttons.  Default color is bluish color, as in the other button library.
      baseColor: ColorConstants.LIGHT_BLUE,
      disabledBaseColor: ColorConstants.LIGHT_GRAY,

      // Opacity can be set separately for the buttons and button content.
      selectedButtonOpacity: 1,
      deselectedButtonOpacity: 0.6,
      selectedContentOpacity: 1,
      deselectedContentOpacity: 0.6,
      overButtonOpacity: 0.8,
      overContentOpacity: 0.8,

      selectedStroke: 'black',
      deselectedStroke: new Color( 50, 50, 50 ),
      selectedLineWidth: 1.5,
      deselectedLineWidth: 1,

      // The following options specify highlight behavior overrides, leave as null to get the default behavior
      // Note that highlighting applies only to deselected buttons
      overFill: null,
      overStroke: null,
      overLineWidth: null,

      // The default appearances use the color values specified above, but other appearances could be specified for more
      // customized behavior.  Generally setting the color values above should be enough to specify the desired look.
      buttonAppearanceStrategy: RadioButtonGroupAppearance.defaultRadioButtonsAppearance,
      contentAppearanceStrategy: RadioButtonGroupAppearance.contentAppearanceStrategy,

      // invisible label for the radio button group member for accessibility
      accessibleLabel: '',
      type: null // {function} phet-io type wrapper type
    }, options );

    Tandem.validateOptions( options ); // The tandem is required when brand==='phet-io'

    // @public (phet-io)
    this.radioButtonGroupMemberModel = new RadioButtonGroupMemberModel( property, value );

    // @public for use in RadioButtonGroup for managing the labels
    this.interactionStateProperty = new RadioButtonInteractionStateProperty( this.radioButtonGroupMemberModel );

    RectangularButtonView.call( this, this.radioButtonGroupMemberModel, this.interactionStateProperty, options );

    // @public (tandem) - for Tandem support, should be a novel name to reduce the risk of parent or child collisions
    this.radioButtonGroupMemberTandem = options.tandem;
    this.radioButtonGroupMemberTandem && this.radioButtonGroupMemberTandem.addInstance( this, TRadioButton( options.type ) );

    // outfit a11y
    this.accessibleContent = {
      createPeer: function( accessibleInstance ) {
        var trail = accessibleInstance.trail;
        var uniqueId = trail.getUniqueId();
        var parentId = accessibleInstance.parent.id;

        // The element in the parallel DOM needs to look like this:
        //   <input type="radio" role="radio" name="parentId" id="radio-button-id" aria-label="accessibleLabel">

        // the focusable DOM element needs to be the input
        var domElement = document.createElement( 'input' );
        domElement.id = 'radio-button-' + uniqueId;
        domElement.setAttribute( 'type', 'radio' );
        domElement.setAttribute( 'role', 'radio' );
        domElement.setAttribute( 'name', parentId );
        domElement.setAttribute( 'aria-label', options.accessibleLabel );

        // listen for keyboard events and fire model
        domElement.addEventListener( 'click', function() {
          self.radioButtonGroupMemberModel.fire();
        } );

        // link the 'checked' and 'aria-checked' attribute to the property value
        property.link( function( newValue ) {
          var checked = newValue === value;
          domElement.setAttribute( 'aria-checked', checked );
          domElement.checked = checked;
        } );

        return new AccessiblePeer( accessibleInstance, domElement );
      }
    };
  }

  sun.register( 'RadioButtonGroupMember', RadioButtonGroupMember );

  return inherit( RectangularButtonView, RadioButtonGroupMember, {

    // @public
    dispose: function() {
      this.radioButtonGroupMemberTandem && this.radioButtonGroupMemberTandem.removeInstance( this );
    }
  } );
} );