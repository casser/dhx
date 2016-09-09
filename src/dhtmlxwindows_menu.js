/*
Product Name: dhtmlxSuite 
Version: 5.0 
Edition: Standard 
License: content of this file is covered by GPL. Usage outside GPL terms is prohibited. To obtain Commercial or Enterprise license contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

// global context menu


// custom menu


// menu for button
dhtmlXWindowsButton.prototype.attachContextMenu = function(conf) {
	return this.conf.wins._renderContextMenu("button", this.conf.winId, this.conf.name, conf);
};
dhtmlXWindowsButton.prototype.getContextMenu = function() {
	if (this.conf.wins.cm == null || this.conf.wins.cm.button[this.conf.winId] == null) return null;
	if (this.conf.wins.cm.button[this.conf.winId][this.conf.name] != null) return this.conf.wins.cm.button[this.conf.winId][this.conf.name];
	return null;
};
dhtmlXWindowsButton.prototype.detachContextMenu = function() {
	this.conf.wins._detachContextMenu("button", this.conf.winId, this.conf.name);
};



