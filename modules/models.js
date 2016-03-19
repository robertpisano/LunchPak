module.exports = function(mongoose){
	Schema = mongoose.Schema;

	var isEmpty = function(object){
		var counter=0;
		for(var x in object){
			counter++;
		}
		return counter>0 ? false : true;
	}

	//a check to make sure that user schemas/models don't get redifined. 
	//All definitions of models/schemas should occurr here.
	if(!isEmpty(mongoose.models)){
		return null;
	}

	var userSchema = new Schema({
		fName : { type : String, required : true },
		lName : { type : String, required : true },
		password : { type : String, required: true},
		email : { type : String, required: true, unique: true },
		achievements : [{name: String}],
		rank : String,
		isLunchAdmin : Boolean,
		wantsEmail : Boolean,
		accessToken : { type : String } // Used for Remember Me
	});

	var orderSchema = new Schema({
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
	});

	var restaurantSchema = new Schema({
			name : String,
			days : [{day : String}],
			description: String,
			theirUrl: String,
			phone: String,
			menuListId: String
	});


	var menuSchema = new Schema({
		name : {type : String, required : true},
		price: {type : Number},
		extras : [String],
		tags : [String],
		menuOptions : [{
			name: { type: String},
			optionType: {type : String},
			values: [{ type : String }]
		}], 
		restaurant: {
				name: {type: String, required: true},
				id: Number
		}

	});

	var metaInfoSchema = new Schema({
		globalReccomendations : [{type : String}],
		lockoutTime : Number,
		priceLimit : {type : Number}
	});

	var uploadMenuSchema = new Schema({
		restaurantName : String,
		menuImage : Buffer
	});

	var models = {

		menuModel : mongoose.model('menuModel', menuSchema, 'Menu'),

		metaInfoModel : mongoose.model('metaInfoModel', metaInfoSchema, "MetaInfo"),

		uploadMenuModel : mongoose.model('uploadMenuModel', uploadMenuSchema, 'uploadedMenu'),

		userModel : mongoose.model('userModel', userSchema, 'users'),

		restaurantModel : mongoose.model('restaurantModel', restaurantSchema, 'Restaurants'),

		orderModel : mongoose.model('ordersModel', orderSchema, 'Orders')

	
	};


	return mongoose;

};