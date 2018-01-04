## Technology Involved:

The new site is a NodeJS Express server. It uses express-session to keep track of users, MySQL (MariaDB) to store data, Pug to render pages, and SASS for improved CSS.

NodeJS isn't monolithic like Apache and doesn't use PHP to handle data, which was made as a toy language and only maintained with security updates, that are hacks upon hacks, because they're needed for the safety as the web.

express-session means we don't have to roll out our own cookie based system for having an user be logged in.

MySQL is 'standard' and widely applicable to many things, including what we need. We can guarantee stability with it, and via using MariaDB versus MySQL Server, we get many speed benefits, lowering the advantage of a NoSQL system.

Pug makes it easy to render for different device types, has a cleaner syntax than HTML, and is very fast. It also allows us to quickly insert data into a page and include a single file that can be the page 'frame' (that has the stylesheets and defines the topbar/sidebar).

SCSS is just nice.