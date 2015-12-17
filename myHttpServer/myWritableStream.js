'use strict';

const Writable = require('stream').Writable;
const inherits = require('util').inherits;

let _targetStream;

function MyWritableStream(targetStream){
	Writable.call(this);
	
	_targetStream = targetStream;
}
inherits(MyWritableStream, Writable);

MyWritableStream.prototype._write = function(data){ 
	_targetStream.write(data);
}

MyWritableStream.prototype.end = function(data){ 
	_targetStream.end(data);
}

module.exports = MyWritableStream;
