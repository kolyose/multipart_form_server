const fs = require('fs');
const server = require("./myHttpServer");
const PendingState = require('./appStates/pendingState.js');

let _buffBoundary;
let _buffer;
let _res;
let _state;
let _arrHeaders = [];

this.addToBuffer = function(newBuffer){
	if (!newBuffer) 
		return;

	if (!_buffer){
		_buffer = new Buffer(newBuffer);
		return;
	}
	_buffer = Buffer.concat([_buffer, newBuffer]);
}

this.clearBuffer = function(){
	_buffer = null;
}

this.getState = function(){
	return _state;
}

this.setState = function(newState){
	if (_state)
		console.log(_state.toString() + "=>" + newState.toString())
	_state = newState;
	_state.processData();
}

this.isBoundaryDetected = function(){
	return ~_buffer.indexOf(_buffBoundary);
}

this.extractChunkFromBuffer = function(){
	return this._extractDataFromBuffer(_buffBoundary);
}

this.extractHeadersFromBuffer = function(){
	return this._extractDataFromBuffer(new Buffer("\r\n\r\n"));
}

this._extractDataFromBuffer = function(delimiter){
	let delimiterIndex = _buffer.indexOf(delimiter);	
	if (~delimiterIndex){
		let chunk = new Buffer(_buffer.slice(0, delimiterIndex));
		let restData = new Buffer(_buffer.slice(delimiterIndex + Buffer.byteLength(delimiter)));
		this.clearBuffer();
		this.addToBuffer(restData);
		return chunk;
	}
	
	return null;
}

this.parseHeaders = function(headersRawData){
	let isFile = (~headersRawData.toString().indexOf("filename"));
	let name = headersRawData.toString().split("name=")[1].split(';')[0].split('"')[1];
	let value = "";
	let objHeader = {
		[name]:"", 
		get name(){return name;}
	};	
	
	if (isFile){
		let filename = headersRawData.toString().split('filename="')[1].split('"')[0];
		objHeader[name] = {type:'file', path:filename};
	}
	
	/*objHeader[Symbol.iterator] = function(){
		let firstCall = true;
		return {
			next(){
				if (firstCall){
					firstCall = false;
					return {
						value	: name,
						done	: false
					}	
				} else {
					return {
						done: true
					}
				}
				
			}
		}
	}*/
	
	_arrHeaders.push(objHeader);
}

this.getCurrentHeader = function(){
	return _arrHeaders[_arrHeaders.length-1];
}

this.checkFormsEnd = function(){
	if (~_buffer.indexOf("--\r\n")){
		return true;
	}	
	return false;
}

//TODO: upload to github

this.erasePartEnding = function(data){
	if (!data) 
		return data;
	
	const ending = "\r\n--";
	let endingIndex = data.indexOf(ending);
	if  (~endingIndex)
		data = Buffer.concat([data.slice(0, endingIndex), data.slice(endingIndex + Buffer.byteLength(ending))]);
	
	return data;
}

this.saveBufferToHeader = function(){
	let chunk =  this.erasePartEnding(this.extractChunkFromBuffer());
	if (chunk !== null){
		let propertyName = this.getCurrentHeader().name;
		if (this.getCurrentHeader()[propertyName] == ""){				
			this.getCurrentHeader()[propertyName] = chunk.toString();
		}
	}
	return chunk;
}

this.saveBufferToFile = function(filepath){

	let chunk =  this.erasePartEnding(this.extractChunkFromBuffer());
	let dataToAppend = chunk;
		
	if (dataToAppend === null){
		dataToAppend = _buffer;			
	}
	
	fs.appendFileSync(filepath, dataToAppend);
	if (chunk === null){
		this.clearBuffer();
	}
	
	return _buffer;	
}

this.reset = function(){
	_arrHeaders = [];
}

this.sendResponse = function(){
	let result = _arrHeaders.reduce(function(previousValue, currentItem){
		previousValue[currentItem.name] = currentItem[currentItem.name];
		return previousValue;
	}, {});
	this._res.end(JSON.stringify(result));
}

server.on("connection", function(req, res){	
	this._res = res;
			
	this.setState(new PendingState(this));
	_buffBoundary = new Buffer(req.headers['Content-Type'].split('boundary=')[1]);
	
	req.on('data', function(data){
		this.getState().processData(data);			
	}.bind(this));	
	
	req.on('end', function(){
		console.log("THE END");	
	});	
}.bind(this));