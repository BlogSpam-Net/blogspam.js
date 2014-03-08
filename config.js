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
    "da-r.com",
];


//
//
//  Blacklisted Names
//
//
config.name_blacklist = [
    "payday\\s+loans",
    "cash\\s+advance",
    "beats\\s+by\\s+dr",
    "Nike\\s+Air",
    "barbour\\s+jacket",
    "rolex\\s+watch",
    "erectile\s+dysfunction",
    "^wholesale\\s+",
    "^buy\\s+",
    "Vuitton",
    "online\\s+pharmacy",
    "\\s+cialis",
    "cialis\\s+",
    "^cialis$",
    "\\s+handbags",
    "^good\\s+info$",
    "insurance",
    "online\\s+casino",
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
    "monster\\s+beats",
    "^botanical\\s+slimming",
    "^vintage\\s+casino",
    "Generic\\s+levitra",
    "casion\\s+poker$",
    "casion\\s+affiliate$",
    "^Oakley\\s+Sunglasses$",
    "fake\\s+Oakley",
    "^gucci\\s+outlet\\s+stores",
    "^cheap.*for\\s+sale$",
    "\\s+levitra\\s+",
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
    "^seo\\s+",
    "^seo$",
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
    "monster\\s+beats",
    "factory\\s+outlet",
    "Canada\\s+Goose",
    "clearance\\s+sale",
    "sale\\s+for\\s+cheap",
    "^fake\\s+",
    "louis\\s+vuitton",
    "\\s+outlet$",
    "viagra",
    "^seo\\s+",
    "^seo$",
    "barbour\\s+jacket",
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

