"use strict";
import express from 'express';
import hbs from 'hbs';
import useragent from 'express-useragent';
import path from 'path';
import index from './index.js';

/**
 * Create an express application
 */
const app = express();

console.log(`Starting up web server...`);

try {
    // Remove default x-powered-by response header
    app.disable("x-powered-by");    
    /**
     * Set app view engine + handlebars middleware (to enable server rendered html)
     * + Parse user-agent information from the request headers
     */
    app.set('view engine', 'html');
    app.engine('html', hbs.__express);  // CVE-2021-32822
    app.set('views', './public');
    app.use(useragent.express());
    app.use(express.static('./public'));


    app.get('/', (req, res, next) => {
        return res.render('./index.html', {});
    });

    index(app);


    app.get('/robots.txt', function (req, res) {
        res.type('text/plain');
        // return res.send("User-agent: *\nAllow: /");
        return res.sendFile(path.resolve('./robots.txt'));
    });

    app.get('/sitemap.xml', function (req, res) {
        res.type('application/xml');
        return res.sendFile(path.resolve('./sitemap.xml'));
    });

    app.get('*', (req, res) => {
        return res.status(404).render('./404.html');
    });

    const port = process.env.PORT ? null : 8080;
    process.env.ORIGIN = `https://${process.env.HOSTNAME}`;

    const server = app.listen(port || process.env.PORT, () => {
        console.log('Server started in HTTP');
        console.log('Your app is listening on host ' + JSON.stringify(server.address()));
        console.log('Your app is listening on port ' + server.address().port);
    });
    
} catch (error) {
    console.log(`--Caught--${error}`);
    process.exit(1);
} finally {
    process.on('SIGINT' || 'exit', async () => {
        console.log('Server is shutting down...');
        process.exit(0);
    });
    // Uncaught Exception is when you throw an error and did not catch anywhere.
    process.on('uncaughtException', async (error) => {
        console.loglog(`--uncaughtException--${error}`);
        process.exit(1);
    });
    // Unhandled promise rejection is similar, when you fail to catch a Promise.reject.
    process.on('unhandledRejection', async (reason, promise) => {
        console.log(`--unhandledRejection--${reason}`);
        process.exit(1);
    });
}