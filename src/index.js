
const index = (app) => {
    "use strict";

    app.get('/analysis', (req, res, next) => {
        return res.render('./views/game-analysis.html', {});
    });
    app.get('/basics', (req, res, next) => {
        return res.render('./views/chess-basics.html', {});
    });
    // app.get('/pieces', (req, res, next) => {
    //     return res.render('./views/pieces.html', {});
    // });
    // app.get('/board', (req, res, next) => {
    //     return res.render('./views/board.html', {});
    // });
    app.get('/about', (req, res, next) => {
        return res.render('./views/about.html', {});
    });

    app.get('/credits', (req, res, next) => {
        return res.render('./views/credits.html', {});
    });
};

export default index;