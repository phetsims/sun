// Copyright 2020, University of Colorado Boulder

import ActionSpecification from '../../axon/js/ActionSpecification.js';
import Property from '../../axon/js/Property.js';
import PropertySpecification from '../../axon/js/PropertySpecification.js';
import merge from '../../phet-core/js/merge.js';
import FireListener from '../../scenery/js/listeners/FireListener.js';
import FireListenerSpecification from '../../scenery/js/listeners/FireListenerSpecification.js';
import NodeSpecification from '../../scenery/js/nodes/NodeSpecification.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import sun from './sun.js';

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

class CheckboxSpecification extends NodeSpecification {

  constructor( checkbox, options ) {
    options = merge( {
      phetioEventType: EventType.USER,
      visiblePropertyOptions: { phetioFeatured: true },
      enabledPropertyPhetioInstrumented: true,
      tandem: Tandem.REQUIRED
    }, options );
    super( checkbox, options );

    // Only way to get some variables is through PhET-iO, since it is a private closure variable
    if ( Tandem.VALIDATION && options.tandem.supplied ) {
      const toggleAction = phet.phetio.phetioEngine.getPhetioObject( options.tandem.createTandem( 'toggleAction' ).phetioID );

      // @public (read-only)
      this.toggleAction = new ActionSpecification( toggleAction, {
        phetioReadOnly: true,
        phetioEventType: EventType.USER
      } );

      const property = phet.phetio.phetioEngine.getPhetioObject( options.tandem.createTandem( 'property' ).phetioID );
      this.property = new PropertySpecification( property, { phetioType: Property.PropertyIO( BooleanIO ) } );
    }

    // FireListenerSpecification is exercised through the checkbox creation (if it is created)
    // But we have to make sure it was created somehow, and with the right options.  Maybe the one tested through main creation
    // tests generic parameters, and in this case, we test it against our specific requirements
    // TODO: https://github.com/phetsims/phet-io/issues/1657 this is sloppy--what if there are 2 FireListeners.
    // Is there a more direct way to do this?  How was it done in phetioAPIValidation?  Should we create a temporary "fake"
    // tandem, and make sure its concrete leaves match?

    // for phet-io, checkboxes should have an instrumented fireListener.  This search also checks the self-node (not just children)
    const getFireListener = node => _.find( node.getInputListeners(), listener => listener instanceof FireListener );
    const nodeWithFireListener = checkbox.getLeafTrails( getFireListener ).map( t => t.lastNode() );
    const fireListener = getFireListener( nodeWithFireListener[ 0 ] );

    // Are *Specification only to be called from their constructors?  Nope, check out toggleAction=new ActionSpecification() above
    this.fireListener = new FireListenerSpecification( fireListener, {
      tandem: options.tandem.createTandem( 'fireListener' )
    } );
  }
}

sun.register( 'CheckboxSpecification', CheckboxSpecification );
export default CheckboxSpecification;