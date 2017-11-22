module.exports = {
    genRouter: (pages) => {
        //Create a new router.
        var router = require("express").Router();

        //Load the index file to the site root.
        router.get("/", (req, res) => {
            //Render the file.
            res.render(req.language + "/info/index.pug", {deviceType: req.deviceType});
        });

        //Load every other page to their respective spots.
        pages.forEach((page) => {
            router.get("/" + page, (req, res) => {
                res.render(req.language + "/info/" + page + ".pug", {deviceType: req.deviceType});
            });
        });

        return router;
    }
};
