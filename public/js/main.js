'use strict';

var LP_MKII = angular.module("LP_MKII", [
    'ngRoute',
    'lpControllers'
]);

LP_MKII.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/home', { //home will basically be the login screen
                templateUrl: 'partials/lpHome.html',
                controller: 'lpHomeCtrl'
            })
            .when('/ordering', {
                templateUrl: 'partials/lpOrdering.html',
                controller: 'lpOrderCtrl'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }
]);

LP_MKII.config(['$httpProvider',
    function($httpProvider) {
        LP_MKII.httpProvider = $httpProvider;
    }
]);

LP_MKII.factory('User', function() {
    var user = {
        email: "",
        password: ""
    };
    return user;
});

LP_MKII.factory('Order', function() {
    var Order = {
        person: "Guest",
        food: {},
        notes: [{
            note: "no mayo"
        }, {
            note: 'another example'
        }]
    };
    return Order;
});

LP_MKII.factory('ASearch', function() {
    var ASearch = {
        query: "",
        results: []
    };
    return ASearch;
});

LP_MKII.factory('Lunch', function() {
    var Lunch = {};

    //past and peer are left hardcoded for now
    Lunch.past = [{
        when: "10/12/2013",
        order: "Burger, fries",
        copies: 3
    }, {
        when: "10/8/2013",
        order: "Pizza",
        copies: 2
    }, {
        when: "10/11/2013",
        order: "Bagel, cream cheese",
        copies: 1
    }];

    Lunch.peer = [{
        name: "Cheryl",
        order: "Szechuan Chicken, White Rice",
        copies: 4
    }, {
        name: "Pam",
        order: "Bear Claw",
        copies: 2
    }, {
        name: "Cyril",
        order: "Stir Fry",
        copies: 0
    }];
    return Lunch;
})
