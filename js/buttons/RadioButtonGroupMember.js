// Copyright 2014-2015, University of Colorado Boulder

/**
 * A single radio button. This class is designed to be part of a RadioButtonGroup and there should be no need to use it
 * outside of RadioButtonGroup. It is called RadioButtonGroupMember to differentiate from RadioButton, which already exists.
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var RadioButtonInteractionStateProperty = require( 'SUN/buttons/RadioButtonInteractionStateProperty' );
  var RadioButtonGroupAppearance = require( 'SUN/buttons/RadioButtonGroupAppearance' );
  var RadioButtonGroupMemberModel = require( 'SUN/buttons/RadioButtonGroupMemberModel' );
  var ColorConstants = require( 'SUN/ColorConstants' );
  var Color = require( 'SCENERY/util/Color' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );

  /**
   * @param {Property} property axon property that can take on a set of values, one for each radio button in the group
   * @param {Object} value value when this radio button is selected
   * @param {Object} [options]
   * @constructor
   */
  function RadioButtonGroupMember( property, value, options ) {

    var self = this;

    // The value that corresponds to this button
    // @public for together
    this.selectionValue = value;

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
      accessibleDescription: ''
    }, options );

    // @public for access like together
    this.radioButtonGroupMemberModel = new RadioButtonGroupMemberModel( property, value );

    // @public for use in RadioButtonGroup for managing the labels
    this.interactionStateProperty = new RadioButtonInteractionStateProperty( this.radioButtonGroupMemberModel );

    RectangularButtonView.call( this, this.radioButtonGroupMemberModel, this.interactionStateProperty, options );

    // @public for Tandem support, should a novel name to reduce the risk of parent or child collisions
    this.radioButtonGroupMemberTandem = options.tandem;
    this.radioButtonGroupMemberTandem && this.radioButtonGroupMemberTandem.addInstance( this );

    // outfit with accessible content
    this.accessibleContent = {
      createPeer: function( accessibleInstance ) {

        /*
         Elements in the parallel DOM should look like:
         <input type="radio" value="value" id="radioButtonGroupMember-trailID">
         <label for="radioButtonGroupMember-trailID">Some invisible accessibility description</label>
         */

        var trail = accessibleInstance.trail;

        // create an input element for the content
        var inputElement = document.createElement( 'input' );
        inputElement.setAttribute( 'type', 'radio' );
        inputElement.setAttribute( 'value', value );
        inputElement.id = 'radioButtonGroupMember-' + trail.getUniqueId();

        // create a label element for the input
        var labelElement = document.createElement( 'label' );
        labelElement.setAttribute( 'for', inputElement.id );
        labelElement.innerHTML = options.accessibleDescription;

        // structure the input and its label
        inputElement.appendChild( labelElement );

        // listen for keyboard events and fire model
        inputElement.addEventListener( 'click', function() {
          self.radioButtonGroupMemberModel.fire();
        } );

        return new AccessiblePeer( accessibleInstance, inputElement );
      }
    };
  }

  return inherit( RectangularButtonView, RadioButtonGroupMember, {

    // @public
    dispose: function() {
      this.radioButtonGroupMemberTandem && this.radioButtonGroupMemberTandem.removeInstance( this );
    }
  } );
} );