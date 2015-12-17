const BaseState = require('./baseState.js');
const inherits = require('util').inherits;
const ParsingFormHeaders = require('./parsingFormHeaders.js');

function PendingState(app){
	BaseState.call(this, app);	
	this._name = "PendingState";
		
	this.processData = function(data){
		if (!data) return;
		this.app.addToBuffer(data);

		if (this.app.isBoundaryDetected()){
			this.setNextState(new ParsingFormHeaders(this.app));
		}
	}
}

inherits(PendingState, BaseState);


module.exports = PendingState;