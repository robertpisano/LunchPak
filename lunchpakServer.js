/*instantiates all the necessary confgurations such as */


var express = require('express'),
	app = module.exports = express(),
	authentication = require('./modules/expressAuthentication'),
    mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/local');
mongoose = require('./modules/models.js')(mongoose);


app.use(express.static(__dirname + "/public"));

require('./modules/router.js')(app, mongoose);

app.listen(52221);
console.log("Started server on port 52221");

/*//Example usage of ExpressAuthentication
app.get('/withAuth', function(req, res, next){
    res.send("UH OH DIDNT GET HERE.");
});
app.get('/withoutAuth', authentication.NOAUTH, function(req, res, next){
    res.send("SMOOTH CRUISING");
});

authentication.applyAuthentication(app, function checkAuthentication(req, res, next) {
    //TODO Put real authorization logic in here
	

  //VVVV Don't forget to change back to false  
  authorized = true; //Perform a real check to see if request is authenticated. Like check the header for a token?
    if (!authorized) {
        return res.status(401).send({
            message: 'Unauthorized'
        });
    }
    console.log("Authenticating user with token", req.headers.token);
    next();
});
*/


