var authenticationService = angular.module('lpApp')
    .service('authenticationService', ['$rootScope', '$http', '$q',
        function(rootScope, http, q) {
            var isAuthenticated = false;
            this.storeAuthentication = function(data) {
                isAuthenticated = true;
                localStorage.setItem('userToken', data);
                http.defaults.headers.common['token'] = data;
            };
            this.isAuthenticated = function() {
                return isAuthenticated;
            };
            this.getToken = function() {
                return localStorage.getItem('userToken');
            };
	    this.unAuthenticate = function() {
			isAuthenticated = false;
	    };
            this.authenticate = function(params) {
                console.log("the params are" + JSON.stringify(params));
                var deferred = q.defer(),
                    scope = this;
                http({
                    method: 'POST',
                    url: '/login',
                    params: params
                })
                    .success(function(data) {
                        scope.storeAuthentication(data);
                        console.log("Token from login" + data);
                        deferred.resolve(data);
                    })
                    .error(function(data, status, headers) {
                        var statusMessage = ""
                        switch (status) {
                            case 404:
                                statusMessage = 'Login failed: Email not found';
                                break;
                            case 401:
                                statusMessage = 'Login failed: Unknown error';
                                break;
                            default:
                                statusMessage = 'Login failed: No response from server';
                        }
                        deferred.reject(statusMessage);
                    });

                return deferred.promise;
            };
            this.initializeAuthentication = function() {
                //TODO For now initializeAuthentication sets isAuthenicated true given the presence of a token. 
                //Promise here is unecessary, but we might want to rethink this strategy and use eventing to know when to getUserData
                var deferred = q.defer()

                var token = this.getToken();
                if (token) {
                    isAuthenticated = true;
                    http.defaults.headers.common['token'] = token;
                    deferred.resolve(token);
                } else {
                    isAuthenticated = false;
                    deferred.reject();
                }

                return deferred.promise;
            };
        }
    ]);
authenticationService.$inject = ['$rootScope', '$http', '$q'];
