"use strict";

var config = require("../config");
var prelaunch = require("@sportingsolutions/prelaunch");

prelaunch({
	forceHTTPS: config.forceHTTPS, 
	forceXDomain: config.forceXDomain,
	apiUrls: [config.apiRootUrl, config.baseUrl]
});