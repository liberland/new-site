var router = require("express").Router();

function genPugOptions(req) {
    return (
        req.session.username ? {
            deviceType: req.deviceType,
            username: req.session.username
        } : {
            deviceType: req.deviceType
        }
    );
}

router.get("/", (req, res) => {
    res.render(req.language + "/info/index.pug", genPugOptions(req)).end();
});

router.get("/about", (req, res) => {
    res.render(req.language + "/info/about.pug", genPugOptions(req)); //Render the file.
    res.end();
});

router.get("/constitution", (req, res) => {
    res.render(req.language + "/info/constitution.pug", genPugOptions(req)).end(); //Render the file.
});

router.get("/contact", (req, res) => {
    res.render(req.language + "/info/contact.pug", genPugOptions(req)).end(); //Render the file.
});

router.get("/finances", (req, res) => {
    res.render(req.language + "/info/finances.pug", genPugOptions(req)).end(); //Render the file.
});

router.get("/laws", (req, res) => {
    res.render(req.language + "/info/news.pug", genPugOptions(req)).end(); //Render the file.
});

router.get("/news", (req, res) => {
    res.render(req.language + "/info/news.pug", genPugOptions(req)).end(); //Render the file.
});

module.exports.router = router;
