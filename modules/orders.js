var express = require('express');


 /*Mongoose Info
var mongoose = require('mongoose');

var models = require('./models')(mongoose);
var oderModel = models.orderModel;
*/


module.exports = function(app, mongoose) {

    var Promise= mongoose.Promise;
    var models = mongoose.models;

    return function(parameters){

        _this = this;

        _this.properties = {
            user: {
                fName : String,
                lName : String,
                email : String
            },
            foodName : String,
            restaurantName : String,
            notes: [ { type : String }],
            menuOptions: [{
                name: { type: String},
                choices: [{ type : String }] 
            }]
        }

        var init = function(){

        }

        

        init(parameters);

    }
   
   /*app.get("/viewUsers", function(req, res) {
        app.theUser.find().toArray(function(err, users) {
            res.contentType('json');
            res.send(users);
        });
    });
    app.get('/viewOrders', function(req, res) {
        Orders.find(function(err, orders) {
            console.log(orders);
            res.send(orders);
        });
    });

    app.post('/order', function(req, res) {
        var orderToPost = new Orders(req.query);
        console.log("order recieved!");
	console.log(req.query);
        orderToPost.save(function(err) {
            if (err) {
                return res.status(500).send(err);
			} else {
				return res.status(200).send();
			}
        });
    });*/
};
