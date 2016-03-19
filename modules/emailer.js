var nodemailer = require('nodemailer');
var express = require('express'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var smtpTransport = nodemailer.createTransport( 
		{
			service: "Gmail",
			auth: {
				user: "lunchpakautomatedmessage@gmail.com",
				pass: "orderLunch"
			}
		});


var userSchema = new Schema({ 

    fName : { type : String, required : true },
	lName : { type : String, required : true },
	password : { type : String, required: true},
	email : { type : String, required: true, unique: true },
	achievements : [{name: String}],
	rank : String,
	isLunchAdmin : Boolean,
	wantsEmail : Boolean,
	accessToken : { type : String } 
});

var User = mongoose.model('EmailUser', userSchema, 'users');

module.exports = function (app){
	app.get('/sendWarning', function(req,res) {
		User.find({'wantsEmail' : true}, 'email', function(err, users) {
			var emails= [];
			for(var i =0; i<users.length; i++) {
				emails.push(users[i].email);
			}
			console.log(emails);

			var message = {
			   	from: "<lunchpakautomatedmessage@gmail.com>", 
			 	to: emails,
				subject: "15 minute Warning", 
			 	text: "Hello, users! You have 15 minutes before you can no longer order" 
			};
			console.log("sending mail", smtpTransport);
			smtpTransport.sendMail(message, function(error, reponse){
				if(error){
					console.log('Error occured');
					console.log(error.message);
					return;
				}
				console.log('Message sent!');
			});
		});
	});
}
