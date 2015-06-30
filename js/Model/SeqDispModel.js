var currentFeature = {
 	init: function ( track,feature,div ){
		this.id= feature.get('id');
		this.name = feature.get('name');
		this.start = feature.get('start');
		this.end = feature.get('end');
		this.strand = feature.get('strand');
		this.type = feature.get('type');
		this.uid = feature._uniqueID;
		this.chr = feature.get('seq_id');	
		this.loc = this.chr+":"+(this.start+1)+".."+this.end;	
		this.track = track;
		this.upstream = 0;
		this.downstream = 0;

		return this;
	},
	
	update : function(prop,value){
		this[prop] = value;
	},

	revComp : function(sequence){
		var rev = sequence.split('');
		//console.log(rev.length);
		for(i=0; i < rev.length; i++){
				rev[i]=sequence.charAt(i).replace(/[ACGTUNWSMKRYBDHV]/ig,function(c){
						return {"A":"T","C":"G","G":"C","T":"A","U":"A",
								"a":"t","c":"g","g":"c","t":"a","u":"a",
								"S":"S","W":"W","N":"N","M":"K",
								"K":"M","R":"Y","Y":"R",
								"s":"s","w":"w","n":"n","m":"k",
								"k":"m","r":"y","y":"r",
								"B":"V","V":"B","D":"H","H":"D",
								"b":"v","v":"b","d":"h","h":"d"
								}[c];});}
		
		return rev.reverse().join('');
	},

	getSeq : function(upstream,downstream){
		var thisS = this;
		var ref = {ref:this.chr, start: thisS.start - upstream, end : this.end + downstream};
		
		var def = new dojo.Deferred();
		
		this.track.store.args.browser.getStore('refseqs', function(refSeqStore){
			refSeqStore.getReferenceSequence(ref, function(sequence){
					thisS.seq = sequence;
					def.resolve(true);
			})
		})
		
		return def;
	}
};


