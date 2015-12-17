"use strict";

const util = require("util");
const EventEmitter = require("events");
const net = require("net");
const fs = require("fs");
const url = require("url");
const path = require("path");
const MyReadableStream = require('./myReadableStream');
const MyWritableStream = require('./myWritableStream');

function ServerEventEmitter(port){
	EventEmitter.call(this);
	
	let _this = this;
	
	let server = net.createServer(function (connection) {

		console.log("connection established");
		let _connection = connection;

		connection.on('error', 	(err) => {console.dir(err)});	
		connection.on("end", 	() => {console.log("connection end");});	
		connection.on("close", 	() => {console.log("connection closed");});

		let requestRawData = new Buffer("");
		let requestStream, responseStream;

		function onData(data){
					
			requestRawData = Buffer.concat([requestRawData, new Buffer(data)]);

			let emptyStringIndex = requestRawData.indexOf(new Buffer("\r\n\r\n"));
			if (~emptyStringIndex){
				let lineAndHeaders = requestRawData.slice(0, emptyStringIndex);
				let requestLineAndHeaders = parseRequestLineAndHeaders(lineAndHeaders);				
				
				if (requestLineAndHeaders.url === "/favicon.ico")
					return connection.end();

				connection.removeListener('data', onData);
				connection.pause();

				let remainingData = new Buffer(requestRawData.slice(emptyStringIndex + Buffer.byteLength("\r\n\r\n", "utf8")));
				requestStream = new MyReadableStream(connection, remainingData);				
				responseStream = new MyWritableStream(connection);
				
				for (let property in requestLineAndHeaders){
					requestStream[property] = requestLineAndHeaders[property];
				}
				
				_this.emit("connection", requestStream, responseStream);
			} 				
		}
		
		connection.on("data", onData);

		function parseRequestLineAndHeaders(data){
			let result = {};

			let arrDataLines 			= data.toString().split('\r\n');
			let arrRequestData 			= arrDataLines[0].split(" ");

			result.method 				= arrRequestData[0];
			result.url		 			= arrRequestData[1];
			result.protocolVersion 		= arrRequestData[2].split("/")[1];
			result.headers 				= {};

			for (let i=1,length=arrDataLines.length; i<length; i++){
				if (arrDataLines[i] == '\r\n') break;
				let arrHeaderData = arrDataLines[i].split(':');
				result.headers[arrHeaderData[0]] = arrHeaderData[1]; 
			} 

			return result;
		}
	});
		
	server.listen(port, function () {
		console.log("server listening on port " + port);
	});
}

util.inherits(ServerEventEmitter, EventEmitter);

module.exports = new ServerEventEmitter(process.env.PORT || 3000);