//THIS IS FOR TESTING ON A LOCAL MACHINE. IT RUNS WITH NO SSL OVER PORT 80.
//IT ALSO DOESN'T INCLUDE THE HTTP REDIRECT SETUP OR GEOIP LOOKUP.
//(COULD DO PORT 79->80 TO PROVE IT WORKS BUT IT WON'T BREAK OVER TIME AND WORKS NOW)
//(GEOIP WON'T WORK ON A LOCAL IP; WILL AUTO TO "EN")
//DO NOT DEPLOY THIS ANYWHERE.

//Require everything we need.

//Node STDLib requires.
var http = require("http");
var fs = require("fs"); //Needed to load the certificates and see if a page exists.
var path = require("path");

//Express requires.
var express = require("express"); //Web server.
var helmet = require("helmet"); //Security layer.
var compression = require("compression"); //Compresses pages to save bandwith.
var device = require("express-device"); //Gets the device type.
var session = require("express-session"); //Stores data for each user.

//CSS.
var sass = require("node-sass");
var cssMin = new (require("clean-css"))({
    level: 2,
    compatibility: "ie8"
});

//GeoIP.
var geoip = require("geoip-lite"); //Library to get the user's location.

//Custom requires.
//var accountRouter = require("./routers/account.js").router; //Not needed for now.
var info = require("./routers/info.js");

//Load the settings.
var settings = JSON.parse(fs.readFileSync("./settings.json"));

//Compile the SCSS.
function compileSCSS() {
    //Get all the SCSS files.
    fs.readdir(path.join(__dirname, "public", "scss"), async (err, files) => {
        //Go through each.
        files.forEach(async (scssFile) => {
            //Compile the SCSS.
            sass.render({
                file: path.join(__dirname, "public", "scss", scssFile),
            }, async (err, sassRes) => {
                    //Save the CSS.
                    fs.writeFile(
                        path.join(__dirname, "public", "css", (scssFile.split(".")[0] + ".css")),
                        cssMin.minify(sassRes.css.toString()).styles,
                        async ()=>{}
                    );
            });
        });
    });
    
    //Compile every hour.
    setTimeout(compileSCSS, 60*60*1000);
}
compileSCSS();

//Create the server and configure it.
var siteServer = express();
siteServer.set("etag", false); //Disable etag as it leaks system info.
siteServer.set("view engine", "pug"); //Set the view engine to Pug.
siteServer.set("view options", {debug: true}); //Enable Pug debugging.
siteServer.set("views", path.join(__dirname, "public")); //Set Pug to work off the public files.

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
    } else {
        req.session.language = "en"; //Use "en".
        req.language = "en";
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

//Setup and add in the various routers.
//siteServer.use("/account", account.router);
siteServer.use("/", info.genRouter(settings.info.pages));

siteServer.get("*", (req, res) => { //Capture every GET route not already handled.
    res.status(404).render(req.language + "/404.pug"); //Send a 404 page.
});

siteServer.use(errorFix); //Use errorFix (defined below). errorFix is hopefully never called but the server must NOT crash.

function errorFix(err, req, res, next) { //Try/catch safety wrapper.
    try {
        if (res.headersSent) {
            return next(err);
        }
    } catch(e) {
        console.log(e);
    }
}

http.createServer(siteServer).listen(8080); //Listen on the HTTP port.
