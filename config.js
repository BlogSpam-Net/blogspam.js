//
//  This is the configuratin file for the blogspam.js server.
//
//  It contains settings which are loaded by plugins, and isn't
// used to control how the server operates in any other fashion.
//
//         i.e. The config is only loaded by (some) plugins
//              not by the server.
//
//
// Steve
// --
//




var config = {}

//
//
//  Blacklisted Names
//
//
config.name_blacklist = [
    "beats\\s+by\\s+dr",
    "Nike\\s+Air.*Sale",
    "rolex\\s+watch",
    "erectile\s+dysfunction",
    "^wholesale\s+iphone",
    "^buy.*backlinks",
    "Vuitton",
    "online\\s+pharmacy",
    "\\s+cialis",
    "cialis\\s+",
    "\\s+handbags",
    "^good\\s+info$",
    "insurance",
    "online\\s+casino",
    "^Cheap\\s+Fake",
    "^Cheap\\s+Fake",
    "air\\s+jordan",
    "Jordans\\s+cheap",
    "cheap\\s+sneakers",
    "cheap\\s+jordans",
    "veste\\s+moncler",
    "moncler\\s+outlet",
    "moncler\\s+sale",
    "black\\s+friday",
    "Canada\\s+Goose",
    "cheap\\s+nfl",
    "nfl\\s+jersey",
    "car\\s+insuran",
    "auto\\s+insuran",
    "UGG.*Outlet",
    "^free.*samples$",
    "Ralph\\s+Lauren",
    "^buy.*fake",
    "Beats\\s+By\\s+Dre",
    "^botanical\\s+slimming",
    "^vintage\\s+casino",
    "casion\\s+poker$",
    "^Oakley\\s+Sunglasses$",
    "^gucci\\s+outlet\\s+stores",
    "^cheap.*for\\s+sale$",
    "\\s+viagra",
    "viagra\\s+",
    "\\s+Outlet\\s+Store$",
    "clearance\\s+sale",
    "sale\\s+for\\s+cheap",
    "^fake\\s+",
    "louis\\s+vuitton",
    "\\s+outlet$",
    "\\s+Ugg\\s+Boots",
    "^cheap\\s+",
    "^uggs\\s+",
    "weight\\s+loss",
    "child\\s+porn",
];


//
//  Blacklisted subjects.
//
config.subject_blacklist = [
    "^authentic.*jerseys",
    "^cheap.*wholesale",
    "^Jordans\\s+for\\s+Cheap",
    "^Cheap\\s+Jordans",
    "Jordans\\s+cheap",
    "^cheap\\s+ugg\\s+boots",
    "^cheap\\s+nfl\\s+jerseys",
    "^Chanel\\s+handbags",
    "^uggs\\s+boots\\s+",
    "kids ugg boots on clearance",
    "^ugg\\s+classic",
    "factory\\s+outlet",
    "Canada\\s+Goose",
    "clearance\\s+sale",
    "sale\\s+for\\s+cheap",
    "^fake\\s+",
    "louis\\s+vuitton",
    "\\s+outlet$",
    "viagra",
];


//
//  Module stuffs
//
module.exports = config;

