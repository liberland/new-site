//Require everything we need.

//Node STDLib requires.
var https = require("https");
var http = require("http");
var fs = require("fs"); //Needed to load the certificates and see if a page exists.
var path = require("path");

//Express requires.
var express = require("express"); //Web server.
var helmet = require("helmet"); //Security layer.
var compression = require("compression"); //Compresses pages to save bandwith.
var device = require("express-device"); //Gets the device type.
var session = require("express-session"); //Stores data for each user.

//Custom requires.
//var accountRouter = require("./routers/account.js").router; //Not needed for now.
var infoRouter = require("./routers/info.js").router;

//GeoIP.
var geoip = require("geoip-lite"); //Library to get the user's location.

//Load the settings.
var settings = JSON.parse(fs.readFileSync("./settings.json"));

//Create the server and configure it.
var siteServer = express();
siteServer.set("etag", false); //Disable etag as it leaks system info.
siteServer.set("view engine", "pug"); //Set the view engine to Pug.
siteServer.set("views", path.join(__dirname, "public")); // Set Pug to work off the public files.

//Add middleware.
siteServer.use(helmet({ //Add in helmet for security.
    hsts: false, //Disable HSTS. We can try to make sure no data is sent over a bad certificate but we can't let the site go down.
    expectCt: true
}));
siteServer.use(compression()); //Enable page compression.
siteServer.use(device.capture()); //Add in device recognition.
siteServer.use(express.json()); //Add in the JSON body parser so we can handle POST data.
siteServer.use(session({ //Enable session for tracking user's language and who they're logged in as.
    secret: settings.session.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}));

//Save the language of the user and their device type to req.language/req.deviceType.
siteServer.use((req, res, next) => {
    if (req.session.language) { //If the language is already is set...
        req.language = req.session.language; //Set it.
    } else if (req.ip.includes("127.0.0.1") ||  //Else, if it's a local IP...
        req.ip.includes("localhost") ||
        req.ip.substr(0, 3) === "192" ||
        req.ip === "::1") {
        req.session.language = "en"; //Use "en".
        req.language = "en";
    } else { //Else, get the country the user is in and go through each language to see what language that country is assigned to.
        var countryCode = geoip.lookup(req.ip).country.toLowerCase();
        for (var lang in settings.languages) {
            if (settings.languages[lang].indexOf(country) > -1) {
                req.session.language = lang;
                req.language = lang;
            }
        }

        if (!(req.language)) { //If req.language is still not set, default to "en".
            req.session.language = "en";
            req.language = "en";
        }
    }

    switch (req.device.type) {
        case "desktop": //Most popular option. Putting this first will save CPU cycles.
            req.deviceType = "desktop";
            break;

        case "tablet":
            req.deviceType = "tablet";
            break;

        case "phone":
            req.deviceType = "phone";
            break;

        default: //If it's unrecognized (car/bot), just give data like it's for the most popular platform (desktop).
            req.deviceType = "desktop";
            break;
    }

    next();
});

//Add in CSS, JS, and images. These should be language agnostic.
siteServer.use("/css", express.static(path.join(__dirname, "public", "css")));
siteServer.use("/js", express.static(path.join(__dirname, "public", "js")));
siteServer.use("/images", express.static(path.join(__dirname, "public", "images")));

//Add in the various routers.
//siteServer.use("/account", accountRouter);
siteServer.use("/", infoRouter);

siteServer.get("*", (req, res) => { //Capture every GET route not already handled.
    res.status(404).render(req.language + "/404.pug"); //Send a 404 page.
});

siteServer.use(errorFix); //Use errorFix (defined below). errorFix is hopefully never called but the server must NOT crash.

https.createServer({ //Create an HTTPS server.
    key: fs.readFileSync(settings.ssl.key), //Set the SSL key.
    cert: fs.readFileSync(settings.ssl.cert) //Set the SSL cert.
}, siteServer).listen(443); //Listen on the HTTPS port.

function errorFix(err, req, res, next) { //Try/catch safety wrapper.
    try {
        if (res.headersSent) {
            return next(err);
        }
    } catch(e) {
        console.log(e);
    }
}

//----------------------------------------

var httpRedirect = express(); //Create a new web server for redirecting port 80 requests to 443.
httpRedirect.set("etag", false);
httpRedirect.use(helmet({
    hsts: false,
    expectCt: true
}));
//No compression as it would be minimally helpful yet take up CPU cycles.

httpRedirect.get("*", (req, res) => { //Catch all page requests.
    res.redirect("https://" + req.headers.host + req.originalUrl); //Redirect to the HTTPS version of the page.
});

httpRedirect.use(errorFix); //Also use errorFix.

http.createServer(httpRedirect).listen(80); //Listen on the HTTP port.
