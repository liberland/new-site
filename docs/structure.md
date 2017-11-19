## Structure:

The site should use Express Routers for sections. For example, the account section would have a page for the user info and a merit log, with the router loaded as /account. The router would have the GET route for /info give Pug of an account's info. This way, we can have compartmentalization, with every part getting what they need, and clean code, as the related routes are in a file and not spread out/cluttering the main file.

As every page needs a language set so the server can grab a template, and a deviceType to know how to render the template, an Express middleware provides this info. Each req has a "language" property and "deviceType" property. The first denotes what folder to render a page from (en, cz...). The second should always be passed to Pug.

There should be just two sections at the start. Account (/account) and Info (/). In the future, we may add in a news section and a forum section. These Sections belong in /routers.

All pages should be in /public, under their relevant language, under their relevant section. There's only three pages that should be out of a section:

- 404.pug: Displays when an invalid page was requested.

- base.pug: All pug files, in a section, should include this file. It includes critical UI components.

- langAgnosticBase.pug: Included by all base.pug files. This file is outside not just a section but also a language as it's language agnostic. This includes the CSS and JS the UI would need, and defines the head, but doesn't create the UI itself (as that requires labels).

 Web pages should get any dynamic data they need for their page via res.render, in their relevant section's router. The client-server communication, after the page and assets are loaded, should be limited to JSON POST requests to enter data (account info, a forum post...).

/docs will have the docs for the site. It will not have details on the code. That's why comments exist. Instead, it will have info on design choices, how things are laid out, and how to run the site.

Configuration variables should go in /settings.json.

/main.js should be touched as little as possible.
