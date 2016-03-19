var express = require('express'),

	app = require('connect');
	

	app.use(require('body-parser')());
	app.use(express.urlencoded());
	app.use(require('method-override')());