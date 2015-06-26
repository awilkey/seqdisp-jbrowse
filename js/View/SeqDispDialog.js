
/*
 * Initializer and makes the DOM object that is the sequence display
 * form. 
 *
 */

function SeqDisp(track, feature, div){
    var thisB = this;
    var featureId= feature.get('id');
	
	feat = currentFeature.init(track, feature, div);

    var dispContainer =  dojo.create('div',{id:'disp-container',className:'disp-container', innerHTML:''});
	var basicControl = dojo.create('div',{id:'basic-cont',className:'control-div',innerHTML:''},dispContainer);
	
	populateOptions(basicControl);

	var tabCont = dojo.create('div',{id:'tab-container', className:"tab-container"},dispContainer);

	makeTabs(tabCont);
	
	return dispContainer;
}

/*
 * Populates the given div with the controls for the plugin.
 * 
 */
 
function populateOptions(optionsDiv){
	
	var optionsContainer = dojo.create('div',{id: 'options-container' ,className: 'options'},optionsDiv);
	var options = require(["dojo/dom","dojo/dom-construct","dojo/parser","dojox/layout/TableContainer"],
	function(dom,domConstruct,parser,TableContainer){

		var optionsTable = new TableContainer({
			customClass:"options-table",
			showLabels:true,
			cols:2
		});
		
		var upSpin = makeSpinner("upstream");
		var upVis = makeTabSelect("upstream");
		var downSpin = makeSpinner("downstream");
		var downVis = makeTabSelect("downstream");
		var formatSelect = makeSelectFormat();
		var revCompSelect = makeRevSelect();
		var baseSpin = makeBaseSpin();		

		optionsTable.addChild(upSpin);
		optionsTable.addChild(upVis);
		optionsTable.addChild(downSpin);
		optionsTable.addChild(downVis);
		optionsTable.addChild(formatSelect);
		optionsTable.addChild(revCompSelect);
		optionsTable.addChild(baseSpin);

		optionsTable.placeAt(optionsContainer);
		
		upSpin.startup();
		upVis.startup();
		downSpin.startup();
		downVis.startup();
		formatSelect.startup();
		revCompSelect.startup();
		baseSpin.startup();
		optionsTable.startup();
	});
	
}
/*
 * Generates div for upstream/downstream base pair entry
 * by default spinners will increment by values of 10, but you
 * can change this by altering the value of "smallDelta" in streamSpin
 *
 */

function makeSpinner(stream){
	var streamSpin;
	var streamid = stream+'-spinner';
	var streamclass = 'stream-div';
	var streamtitle =  stream[0].toUpperCase() + stream.slice(1) + " bp :"
	var spinner =	require(["dojo/dom","dojo/dom-construct","dojo/parser","dojox/layout/TableContainer","dijit/form/NumberSpinner","dojo/domReady!"],
	function(dom,domConstruct,parser,TableContainer,NumberSpinner){
	
		var maxlen;
		if (stream === 'upstream'){
				maxlen = feat.start;
		} else {
				maxlen = feat.track.refSeq.end - feat.end;
		}
	
		streamSpin = new NumberSpinner({
			value:0,
			smallDelta:10,
			title:streamtitle,
			intermediateChanges: true,
			constraints:{min:0,max:maxlen},
			id:stream,
			style:'width:9em;',
			onChange: function(){
				var me = this;
				testContent = this.getValue();
				require(["dijit/layout/ContentPane"],function(ContentPane){
					var value = me.getValue()
					var filler = (isNaN(value) || value < 0) ? 0 : me.getValue();

					feat[stream] = filler;
					updateSeq(true);	
				});
			}
		});
	});

	return streamSpin;
}

/*
 * Lets users decide how many bases they wish per line
 *
 */

function makeBaseSpin(){
	var baseSpin;
	
	var spinner =	require(["dojo/dom","dojo/dom-construct","dojo/parser","dojox/layout/TableContainer","dijit/form/NumberSpinner","dojo/domReady!"],
	function(dom,domConstruct,parser,TableContainer,NumberSpinner){
	
		baseSpin = new NumberSpinner({
			value:40,
			smallDelta:5,
			title:"Bases per line:",
			intermediateChanges: true,
			constraints:{min:1,max:80},
			id:"base-spin",
			style:'width:3em;',
			onChange: function(){
					updateSeq(false);	
			}
		});
		
	});

	return baseSpin;
}

/*
 * Updates the sequence displayed on change
 *
 *
 */

function updateSeq(update){
		var upstream = 0;
		var downstream = 0;
		
		var seqpane = dijit.byId("seq-pane");
		var uppane = dijit.byId("upstream-tab");
		var downpane = dijit.byId("downstream-tab");

		if(feat.strand === -1){
			upstream = feat.downstream;
			downstream = feat.upstream;
		} else {
			upstream = feat.upstream;
			downstream = feat.downstream;
		}
		
		if (update){
		
			feat.getSeq(upstream,downstream).then(function(){
        		seqCont= formatSequence(feat.seq,upstream,downstream);
    			seqpane.set("content",seqCont.seq);
    			uppane.set("content",seqCont.up);
    			downpane.set("content",seqCont.down);
			});
		
		} else {
        	
			seqCont= formatSequence(feat.seq,upstream,downstream);
    		seqpane.set("content",seqCont.seq);
    		uppane.set("content",seqCont.up);
    		downpane.set("content",seqCont.down);
		}
}

/*
 * Generates container for tabs, current tabs are refrence information and
 * the sequence.
 *
 */


function makeTabs(tabCont){
	var tabs = require(['dojo/parser','dijit/layout/TabContainer','dijit/layout/ContentPane'],
	function(parser,TabContainer,ContentPane){
		var tc = new TabContainer({
	  		doLayout:false,
		  	id: 'tab-cont',
			style:'width:50em',
    		controllerWidget: 'dijit.layout.TabController'
	  	},tabCont);
	  	tc.startup();
			
		var seqCont;
		var seqPane;
		feat.getSeq(0,0).then(function(){
			seqCont= formatSequence(feat.seq,0,0);
			seqPane = new ContentPane({
					selected:true,
					id:'seq-pane',
					className:'seq-pane',
					title:'Sequence',
					content:seqCont.seq,
			});

			tc.addChild(seqPane);
	
			tc.addChild(new ContentPane({
				id:"ref-pane",
        		title: "Refrence Infomation",
        		style:"height:80%",
				content:refTable(),
	   		}));

			var upTab = new ContentPane({
				id: "upstream-tab",
				className:"seq-pane",
        		title: "Upstream Sequence",
        		style:"height:80%",
				content: seqCont.up,
	   		});
			tc.addChild(upTab,1);
			
			var downTab = new ContentPane({
				id: "downstream-tab",
				className:"seq-pane",
        		title: "Downstream Sequence",
        		style:"height:80%",
				content: seqCont.down,
	   		});
			tc.addChild(downTab,2);

			dojo.style(upTab.controlButton.domNode,{display:"none"});
			dojo.style(downTab.controlButton.domNode,{display:"none"});
		});

		tc.selectChild(seqPane);
	});

}

/*
 * Makes checkbox to select if upstream/downstream tabs are visible.
 *
 */

function makeTabSelect(stream){
	var selectTab;
	var boxid = stream+'-check';
	var selectLabel = 'Show ' + stream +' separately: ';
	var streamTab = stream+'-tab';
	var check = require(['dojo/parser','dojo/dom-style','dijit/form/CheckBox'],
	function(parser,domStyle,CheckBox){
		selectTab = new CheckBox({
			id: boxid ,
			label: selectLabel,
			checked: false,
			onChange: function(){
				this.get('value') ? dojo.style(dijit.byId(streamTab).controlButton.domNode,{display:"inline-block"}) :
					dojo.style(dijit.byId(streamTab).controlButton.domNode,{display:"none"});
			}
		});
	});

	return selectTab;
}

/*
 * Makes checkbox to select reverse complement
 *
 */

function makeRevSelect(){
	var rc;	
	var check = require(['dojo/parser','dojo/dom-style','dijit/form/CheckBox'],
	function(parser,domStyle,CheckBox){
		rc = new CheckBox({
			id: 'rc-select' ,
			label: 'Reverse complement: ',
			checked: false,
			onChange: function(){
				updateSeq(false);
			}
		});
	});

	return rc;
}
/*
 * Make the dropdown for sequence display formatting
 *
 */

function makeSelectFormat(){ 
	var formSelect;
	var select = require(['dijit/form/Select'],
		function(dSelect){
			formSelect = new dSelect({
					id:'form-select',
					label: 'Select format: ',
					style: 'width:50px;',
					name: 'format-select',
					options:[
						{label:"RAW", value:"raw"},
						{label:"FASTA", value:"fasta"}
					],

			onChange: function(){
					
					updateSeq(false);
				}
			});
		}
	);

	return formSelect;
}




/*
 * Formats a sequence for display.
 *
 */

function formatSequence(sequence,upstream,downstream){

	var us = upstream;
	var ds = downstream;
	var formattedSeq;
	var mark;
	var len;
	var format = dijit.byId("form-select").get('value');
	var strand = feat.strand === 1 ? '+ strand' : '- strand';
	
	var linew = dijit.byId("base-spin").get('value');
	var re = new RegExp(".{"+linew+"}|.{1,"+(linew-1)+"}","g");
	var rev = dijit.byId('rc-select').get('value');
	var dir = feat.strand === -1 ? true : false;
	
	var seqEnd = feat.end;	

	if(!dir != !rev){
		sequence = feat.revComp(sequence);
		us = ds;
		ds = upstream;

	}	

	formattedSeq = sequence.match(re);
	formattedSeq = formattedSeq.join('<br>');
	
	var usbreak = (Math.floor(us/linew)*4)+us;
	var dsbreak = (feat.end-feat.start+us)+(Math.floor((feat.end-feat.start+us)/linew)*4);
	var bodylen = dsbreak-usbreak;


	var upSeq = formattedSeq.slice(0,usbreak);
	var downSeq =  ds > 0 ?  sequence.slice((sequence.length-ds)).match(re).join('<br>') : '';
	
//	console.log("before fasta"+upSeq+" ud "+downSeq);

	var finalSeq = "<span className='stream-reg'>"+formattedSeq.slice(0,usbreak)+
			'</span>'+formattedSeq.slice(usbreak,dsbreak)+
			"<span className='stream-reg'>"+formattedSeq.slice(dsbreak)+'</span>';
	
	if (format === 'fasta'){
		var info = '>'+feat.id;
		var upinfo;
		var revInfo = rev ? "_rc":'';
		var revSeq = upSeq;
	
		if (us > 0){
				
				info += "_up"+us+"bp";
				var upInfo = '>upstream'+us+'bp_'+feat.id+revInfo+' '+feat.chr+':';
				if( feat.strand === 1) {
					upInfo += feat.start+".."+ (feat.start+us);
				} else {
					upInfo +=" ("+ (feat.end-us)+".."+feat.end;
				}
				upInfo += '(' + strand + ') '+us+'bp <br>';

				if(rev){
					upSeq = upInfo + downSeq;
				} else {
					upSeq = upInfo + upSeq;
				}
		}
		if (ds > 0){
				info += "_down"+ds+"bp";
				var downInfo = '>downstream'+ds+'bp_'+feat.id+revInfo+' '+feat.chr+':';
				if( feat.strand === -1) {
					downInfo += feat.start+".."+ (feat.start+ds);
				} else {
					downInfo += (feat.end-us)+".."+feat.end;
				}

				downInfo +='(' + strand + ') ' +ds+'bp <br>'
				
				if(rev){
					downSeq = downInfo + revSeq;
				} else {
					downSeq = downInfo + downSeq;
				}
		}
		
		info +=revInfo+' ' + feat.chr+':'+(feat.start+1-us)+".."+(feat.end+ds)+ 
				'(' +strand+') '+sequence.length+'bp <br>';
		
		finalSeq = info+finalSeq;

	}	else if (format === 'raw' && rev){
			revSeq = upSeq;
			upSeq = downSeq;
			downSeq = revSeq;
	}

//	console.log("after: " + upSeq + " ud " + downSeq);
	
	return {seq:finalSeq, up:upSeq, down:downSeq};
}


/*
 * Format table for refrence tab
 *
 */

function refTable(){
	var strand = feat.strand === -1 ? 'reverse strand' : 'forward strand';
	var table = '<table border="1" id="ref-table"> <tr><th>Name</th><td>' + feat.id + '</td></tr>'+
			    '<tr><th>Type</th><td>' + feat.type + '</td></tr>'+
				'<tr><th>Location</th><td>' + feat.loc + '</td></tr>'+
				'<tr><th>Strand</th><td>' + strand + '</td></tr></table>';

	return table;
}
