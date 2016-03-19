var express = require('express'),
    mongoose = require('mongoose'),
	MongoDb = require("mongodb"),
    Schema = mongoose.Schema,
    ObjectID = MongoDb.ObjectID,
    fs = require("fs");
	
var uploadMenuSchema = new Schema({
	restaurantName : String,
	menuImage : { type: Buffer}
});

var Menu = mongoose.model('theMenus', uploadMenuSchema, 'Menus');

module.exports = function (app){
// Routes
// list all pdfMenus
app.get("/pdfMenus", function (req, res) {
    pdfMenu.findAll(function (error, results) {
        if (error) {
            res.json(error, 400);
        } else if (!results) {
            res.send(404);
        } else {
            var i = 0, stop = results.length;

            for (i; i < stop; i++) {
                results[i].image = undefined;
            }

            res.json(results);
        }
    });
});

// get the JSON representation of just one pdfMenu
app.get("/pdfMenu/:id", function (req, res) {
    pdfMenu.findById(req.params.id, function (error, result) {
        if (error) {
            res.json(error, 400);
        } else if (!result) {
            res.send(404);
        } else {
            result.image = undefined;
            res.json(result);
        }
    });
});

// get the image of a particular pdfMenu
app.get("/pdfMenu/:id/image", function (req, res) {
    pdfMenu.findById(req.params.id, function (error, result) {
        if (error) {
            res.json(error, 400);
        } else if (!result || !result.imageType || !result.image || !result.image.buffer || !result.image.buffer.length) {
            res.send(404);
        } else {
            res.contentType(result.imageType);
            res.end(result.image.buffer, "binary");
        }
    });
});

// save/update a new pdfMenu
app.post("/pdfMenu", function (req, res, next) {
	console.log('recieved post for a new menu');
    var input = req.body;
	console.log(input);
    if (!input.retaurant) {
        res.json("restaurant must be specified when saving a new pdfMenu", 400);
        return;
    }

    pdfMenu.save(input, req.files.image, function (err, objects) {
        if (err) {
            console.log(err);
			res.json(error, 400);
        } else if (objects === 1) {     //update
            input.image = undefined;
            res.json(input, 200);
        } else {                        //insert
            input.image = undefined;
            res.json(input, 201);
        }
    });
});
}
/////////////////////////////////////////////////////////////////////

exports.findAll = function (callback) {
    db.collection("pdfMenus", function (err, collection) {
        collection.find().toArray(callback);
    });
};

exports.findById = function (id, callback) {
    db.collection("pdfMenus", function (error, collection) {
        collection.findOne({_id: new ObjectID(id)}, callback);
    });
};

exports.save = function (input, image, callback) {
    input.date = new Date();
    if (input._id) {
        input._id = new ObjectID(input._id);
    }

    if (image && image.length) {
        var data = fs.readFileSync(image.path);
        input.image = new MongoDb.Binary(data);
        input.imageType = image.type;
        input.imageName = image.name;
    }

    db.collection("pdfMenus", function (error, collection) {
        collection.save(input, {safe: true}, callback);
    });
};