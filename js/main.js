define([
           'dojo/_base/declare',
           'JBrowse/Plugin',
		   './View/SeqDispDialog',
		   './Model/SeqDispModel'
       ],
       function(
           declare,
           JBrowsePlugin,
		   SeqView,
		   SeqModel
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        var browser = args.browser;
		var thisB = this;
			
	
        // do anything you need to initialize your plugin here
        console.log( "seqdisp-jbrowse plugin added" );
			
  }
});
});
