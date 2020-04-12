// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var morgan = require('morgan');
const isImageUrl = require('is-image-url');

// configure app to use bodyParser()
// this will let us get the data from a POST

// set the static folder
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json

var port = process.env.PORT || 5000; // set our port

var mongoose = require('mongoose');
mongoose.connect('mongodb://joma:sexyj0ma@ds255253.mlab.com:55253/thumb-dev', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


var Thumb = require('./thumb');

const youtubedl = require('youtube-dl');


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

router.use(function(req, res, next) {
    // do logging
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});

// more routes for our API will happen here
router.route('/thumbs')
    // create a thumb (accessed at POST http://localhost:8080/api/thumbs)
    .post(handlePostThumbs)
    // get all the thumbs (accessed at GET http://localhost:8080/api/thumbs)
    .get(handleGetThumbs);

// more routes for our API will happen here
router.route('/imgs')
    // create a thumb (accessed at POST http://localhost:8080/api/thumbs)
    .post(handlePostThumbsImgs)

function handlePostThumbs(req, res) {
    youtubedl.getInfo(req.body.url, function(err, info) {
        console.log(info);
        if (err) {
            console.log("youtube-dl error")
            res.status(409).send(err);
            console.log(err)
        }
        else if (!('webpage_url' in info && 'title' in info && 'thumbnail' in info)) {
            console.log("youtube-dl error, no thumbnail")
            res.status(409).send(err);
        }
        else {
            createNewThumb(req,res,info);
        }
    });
};

function createNewThumb(req, res, info) {
    Thumb.findOne({
        url: info.webpage_url
    }, function(err, thumb) {
        console.log(thumb);
        if (err) {
            res.status(409).send(err);
        } else if (thumb) {
            res.status(409).json({error: "Thumb already exists"});
        } else {
            var thumb = new Thumb(); // create a new instance of the thumb model
            thumb.url = info.webpage_url; // set the thumbs name (comes from the request)
            thumb.rating = 1400;
            thumb.title = info.title
            thumb.img = info.thumbnail
            thumb.save(function(err) {
                console.log("saving thumb");
                if (err)
                    res.status(409).send(err);
                else {
                  handleGetThumbs(req,res);
                }
            });
        }
    });
}

function handlePostThumbsImgs(req, res) {
  if (!isImageUrl(req.body.img)) {
    console.log("url not an image")
    res.status(409).json({error: "URL not an image"});
  } else {
    Thumb.findOne({
        title: req.body.title,
        img: req.body.img
    }, function(err, thumb) {
        if (err) {
            res.status(409).send(err);
        } else if (thumb) {
            res.status(409).json({error: "Thumb already exists"});
        } else {
            var thumb = new Thumb(); // create a new instance of the thumb model
            thumb.rating = 1400;
            thumb.title = req.body.title
            thumb.img = req.body.img
            thumb.save(function(err) {
                console.log("saving thumb");
                if (err)
                    res.status(409).send(err);
                Thumb.find(function(err, thumbs) {
                    if (err)
                        res.status(409).send(err);
                    res.json(thumbs);
                });
            });
        }
    });
  }
};

function handleGetThumbs(req, res) {
    Thumb.find().sort({
        "rating": -1
    }).exec(function(err, thumbs) {
        if (err)
            res.status(409).send(err);
        res.json(thumbs);
    });
};

router.route('/thumbs/:thumb_id')

    // get the thumb with that id (accessed at GET http://localhost:8080/api/thumbs/:thumb_id)
    .get(function(req, res) {
        thumb.findById(req.params.thumb_id, function(err, thumb) {
            if (err)
                res.status(409).send(err);
            res.json(thumb);
        });
    })

    .put(function(req, res) {

        // use our thumb model to find the thumb we want
        Thumb.findById(req.params.thumb_id, function(err, thumb) {

            if (err)
                res.status(409).send(err);

            thumb.rating = req.body.rating; // update the thumbs info

            // save the thumb
            thumb.save(function(err) {
                if (err)
                    res.status(409).send(err);

                res.json({
                    message: 'Thumb updated!'
                });
            });

        });
    })
    .delete(function(req, res) {
      Thumb.remove({ _id: req.params.thumb_id }, function(err) {
          if (!err) {
                  handleGetThumbs(req,res);
          }
          else {
                res.status(409).send(err);
          }
      });

    });

router.route('/match')

    // get the thumb with that id (accessed at GET http://localhost:8080/api/thumbs/:thumb_id)
    .get(function(req, res) {
        Thumb.estimatedDocumentCount().exec(function(err, count) {

            // Get a random entry
            var random = Math.floor(Math.random() * count)

            // Again query all users but only fetch one offset by our random #
            Thumb.findOne().skip(random).exec(
                function(err, thumb1) {
                    if (err)
                        res.status(409).send(err);
                    var random2 = Math.floor(Math.random() * count)
                    var i = 0
                    while (random2 == random) {
                        random2 = Math.floor(Math.random() * count);
                        i++;
                        if (i > 100) {
                            return res.json({});
                        }
                    }
                    Thumb.findOne().skip(random2).exec(
                        function(err2, thumb2) {
                            if (err2)
                                res.send(err2);
                            res.json({
                                match: [thumb1, thumb2]
                            });
                        });
                });
        });
    })
    .post(function(req, res) {

        function getRatingDelta(myRating, opponentRating, myGameResult) {
            if ([0, 0.5, 1].indexOf(myGameResult) === -1) {
                return null;
            }

            var myChanceToWin = 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));

            return Math.round(32 * (myGameResult - myChanceToWin));
        }

        function getNewRating(myRating, opponentRating, myGameResult) {
            return myRating + getRatingDelta(myRating, opponentRating, myGameResult);
        }

        // use our thumb model to find the thumb we want
        Thumb.findById(req.body.win._id, function(err, thumb1) {
            if (err)
                res.send(err);
            thumb1.rating = getNewRating(thumb1.rating, req.body.lose.rating, 1); // update the thumbs info
            // save the thumb
            thumb1.save(function(err) {
                if (err)
                    res.send(err);
                Thumb.findById(req.body.lose._id, function(err, thumb2) {
                    if (err)
                        res.send(err);
                    thumb2.rating = getNewRating(thumb2.rating, req.body.win.rating, 0); // update the thumbs info
                    // save the thumb
                    thumb2.save(function(err) {
                        if (err)
                            res.send(err);
                        Thumb.estimatedDocumentCount().exec(function(err, count) {

                            // Get a random entry
                            var random = Math.floor(Math.random() * count)

                            // Again query all users but only fetch one offset by our random #
                            Thumb.findOne().skip(random).exec(
                                function(err, thumb1) {
                                    if (err)
                                        res.send(err);
                                    var random2 = Math.floor(Math.random() * count);
                                    var i = 0;
                                    while (random2 == random) {
                                        random2 = Math.floor(Math.random() * count);
                                        i++;
                                        if (i > 100) {
                                            return res.json({});
                                        }
                                    }
                                    Thumb.findOne().skip(random2).exec(
                                        function(err2, thumb2) {
                                            if (err2)
                                                res.send(err2);
                                            res.json({
                                                match: [thumb1, thumb2]
                                            });
                                        });
                                });
                        });
                    });
                });
            });

        });
    });



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// FRONT END -------------------------------
app.get('/', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/result', function(req, res) {
    res.sendfile('./public/result.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/add', function(req, res) {
    res.sendfile('add.html'); // load the single view file (angular will handle the page changes on the front-end)
});



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

