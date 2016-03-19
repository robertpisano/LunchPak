//calls the necessary classes and returns the proper results to the user
module.exports = function(app, mongoose){
    
    var orders = require('./orders.js')(app, mongoose);
    var search = require('./restaurants.js')(app, mongoose);
    var users = require('./users.js')(app, mongoose);
    var menu = require('./menu.js')(app, mongoose);
    var emailer = require('./emailer.js')(app, mongoose);
    var menuModel = mongoose.models.menuModel,
        metaInfoModel = mongoose.models.metaInfoModel,
        uploadMenuModel = mongoose.models.uploadMenuModel,
        userModel = mongoose.models.userModel,
        restaurantModel = mongoose.models.restaurantModel,
        orderModel =  mongoose.models.orderModel;


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
    	user.findById(req.params.id, function (err, user) {
    		console.log('update user request recieved');
    		
    		user.fName = req.query.fName;
    		user.lName = req.query.lName;
    		user.email = req.query.email;
    		user.password = req.query.password;
    		user.wantsEmail = req.query.wantsEmail;
    		user.save(function (err) {
    			if (!err) {
    				console.log("updated");
    			} else {
    				console.log(err);
    			}
    			return res.status(200);
    		});
    	});
    });	 

    /*-----------------------------orders-------------------------------*/
    app.get("/viewUsers", function(req, res) {
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
    });   

    /*------------------------------metaInfo------------------------*/

    app.get('/getMeta', function(req,res) {
        var d = new Date();
        var weekDayNum = d.getDay();
        var weekday;
    
        switch(weekDayNum) {
        case 0 :
            weekday = 'Sunday';
            break;
        case 1 :
            weekday = 'Monday';
            break;  
        case 2 :
            weekday = 'Tuesday';
            break;
        case 3 :
            weekday = 'Wednesday';
            break;
        case 4 :
            weekday = 'Thursday';
            break;
        case 5 :
            weekday = 'Friday';
            break;
        case 6:
            weekday = 'Saturday';
            break;
        }

        var todaysMetaData = { priceLimit : 0, restaurants: [] };
        metaInfoModel.findOne({}, 'priceLimit', function(err, data) {
            todaysMetaData.priceLimit = data.priceLimit;
            restaurantModel.find({'days': weekday}, 'name menuID', function(err, data) {
                if(!err){
                    console.log(data);
                    todaysMetaData.restaurants = data;
                    return res.send(todaysMetaData);
                }
            });
        });
    });


    /*------------------------------Orders----------------------------------*/
    app.get("/viewUsers", function(req, res) {
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
    });

    /*--------------------search--------------------------------------------*/

    app.post('/searchQuery', function(req, res) {
        var name = req.query.query;
        console.log( "name , " + name);

        Menu.find({'name': name}, 
            function(err, menu) {
            console.log(menu);
            res.send(menu);
        });
    });
        
    app.get('/searchMyOrders/:person', function(req, res) {
        var person = req.params.person;
        console.log("request to search old orders by "+person);

        oderModel.find({
            'person': person
        }, function(err, orders) {
            console.log(orders);
            res.send(orders);
        });
    });

    

    app.post('menu/new', function(req, res) {
        var newItem = req.query;

        var theItem = new menuModel({
            name: newItem.name,
            tags: newItem.tags,
            price: newItem.price
        });

        theItem.save(function(err) {
            if (err) throw err;
            console.log("order saved");
            res.send("got the order");
        });
    });

    app.get('/user/:token/orders/search', function(req, res) {
        /*var person = req.params.person;
        console.log("request to search old orders by "+person);

        oderModel.find({
            'person': person
        }, function(err, orders) {
            console.log(orders);
            res.send(orders);
        });*/
        res.send('');
    });

    app.post('/user/:token/orders/place'), function(req, res){

    });
};