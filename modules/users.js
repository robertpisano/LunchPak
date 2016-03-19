var express = require('express');
module.exports = function(app, mongoose){

    var Promise = mongoose.Promise,
    Token = require('./token.js'),
    authenticate = require('./expressAuthentication.js')
    userModel = mongoose.models.userModel;

	return users = function(properties){
		//when the users function-object is not accessed with the new keyword, "this" will not be bound to new
		// this will instead return a new instance of the users object, so that "this" works
		if(!(this instanceof users)){
			return new users(email, password, properties);
		}


		//only an internal function - 
		//I don't want to be able to find out if the user exists outside of this object
		var userExists = function(email){
			var promise = new Promise;
			var jsonSearch = {};

			for(property in _this.properties){
				if(_this.properties[property]){
					jsonSearch[property]= _this.properties[property]; 
				}
			}
			userModel.findOne(jsonSearch, function(err, user) {
				if(user){
					promise.fulfill(user);
				}
				if(!user){
					promise.reject('DNE');
				}
			});

			return promise;
		};

		//essentially constructor function -
		// place any variables passed in the properties parameter (which should be a JSON object)
		var init = function(properties){
			for(var property in properties)
			{
				_this.properties[property] = properties[property]; 
			}
		};


		//*-------------External Functions - visible outside of object-------------------------*//

		_this = this;

		_this.properties = { 
				"email" : "", 
				"password": "", 
				"fName": '', 
				"lName":'', 
				"isLunchAdmin":'', 
				"wantsEmail":'', 
				"accessToken":'',
				"points":0
		};
		
		_this.updateAccessToken = function() {
		    var promise = new Promise;
		    var token = Token.newToken();

		    _this.properties.accessToken = token;
			if(_this.properties.email === undefined || _this.properties.email === "")
			{ return promise.reject("there is no email to look up");}
		
			userModel.findOne({email: _this.properties.email}, function(err, user){

				user.accessToken = 	_this.properties.accessToken;
			    user.save(function(err) {
					if (err) {
						console.log(err);
						promise.error(err);	
					}
			       promise.fulfill(token);
			    });


			});
			    return promise;
		};

		_this.authenticate = function(password){
			return _this.properties.password === password;
		};

		_this.getUserFromDB = function(){
			var promise = new Promise;
			var context;

			console.log('Handling login request:');

			var jsonSearch={};
			if(_this.properties.email && _this.properties.password){
				jsonSearch['email'] = _this.properties.email;
				var givenPassword = _this.properties.password;
				context = 'user/pass';
			}
			else{
				if(_this.properties.accessToken){
					jsonSearch['accessToken'] = _this.properties.accessToken;
					context = 'token';
				}
				else{
					promise.reject('must have provide an email/password or an access token');
				}
			}

			userModel.findOne(jsonSearch, function(err, user) {
	        	for(var path in this.schema.paths)
	        	{
	        		if(user[path] !== undefined)
	        		{
	        			_this.properties[path] = user[path];
	        		}
	        	}
	        	if(!user){
	        		promise.reject('user does not exist');
	        	}
				if (err) {
	                return next(err)
	            }
	            else{
					if (_this.authenticate(givenPassword) || context ==  'token') {
						//if they gave a password and made it this far, we create a new token and fulfill promise.
						// if they provided us a token, we don't want to write a new token to db- just fulfill promise
						// too many mongodb writes == bad
						if(givenPassword)
						{
							_this.updateAccessToken().then(function(token) {
								promise.fulfill(token);
		                	});
						}
						else{
							promise.fulfill(_this.properties.accessToken);
						}
		                
		            } else {
		                promise.reject('passwords do not match');
		            }
		        }
	        });


	 		return promise;
		};

		_this.update = function (req, res){
			var promise = new Promise;
			userModel.findById(req.params.id, function (err, user) {
				console.log('update user request recieved');
				
				user.fName = req.query.fName;
				user.lName = req.query.lName;
				user.email = req.query.email;
				user.password = req.query.password;
				user.wantsEmail = req.query.wantsEmail;
				return user.save(function (err) {
					if (!err) {
						console.log("updated");
					} else {
						promise.error(err);
						console.log(err);
					}
					promise.fulfill();
				});
			});
			return promise;
		};

		_this.create = function(){
			var promise =  new Promise;

			var propertiesAreSet = true;
			//verify that everything is in place before adding it to the DB
			for(property in _this.properties){
				if(!_this.properties[property] && property != 'points')
				{
					propertiesAreSet = false;
				}
			}
			if(!propertiesAreSet){
				promise.reject('one of the user properties is not set. All of them must be set.');
			}


			//create a new userModel to save to the DB
			var newUser = new userModel(_this.properties);
			newUser.save(function(err){
				if(err){
					//general error catch
					promise.reject('there was an issue saving this user, please try again');
				}
				if(!err)
				{
					//if there is no error then everything worked! You can return the accessToken so that it can get sent along
					promise.fulfill(_this.properties.accessToken);
				}
			});

			return promise;
		};

		_this.placeOrder = function(){

		};

		_this.getPastOrders = function(){

		};

		init(properties);
	}
};

/*----------------------ENDPOINTS TO BE PUT INTO A DIFFERENT PAGE-------------------------*/
/* = function(app) {
    app.post('/login', function(req, res){ 
    	console.log(userModel);
    	possibleUser = new users({'email':req.query.email, 'password': req.query.password});
    	possibleUser.getUserFromDB().then(
	    	function(){
	    		return res.status(200).send(possibleUser.properties.accessToken);
	    	},
	    	function(){
	    		return res.status(400).send(err);
	    	}
    	);
    });


    app.post('/createUser', function(req, res) {
        var createUser = req.query;

        var token = Token.newToken();

    	var newUser = new users(
    		{
    			'email' : createUser.email,
    			'password' : createUser.password,
    			'fName' : createUser.fName,
    			'lName' : createUser.lName,
    			'wantsEmail' : createUser.wantsEmail,
    			'isLunchAdmin' : createUser.isAdmin,
    			'accessToken' : token
    		}
    	);
    	console.log(newUser);
    	newUser.create()
    	.then(
    	function( token){
    		return res.status(200).send(token);
    	},
    	function(reason){
    		return res.status(404).send(reason);
    	});

    });
	

	app.get('/getUserData/:token', function(req, res, next) {
        var token = req.params.token;
        console.log(token);
        var possibleUser= new users({'accessToken':token});
        console.log(possibleUser);
        possibleUser.getUserFromDB().onFulfill(function(){
        		res.send(possibleUser.properties);
     	})
     	.onReject(function(reason){
     			console.log(reason);
        		return res.status(404).send("Token not associated with a user.  Please try logging back in.");
        });
    });
	

	app.put('/updateUser/:id', function (req, res){
		console.log(req);
		return user.findById(req.params.id, function (err, user) {
			console.log('update user request recieved');
			
			user.fName = req.query.fName;
			user.lName = req.query.lName;
			user.email = req.query.email;
			user.password = req.query.password;
			user.wantsEmail = req.query.wantsEmail;
			return user.save(function (err) {
				if (!err) {
					console.log("updated");
				} else {
					console.log(err);
				}
				return res.status(200);
			});
		});
	});	    
};
*/