
var config = {}

//
//  Blacklisted Names
//
//  We don't want to be too strict here, but even so ..
//
config.name_blacklist = [
    "Nike\\s+Air.*Sale",
    "cheap\\s+viagra",
    "rolex\\s+watch",
    "generic\\s+cialis",
    "^cheap.*insurance",
    "erectile\s+dysfunction",
    "^wholesale\s+iphone",
    "^car\s+insurance\s+quotes",
    "^buy.*backlinks",
    "Vuitton",
    "insurance",
    "online\\s+casino",
    "fake.*sale$",
    "^Cheap\\s+Fake",
    "air\\s+jordan",
    "cheap\\s+sneakers",
    "cheap\\s+jordans",
    "veste\\s+moncler",
    "moncler\\s+outlet",
    "moncler\\s+sale",
    "black\\s+friday",
    "Fake\\s+Oakley",
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
    "handbags\\s+outlet",
    "^cheap.*for\\s+sale$",
    "^best\\s+insurance\\s+quotes",
    "Generic\\s+viagra",
    "\\s+Outlet\\s+Store$",
];


//
//  We don't want to be too strict here, but even so ..
//
config.subject_blacklist = [
    "^authentic.*jerseys",
    "^cheap.*wholesale",
    "^Jordans\\s+for\\s+Cheap",
    "^Cheap\\s+Jordans",
    "^cheap\\s+ugg\\s+boots",
    "^cheap\\s+nfl\\s+jerseys",
    "^Chanel\\s+handbags",
    "^uggs\\s+boots\\s+",
    "kids ugg boots on clearance",
    "^ugg\\s+classic",
    "factory\\s+outlet",
];

//
//  Module stuffs
//
module.exports = config;


console.log( "LOADED CONFIG");