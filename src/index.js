
const index = (app) => {
    "use strict";

    app.get('/board', (req, res, next) => {
        return res.render('./views/board.html', {});
    });
    app.get('/pieces', (req, res, next) => {
        return res.render('./views/pieces.html', {});
    });

    app.get('/credits', (req, res, next) => {
        return res.render('./views/credits.html', {});
    });
};

export default index;