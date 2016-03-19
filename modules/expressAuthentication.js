function ExpressAuthentication() {
    var applyAuthenticationInterceptor = function applyAuthenticationInterceptor(route, authenticationHandler) {
        if (!authenticationNotRequired(route)) {
            if (!authenticationHandler)
                console.error(ExpressAuthentication.name, "No authentication handler provided for endpoint", route);

            route.callbacks.splice(0, 0, authenticationHandler);
        }
    };

    var authenticationNotRequired = function authenticationNotRequired(route) {
        for (var i = 0; i < route.callbacks.length; i++) {
            if (route.callbacks[i].name === ExpressAuthentication.prototype.NOAUTH.name) {
                return true;
            }
        }
        return false;
    }

    this.applyAuthentication = function(app, authenticationHandler) {
        for (var verb in app.routes) {
            var routes = app.routes[verb];
            routes.forEach(function(route) {
                applyAuthenticationInterceptor(route, authenticationHandler);
            });
        }
    };
};

ExpressAuthentication.prototype.NOAUTH = function NOAUTH(req, res, next) {
    req.NOAUTH = true;
    next();
};

module.exports = new ExpressAuthentication();
