var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    expressSanitizer = require("express-sanitizer"),
    twit = require("twit"),
    passport = require('passport'),
    Strategy = require('passport-twitter').Strategy,
    session = require('express-session'),
    MongoStore = require('connect-mongo').default,
    app = express();

//CONNECTION TO DATABASE
mongoose.connect("mongodb://localhost/tweepsbookapp", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
}).then(function () {
    console.log("Connected to DB");
}).catch(function (err) {
    console.log("ERROR:", err.message);
});

//TOKENS
var T = new twit({
    consumer_key: 'byiphhH8THY87ADDYvTv8Upl8',
    consumer_secret: 'EpV1XVnyLBiZkbUP8E6UzPoGmek4i48jDxmo77HEUKIvArh2tg',
    // access_token: '718377211447930880-WFxtj2PVaaPjyqKIBggUgXeOAw5eqdd',
    // access_token_secret: 'ijMq2HcUoW3DOuxdg01uWrwQXY900oK7vrgomVtHfTGCw',
    access_token: '1350865466340741120-9aHn3REe4EzC1LrQkIqTfjY2Q3DyEX', //tweepsbookapp
    access_token_secret: '9T4TlmJmDP1ahaEIo5e0U2EEVqVGd6WWlPtSGv3e0ElpB', //tweepsbookapp
    timeout_ms: 60 * 1000,
})

//MIDDLEWARES
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'whatever',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost/tweepsbookapp" }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14 //14 Days
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    console.log(req.session)
    console.log(req.user)
    next();
})

//MONGOOSE MODEL CONFIF/SCHEMA
var userSchema = mongoose.Schema({
    email: String,
    profile: String,
    name: String,
    id: String,
    tweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet"
    }]
})
var User = mongoose.model("User", userSchema);

var tweetsSchema = mongoose.Schema({
    status: String,
    tag: String
})
var Tweet = mongoose.model("Tweet", tweetsSchema);

//OBJECTS
var bmTweet = {
    status: String,
    tag: String
};

var newUser = {
    email: String,
    profile: String,
    name: String,
    id: String
}

var params = {
    status: String,
    in_reply_to_status_id: String,
    auto_populate_reply_metadata: Boolean
}

//REQUESTS
passport.use(new Strategy({
    consumerKey: 'byiphhH8THY87ADDYvTv8Upl8',
    consumerSecret: 'EpV1XVnyLBiZkbUP8E6UzPoGmek4i48jDxmo77HEUKIvArh2tg',
    // requestTokenURL: 'https://api.twitter.com/oauth/request_token?x_auth_access_type=read',
    includeEmail: true,
    callbackURL: '/twitter/return',
    proxy: true
}, function (token, tokenSecret, profile, cb) {
    newUser.id = profile.id;
    newUser.email = profile.emails[0].value;
    newUser.name = profile.displayName;
    newUser.profile = profile.photos[0].value;
    User.find({ id: profile.id }, function (err, user) {
        if (user.length === 0) {
            User.create(newUser);
            console.log("User created.");
        }
    })
    return cb(null, profile);
}));

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (userID, cb) {
    User.find({ id: userID })
        .then(function (user) {
            // console.log(user)
            cb(null, user);
        }).catch(function (err) {
            cb(err)
        })
});

app.get('/login/twitter',
    passport.authenticate('twitter'));

app.get('/twitter/return',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    }
);

app.get('/', function (req, res) {
    res.send('<h1>Hi there!</>')
});

var stream = T.stream('statuses/filter', { track: ['@tweepsbookapp bookmark'] });
stream.on('tweet', function (tweet) {
    T.get('statuses/oembed', { id: tweet.in_reply_to_status_id_str }, function (err, data, response) {
        bmTweet.status = data.html;
    })
    T.get('statuses/show', { id: tweet.id_str }, function (err, data, response) {
        bmTweet.tag = data.text.split(" ")[data.text.split(" ").length - 1];
        bmTweet.tag = bmTweet.tag.toLowerCase();
        User.find({ id: data.user.id_str }, function (err, user) {
            if (user.length === 0) {
                params = {
                    status: 'Hey, you have not registered with us. Hence we are unable to bookmark the tweet you requested. Please register on our website to bookmark better 🤖. https://offf.to/tweepsbookapp',
                    in_reply_to_status_id: tweet.id_str,
                    auto_populate_reply_metadata: true
                }
            } else {
                console.log(bmTweet);
                Tweet.create(bmTweet, function (err, tweet) {
                    if (err) {
                        console.log(err);
                    } else {
                        user[0].tweets.push(tweet);
                        user[0].save();
                    }
                })
                params = {
                    status: 'Hey, we have bookmarked the tweet your asked for. You can check the same in your dashboard. Thank you for using our service 🤖.',
                    in_reply_to_status_id: tweet.id_str,
                    auto_populate_reply_metadata: true
                }
            }
        }).then(function () {
            T.post('statuses/update', params, function (err, data, response) { })
        })
    })
})

app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});