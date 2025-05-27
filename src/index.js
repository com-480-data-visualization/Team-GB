
const index = (app) => {
    "use strict";

    app.get('/pieces', (req, res, next) => {
        return res.render('./views/pieces.html', {});
    });
};

export default index;