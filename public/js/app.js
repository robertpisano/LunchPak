angular.module("lpApp", [
	'ui.router'
])
.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider
		//takes care of redirects, for now will just set default url if the url is invalid
		.otherwise('/');
	
	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'templates/home.html',
			controller: 'lpHomeCtrl',
			onEnter: function($http, $rootScope, metaModel) {
				$http({method: 'GET', url: '/getMeta'})
				.success(function(data){
					$rootScope.metaModel = data;
					console.log($rootScope.metaModel);
				})
				.error(function(data, status, headers, config){
					console.log("failed to acquire restaurants");
					console.log(data, status, headers, config);	
				});
			}
		})
		.state('order', {
			abstract: true,
			//abstract will do about what it implies, cant be
			//used on its own, but its children inherit things
			// *just added, not working*
			url: '/order',
			templateUrl: 'templates/order.html',
			controller: ['$scope', '$state',
				function ($scope,   $state) {
		                //$scope.contacts = contacts;
				}
			]
			//the controller isn't quite working, just added
			//abstract in an attempt to make it better
		})
		.state('order.search', {
			url: '',
			templateUrl: 'templates/order.search.html',
			controller: 'lpOrderCtrl'
		})
		.state('order.results', {
			url: '/results',
			templateUrl: 'templates/order.results.html',
			controller: 'lpOrderCtrl',
		})
		.state('order.customize', {
			url: '/customize',
			templateUrl: 'templates/order.customize.html',
			controller: 'lpOrderCtrl'
		})
		.state('order.confirmed', {
			url: '/confirmed',
			templateUrl: 'templates/order.confirmed.html'
		})
		.state('order.add',  {
			url: '/add', 
			templateUrl: 'templates/order.add.html',
			controller: 'lpAddCtrl'
		})
		.state('order.add.name', {
			url: '/name',
			templateUrl: 'templates/order.add.name.html',
			controller: 'lpAddCtrl'
		})
		.state('order.add.restaurant', {
			url: '/restaurant',
			templateUrl: 'templates/order.add.restaurant.html',
			controller: 'lpAddCtrl',
			onEnter: function($http, $rootScope, metaModel) {
				$http({method: 'GET', url: '/getMeta'})
				.success(function(data){
					$rootScope.metaModel = data;
					console.log($rootScope.metaModel);
				})
				.error(function(data, status, headers, config){
					console.log("failed to acquire restaurants");
					console.log(data, status, headers, config);	
				});
			}
		})
		.state('order.add.price', {
			url: '/price',
			templateUrl: 'templates/order.add.price.html',
			controller: 'lpAddCtrl'
		})
		/*.state('order.add.options', {
			url: '/options',
			templateUrl: 'templates/order.add.options.html',
			controller: 'lpAddCtrl'		
		})
		.state('order.add.ingredients', {
			url: '/ingredients',
			templateUrl: 'templates/order.add.ingredients.html',
			controller: 'lpAddCtrl'		
		})*/
		.state('order.add.tag', {
			url: '/tag',
			templateUrl: 'templates/order.add.tag.html',
			controller: 'lpAddCtrl'		
		})
		.state('login', {
			//this should not require validation
			url: '/login',
			templateUrl: 'templates/login.html',
			controller: 'lpLoginCtrl'
		}) 
		.state('newUser', { 
			url: '/newUser',
			templateUrl: 'templates/newUser.html',
			controller: 'lpNewUserCtrl'
		})
		.state('myAccount', {
			url: '/myAccount',
			templateUrl: 'templates/myAccount.html',
			controller: 'editAccountCtrl'
		})
		.state('editOrder', {
			url: '/editOrder',
			templateUrl: 'templates/editOrder.html'
		})
		.state('admin', {
			abstract: true,
			url: '/admin',
			templateUrl: 'templates/admin.html',
			controller: 'lpAdminCtrl'
		})
		.state('admin.home', {
			url: '',
			templateUrl: 'templates/admin.home.html',
			controller: 'lpAdminCtrl'
		})
		.state('admin.orders', {
			url: '/showorders',
			templateUrl: 'templates/admin.orders.html',
			controller: 'lpAdminCtrl'
		})
		.state('admin.editRestaurants', {
			url: '/editRestaurants',
			templateUrl: 'templates/admin.editRestauants.html'
		})
		.state('createUser', { 
			//this should not require validation
			url: '/createUser',
			templateUrl: 'templates/createUser.html',
			controller: 'createUserCtrl'
		})
		.state('forgotPassword', { 
			//this should not require validation
			url: '/forgotPassword',
			templateUrl: 'templates/forgotPassword.html'
		})
		.state('uploadMenu', { 
			url: '/uploadMenu',
			templateUrl: 'templates/admin.uploadMenu.html',
			controller: 'uploadMenuCtrl'
		})
	; // end $stateProvider
})
.run(function($rootScope, $state, $http, authenticationService) {

	[ '$rootScope', '$state', '$stateParams',
		function ($rootScope, $state, $stateParams) {
			$rootScope.$state = $state;
			$rootScope.$stateParams = $stateParams;
		}
	]
	//check if token is in local storage, set isValidated flag accordingly
	authenticationService.initializeAuthentication()
		.then(function(token){
			console.log("this fucking token given is " + token);
			$rootScope.isValidated = true;
			$http({method: 'GET', url: '/getUserData/'+authenticationService.getToken()})
			.success(function(data){
				console.log("user data grabbed automatically");
				sessionStorage.setItem("userData", angular.toJson(data)); //throw the user data in session storage
				$state.go('home'); //app will always go to home on refresh (unless its forced to /login, ofc) 
			})
			.error(function(data, status, headers, config){
				console.log("Failed to automatically fetch user data from the server.  You should probably re-log in");
				console.log(data, status, headers, config);
				$state.go('login'); //stored token is bad, so let's let them try to log in again
			});
	});
	
	//this checks the isValidated flag on page change, redirects if it isnt present
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
		console.log("state changed from "+fromState.url+" to "+toState.url);
		if (toState.url != '/login' && toState.url != '/createUser' && toState.url != '/forgotPassword') {
			//no infinite loops pls
			if (!authenticationService.isAuthenticated()) {
				console.log("token missing, redirecting to /login");
				event.preventDefault();
				alert("you are not logged in!");
				$state.go('login');
			} 
		}
		
		var user = localStorage.getItem('userData');
		console.log(user);
		if(toState.url == '/admin' && user.isAdmin == false) {
			event.preventDefault();
			$state.go('home');
		}
	})
	
})

.controller('lpHomeCtrl', function($rootScope, $scope, $state, userModel, hasOrdered, orderModel, authenticationService){
	$scope.hasOrdered = hasOrdered;
	$scope.userModel = userModel;
	$scope.orderModel = orderModel;
	$scope.userModel = angular.fromJson(sessionStorage.getItem('userData'));
	$scope.orderModel = angular.fromJson(sessionStorage.getItem('orderData'));
	$scope.hasOrdered = angular.fromJson(sessionStorage.getItem('hasOrdered'));

	this.logOut = function() {
		localStorage.removeItem('userToken');
		sessionStorage.removeItem('userData');
		sessionStorage.removeItem('orderData');
		sessionStorage.removeItem('hasOrdered');
		authenticationService.unAuthenticate();
		$state.go('login');
	}

	return $scope.lpHomeCtrl = this;
})
.controller('lpLoginCtrl', function($rootScope, $scope, $http, $state, userModel, authenticationService){
	$scope.userModel = userModel;
	this.checkUser = function() {
		console.log('checkUser fired');
		tempLoginData = {
			email : userModel.email,
			password : userModel.password
		};
		console.log("tempLoginData: ", tempLoginData);
		if( tempLoginData.email != '' && tempLoginData.password != ''){
			var promise = authenticationService.authenticate(tempLoginData)
			promise.then(function(){
						$http({method: 'GET', url: '/getUserData/'+authenticationService.getToken()})
						.success(function(data){
							console.log("user data grabbed automatically");
							sessionStorage.setItem("userData", angular.toJson(data)); //throw the user data in session storage
							//$state.go('home'); //app will always go to home on refresh (unless its forced to /login, ofc) 
						})
						.error(function(data, status, headers, config){
							console.log("Failed to automatically fetch user data from the server.  You should probably re-log in");
							console.log(data, status, headers, config);
							//$state.go('login'); //stored token is bad, so let's let them try to log in again
						});
					})
					.then(function(){
						$state.go('home');	
					},function(statusMessage){
						alert(statusMessage);
					}
				);
		} else {
			alert('fill out email and password');
		}
	}
	return $scope.lpLoginCtrl = this;
})
.controller('createUserCtrl', function($scope, $http, $state, userModel){
	$scope.userModel = userModel;
	this.sendUser = function() {
		console.log("sendUser fired, userModel -> ");
		console.log(userModel);
		if( userModel.fName !='' && userModel.lName !='' && userModel.password !='' && userModel.email !='' /* && pass1 === pass 2*/){
			$http({method: 'POST', url: '/createUser', params: userModel}) //this gets to the server, but not the database
			.success(function(data){
				alert('Account generation successful!  Please log in');
				$state.go('login');
			})
			.error(function(data, status, headers){
				alert("whoops, submission failed");
				console.log("something brokes!");
				console.log(data, status, headers);
			});
		}
	}

	return $scope.createUserCtrl = this;
})
.controller('editAccountCtrl', function($scope, $http, $state, userModel){
	$scope.userModel = angular.fromJson(sessionStorage.getItem('userData'));
	console.log($scope.userModel);
	this.updateUser = function() { 
		theParams = {
			id : $scope.userModel._id,
			fName : $scope.userModel.fName,
			lName : $scope.userModel.lName,
			email : $scope.userModel.email,
			password : $scope.userModel.password,
			wantsEmail : $scope.userModel.wantsEmail
		}
		console.log(theParams);
		$http({method: 'PUT', url: '/updateUser/'+$scope.userModel._id, params: theParams}) //this gets to the server, but not the database
		.success(function(data){
			alert('Account changes successful!');
			$state.go('home');
		})
		.error(function(data, status, headers){
			alert("Account changes failed");
			console.log("something brokes!");
			console.log(data, status, headers);
		});
	}
	return $scope.editAccountCtrl = this;
})
///////////////////////////////////////////////////////////////////////////////////
.controller('uploadMenuCtrl', function($scope, $http){
	$scope.menuName = '';
	this.uploadMenu = function() { 
		$http({method: 'POST', url: '/pdfMenu', params: { restaurant : $scope.menuName } })
		.success(function(data){
			alert('Uploaded Succesfully!');
		})
		.error(function(data, status, headers){
			alert("Uploading failed");
			console.log(data, status, headers);
		});
	}
	return $scope.uploadMenuCtrl = this;
})
///////////////////////////////////////////////////////////////////////////////////

//  ---------Order stuff---------------
.controller('lpOrderCtrl', function($scope, $q, $http, $state, orderModel, userModel, hasOrdered, $rootScope){	
	$scope.orderModel = orderModel;
	$scope.userModel = userModel;
	$scope.hasOrdered = hasOrdered;
	
	this.fireSearch = function() {
		if(orderModel.query === ''){
			alert('please enter a search query');
		} else {	
			tempOrderInfo = {
				query: orderModel.query,
				restaurants: $rootScope.metaModel.restaurants
			};
			console.log("fireSearch for: "+tempOrderInfo);
			$http({method: 'POST', url: '/searchQuery', params: tempOrderInfo})
			.success(function(data){
				if (typeof data !== 'undefined' && data.length > 0) { //if array is not empty
					orderModel.results = data;
					$state.go('^.results');
				} else {
					alert("no results for that query!");
				}
			})
			.error(function(data, status, headers, config){
				console.log("something brokes!");
				console.log(data, status, headers, config);
			});
		}		
	}
	this.findOldOrders = function() {
		console.log('findOldOrders fired');
		$http({method: 'GET', url: '/searchMyOrders/'+userModel.email})  //not sure if userModel.email will always work.
		.success(function(data){
			if (typeof data !== 'undefined' && data.length > 0) { //if array is not empty
				console.log(data);
				orderModel.results = data;
				$state.go('^.results');
			} else {
				console.log(data);
				alert("you dont have any past orders");
			}
		})
		.error(function(data, status, headers, config){
			console.log("something brokes!");
			console.log(data, status, headers, config);
		});
	}
	this.chooseItem = function(index) {
		orderModel.currentOrder.foodName = orderModel.results[index].name;
		delete orderModel.currentOrder['__v']; //we don't want these to be sent in the order
		delete orderModel.currentOrder['_id'];
		orderModel.currentOrder.restaurantName = 'LunchPak';//orderModel.results[index].restaurant;
		$state.go('^.customize');
	}
	this.removeNote = function(index) {
		orderModel.currentOrder.notes.splice(index, 1);
	}
	this.newNote = function() {
		orderModel.currentOrder.notes.push({note:""});  
	}
	
	this.fireOrder = function() {
		if(orderModel.currentOrder === {} ){
			alert("there's no menu item selected for the order?  How did you do that?");
		} else {	
			//add on identifying tags and token
			tempUserData = angular.fromJson(sessionStorage.getItem('userData'));
			orderModel.currentOrder.fName = tempUserData.fName;
			orderModel.currentOrder.lName = tempUserData.lName;
			orderModel.currentOrder.email = tempUserData.email;
			
			//prep everything for its adventure to the server
			console.log("sending the order!");
			console.log(orderModel.currentOrder);
			console.log(angular.toJson(orderModel.currentOrder));
			
			$http({method: 'POST', url: '/order', params: orderModel.currentOrder})
			.success(function() {
				alert("order successfully posted!");
				sessionStorage.setItem("orderData", angular.toJson(orderModel));
				sessionStorage.setItem("hasOrdered", true);
			})
			.error(function(data, status){
				console.log(data, status);
				alert("order failed! please try again");
			});
		}
	}
	return $scope.lpOrderCtrl = this;	
})
//--------------end of Order Stuff----------------

.controller('lpAdminCtrl', function($scope, $http, $location, adminModel, $state) {
	$scope.adminModel = adminModel;
	this.lockOrders = function() {
		//will prevent anyone from posting an order for the rest of the day 
		//maybe this should be automated and not a button or whatever; and I'm not sure how this would be implemented.  
	}
	this.sendWarning = function() {
		$http({method: 'GET', url: '/sendWarning'});//this will send out an email warning to all users who both have not ordered yet, and are subscribed to email events
	}
	this.getAllOrders = function() { 
		console.log('getting all orders now...');
		$http({method: 'GET', url: '/viewOrders'})
		.success(function(data){
			console.log(data, status);
			adminModel.allOrders = data;
			$state.go('admin.orders');
		})
		.error(function(data, status, headers, config){
			console.log("something brokes!");
			console.log(data, status, headers, config);
		});
	}
	this.viewAllOrders = function () {
		this.getAllOrders();
		//go to viewAllOrders.html  **NOT a route, this is an html file on the same level as index
		//maybe keep state by saving it to localstorage?
	}
	this.uploadNewMenu = function () {
		//this is handled entirely by the directive and service below, yay
	}
	
	return $scope.lpAdminCtrl = this;
})

.factory('orderModel', function(){
	var orderModel= {
		query: '',  //holds search query, or the preconstructed query from the panels
		currentOrder : {  //holds a reference to the item in results, and notes on it for your order		
			fName: '',
			lName: '',
			foodName : '',
			restaurantName : '',
			notes: [ { note : '' }],
			
		},
		results : [],  //holds an array of menu items gotten after search
	}
	return orderModel;
})

.factory('userModel', function() {
	var userModel = {
		fName: '',
		lName: '',
		password: '',  //still not sure how this will be stored
		email: '',
		//skipping achievement and point stuff for now
		isAdmin: false, 
		//skipping exclusions for now
		wantsEmail: false
	}
	return userModel;
	//add stuff from the user schema
	//this will be used for adding a new user as well
})

.factory('hasOrdered', function() {
	var hasOrdered;
	return hasOrdered;
})

.factory('wizbiz', function() {
	var wizbiz = {  //used for /add,
			name: '',
			price: 0.00,
			tags: [ ],
			restaurantID : ''
	}
	return wizbiz;
})


.factory('metaModel', function($rootScope) {

	var metaModel = $rootScope.metaModel;
	return metaModel;
})

.factory('adminModel', function() {
	var adminModel = {
		restaurants: [], // stores detailed information on all the restaurants, so it can be edited
		allOrders: []
	}
	return adminModel;
})

.controller('lpAddCtrl', function($scope, wizbiz, metaModel, $state, $http) {
	$scope.wizbiz = wizbiz;
	this.fireAdd = function() {
		//first validate all the bits of the new item
		if(wizbiz.name === '') {
			alert("enter a name for the item, please");
		} else {
			if(wizbiz.price == 0.00) {
				alert("enter a price for the item, please");
			} else {
				if(wizbiz.restaurantID == '')
				{
					alert("please select the restaurant");
				}
				else{
					console.log("adding Item: ");
					console.log(wizbiz);
					//it's technically alright if tags/options are empty
					$http({method: 'POST', url: '/newMenuItem', params: wizbiz})
					.success(function(status){
						alert("Your item was successfully added, please place your order now!");
						$state.go('order.search')
					})
					.error(function(data, status, headers, config){
						console.log("failed to add! try again!");
						console.log(data, status, headers, config);
					});
				}	
			}
		}
	}

	this.removeOption = function(index) {
		wizbiz.options.splice(index, 1);
	}
	this.newOption = function() {
		wizbiz.options.push({name:"", optionType:"", values:""});  //make sure to push objects, not just strings!
	}
	
	this.removeIngredient = function(index) {
		wizbiz.ingr.splice(index, 1);
	}
	this.newIngredient = function() {
		wizbiz.ingr.push({name:""});  //make sure to push objects, not just strings!
	}

	$scope.selectItem = function (selectedItem) {
		_($scope.shoppingList).each(function (item) {
			item.selected = false;
			if (selectedItem === item) {
				selectedItem.selected = true;
			}
		});
	};
	
	return $scope.lpAddCtrl = this;
})

;
