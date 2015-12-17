"use strict";

function BaseState(app){
	this._name = "BaseState";
	this.app = app;
	this.processData = function(data){};
	this.setNextState = function(newState){
		this.app.setState(newState);
	};
	this.toString = function(){
		return this._name;
	}
}

module.exports = BaseState;
