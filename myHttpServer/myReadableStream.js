'use strict';

const Readable = require('stream').Readable;
const inherits = require('util').inherits;

let _isDataRequested = false;

function MyReadableStream(sourceStream, initialData){
	Readable.call(this);
	this.arrChunks = [initialData];
	
	sourceStream.on('readable', function(){	
		this.arrChunks.push(sourceStream.read());		
		if(_isDataRequested === true){
			_isDataRequested = false;
			this.push(this.arrChunks.shift());			
		}	
	}.bind(this));
}
inherits(MyReadableStream, Readable);

MyReadableStream.prototype._read = function(){ 
	if (this.arrChunks.length>0){
		this.push(this.arrChunks.shift());
	} else {
		_isDataRequested = true;
	}
}

module.exports = MyReadableStream;
