const urlHelper = require('../../helpers/url')

/**
 * Basic middleware that populates some user state data so that every template can access it, if needed.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports = (req, res, next) => {
    if (process.env.GOOGLE_ANALYTICS_ID) {
        res.locals.gaId = process.env.GOOGLE_ANALYTICS_ID;
        res.locals.gaUrl = 'https://www.googletagmanager.com/gtag/js?id=' + res.locals.gaId;
    }
    if (process.env.REV_URL) {
        res.locals.enableRev = true;
        res.locals.revUrl = process.env.REV_URL;
        res.locals.revTag1 = process.env.REV_TAG_1;
        res.locals.revTag2 = process.env.REV_TAG_2;
    }

    // User state storage.
    res.locals.userState = {};
    if (req.user) {
        res.locals.userState.isLoggedIn = typeof req.user.id !== 'undefined';
        res.locals.userState.isRegistered = typeof req.user.username !== 'undefined';
        res.locals.userState.username = req.user.username;
    }

    // Stylesheet and JavaScript URL.
    res.locals.stylesheetUrl = urlHelper.getCacheBustedUrl('/stylesheets/style.css');
    res.locals.javascriptUrl = urlHelper.getCacheBustedUrl('/javascripts/bundle.js');
    next();
};