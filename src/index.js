
const index = (app) => {
    "use strict";

    app.get('/analysis', (req, res, next) => {
        return res.render('./views/analysis.html', {});
    });
    app.get('/chess-basics', (req, res, next) => {
        return res.render('./views/chess-basics.html', {});
    });
    app.get('/pieces', (req, res, next) => {
        return res.render('./views/pieces.html', {});
    });
    app.get('/board', (req, res, next) => {
        return res.render('./views/board.html', {});
    });

    app.get('/credits', (req, res, next) => {
        return res.render('./views/credits.html', {});
    });
};

export default index;