//
//  This is a configuration file which contains several
// global settings and configuration values which are used
// by some of the plugins.
//
// Steve
// --
//




var config = {}

config.domain_blacklist = [
    "xberi.net",
    "xbob.info",
    "zzggx.com",
    "xlov.info",
    "xsoxo.net",
];


//
//
//  Blacklisted Names
//
//
config.name_blacklist = [
    "cash\\s+advance",
    "beats\\s+by\\s+dr",
    "Nike\\s+Air.*Sale",
    "rolex\\s+watch",
    "erectile\s+dysfunction",
    "^wholesale\\s+",
    "^buy\\s+",
    "Vuitton",
    "^seo\\s+plugin$",
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
    "Beats\\s+By\\s+Dre",
    "^botanical\\s+slimming",
    "^vintage\\s+casino",
    "casion\\s+poker$",
    "casion\\s+affiliate$",
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
    "^horny$",
    "Internet\\s+Marketing$",
];


//
//  Blacklisted subjects.
//
config.subject_blacklist = [
    "^authentic.*jerseys",
    "^cheap.*wholesale",
    "^buy\\s+",
    "^wholesale\\s+",
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
    "^seo\\s+plugin$",
];



//
//  The port number the server will use.
//
config.server_port = 9999;


//
//  The details of our redis-server
//
config.redis_host = "127.0.0.1";
config.redis_port = 6379;


//
//  Module stuffs
//
module.exports = config;

