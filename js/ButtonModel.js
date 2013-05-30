/**Model for buttons

 Reasons to use Fort for ButtonModel
 1. It is very clean and concise (create all attributes, listeners, notifications, preventing notification when value didn't actually change, etc with just a few lines of code)
 2. It will match well with our other model code
 3. It will automatically gain bonus features of Fort, such as record/playback

 Reasons not to use Fort for ButtonModel
 1. Creates a dependency of SUN->Fort
 2. Possible memory/performance problems?

 @author Sam Reid
 */
define( function( require ) {
  "use strict";

  var Fort = require( 'FORT/Fort' );

  return Fort.Model.extend( {
                              //The default state for the button
                              defaults: {
                                enabled: true,
                                armed: false,
                                pressed: false
                              },

                              //When the ButtonModel is created, create an untracked list of listeners.
                              initialize: function() {
                                Fort.Model.prototype.initialize.call( this );
                                this.listeners = [];
                              },

                              //Fire all of the listeners.
                              fireListeners: function() {
                                this.listeners.forEach( function( listener ) { listener(); } );
                              }} );
} );