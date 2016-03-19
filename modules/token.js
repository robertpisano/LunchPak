var Token = function(){
   _this=this;

   _this.newToken = function() {
	    var chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
	    token = new Date().getTime() + '_';
	    for (var x = 0; x < 16; x++) {
	        var i = Math.floor(Math.random() * 62);
	        token += chars.charAt(i);
	    };

	    return token;
    };
};

module.exports = new Token;