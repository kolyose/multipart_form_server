const BaseState = require('./baseState.js');
const inherits = require('util').inherits;
const ParsingFormHeaders = require('./parsingFormHeaders');

function SavingFormContent(app){
	BaseState.call(this, app);	
	this._name = "SavingFormContent";
		
	this.processData = function(data){
		this.app.addToBuffer(data);
		let propertyName = this.app.getCurrentHeader().name;
		if (this.app.getCurrentHeader()[propertyName].type === 'file'){
			if (this.app.saveBufferToFile(this.app.getCurrentHeader()[propertyName].path)){		
				if (this.app.checkFormsEnd()){
					this.app.clearBuffer();
					this.app.sendResponse();
					this.app.reset();
					const PendingState = require('./pendingState.js');
					this.setNextState(new PendingState(this.app));
				} else {					
					this.setNextState(new ParsingFormHeaders(this.app));
				}
			}
		} else {
			if (this.app.saveBufferToHeader() !== null){
				this.setNextState(new ParsingFormHeaders(this.app));
			}
		}		
	}
}

inherits(SavingFormContent, BaseState);
module.exports = SavingFormContent;