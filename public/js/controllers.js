'use strict';

var lpControllers = angular.module('lpControllers', []);

lpControllers.controller('lpHomeCtrl', function LpHomeCtrl($scope, $http, User, Order, $location) {
    $scope.user = User;
    this.checkUser = function() {
        $http.post('/login', User)
            .success(function(data) {
            	var token = data;
                //TODO Fire an event that login was successful and let the "authentication service" deal with setting the token etc
                LP_MKII.httpProvider.defaults.headers.common.token = token;
                
                $location.path('/ordering');
            })
            .error(function(data, status, headers, config) {
                switch (status) {
                    case 401:
                        $scope.errorMessage = "Invalid Password";
                        break;
                    case 404:
                        $scope.errorMessage = "Please enter a valid email";
                        break;
                    default:
                        $scope.errorMessage = "Bad things happened. Like Jonathan let the server go down or something";
                        break;
                }
            });
        Order.person = User.email;

    }
    return $scope.lpHomeCtrl = this;
});

lpControllers.controller('lpOrderCtrl', function lpOrderCtrl($scope, $http, ASearch, Order) {
    $scope.ASearch = ASearch;
    $scope.Order = Order;
    this.fireSearch = function() {
        if (ASearch.query === '') {
            alert('please enter a search query');
        } else {
            $scope.showResultsBox = true;
            $scope.showSearchBox = false;
            console.log("Gonna try to search for: " + ASearch.query);
            $http({
                method: 'GET',
                url: '/search/' + ASearch.query
            }).
            success(function(data) {
                ASearch.results = data;
            });
        }
    }
    this.chooseResult = function(index) {
        console.log('chose ' + ASearch.results[index].name);
        Order.food = ASearch.results[index];
        //Order.food.name = ASearch.results[index];
        //Order.name = Order.food.name;
        $scope.showOrderBox = true;
        $scope.showResultsBox = false;
    }
    this.fireOrder = function() {
        if (Order.food === {}) {
            alert("there's no food item selected for the order?  How did you do that?");
        } else {
            // show a confirmation box, maybe listing all the days orders?
            //$scope.showSearchBox=false;
            console.log("sending the order!");
            console.log(Order);
            var tmpOrderData = {
                name: Order.food.name,
                note: Order.notes[0].note,
                person: Order.person
            }
            console.log(tmpOrderData);
            $http.post('/order', tmpOrderData)
                .success(function(response) {
                    alert("order successfully posted!");
                })
                .error(function(data, status, headers, config) {
                    console.log(arguments);
                    console.log(headers);
                });
            alert("order successfully posted!");
        }
    }
    this.removeNote = function(index) {
        Order.notes.splice(index, 1);
    }
    this.newNote = function() {
        Order.notes.push({
            note: ""
        }); //make sure to push objects, not just strings!
    }
    this.addToOrder = function() {
        alert("ordered! not really.");
    }

    return $scope.lpOrderCtrl = this;
});

lpControllers.controller('PastCtrl', function($scope, Lunch) {
    $scope.lunch = Lunch;
    return $scope.PastCtrl = this;
});

lpControllers.controller('PeerCtrl', function($scope, Lunch) {
    $scope.lunch = Lunch;
    return $scope.PeerCtrl = this;
});
