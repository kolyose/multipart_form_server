const BaseState = require('./baseState.js');
const inherits = require('util').inherits;

function ParsingFormHeaders(app){
	BaseState.call(this, app);	
	this._name = "ParsingFormHeaders";
	this._headersRawData = null;
		
	this._checkForHeaders = function(){
		this._headersRawData = this.app.extractHeadersFromBuffer();
		if (this._headersRawData !== null){
			this.app.parseHeaders(this._headersRawData);	
			this._headersRawData = null;
			return true;
		}
		return false;
	}	
	
	this.processData = function(data){
		this.app.addToBuffer(data);
		if (this._checkForHeaders()){
			const SavingFormContent = require('./savingFormContent.js');
			this.setNextState(new SavingFormContent(this.app));		
		}
	}
}

inherits(ParsingFormHeaders, BaseState);
module.exports = ParsingFormHeaders;