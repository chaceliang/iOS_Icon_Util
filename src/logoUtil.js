
var config = {
	icon: {
		"icon1024.png": 1024,
		"icon.png": 57,
    "icon@2x.png": 114,
    "icon-60.png": 60,
    "icon-60@2x.png": 120,
    "icon-72.png": 72,
    "icon-72@2x.png": 144,
    "icon-76.png": 76,
    "icon-76@2x.png": 152,
    "icon-Spotlight-iOS7.png": 40,
    "icon-Spotlight-iOS7@2x.png": 80,
    "icon-Spotlight.png": 50,
    "icon-Spotlight@2x.png": 100,
    "icon-Small.png": 29,
    "icon-Small@2x.png": 58,
	},
	launch: {
  	"Default.png": [320, 480],
    "Default@2x.png": [640, 960],
    "Default-568h@2x.png": [640, 1136],
    "Default-Portrait~ipad.png": [768, 1024],
    "Default-Portrait@2x~ipad.png": [1536, 2048],
    "Default-Landscape@2x~ipad.png": [2048, 1536],
    "Default-Landscape~ipad.png": [1024, 768],
  },
  minSize: 1100,
  maxSize: 1500,
};

var fs = require("fs");
var cp = require("child_process");
var path = require("path");

var cwd = process.env.PWD;

var iconImg = null,
		launchImg = null,
		bgColor = "rgba(0, 0, 0, 1)";
var landscape = false,
		portrait = true;
var outputDir = path.normalize(cwd + "/output/");

var iconP = "-icon:",
		launchP = "-launch:",
		colorP = "-color:",
		outputP = "-output:",
		landP = "-l";

function parseArgv() {
	var args = process.argv.slice(2);
	args.forEach(function(arg) {
		if (arg.indexOf(iconP) == 0) {
			iconImg = arg.substring(iconP.length);
		} else if (arg.indexOf(launchP) == 0) {
			launchImg = arg.substring(launchP.length);
		} else if (arg.indexOf(colorP) == 0) {
			bgColor = arg.substring(colorP.length);
		} else if (arg.indexOf(outputP) == 0) {
			outputDir = arg.substring(outputP.length);
		} else if (arg == landP) {
			landscape = true;
			portrait = false;
		}
	});
	console.log(iconImg, launchImg, bgColor, landscape, outputDir);
}
		
if (!module.parent) {
	parseArgv();
	console.log("====== Process Started! ======\n");
	if (iconImg && launchImg) {
		generateIcon(iconImg, function() {
			console.log("====== Generate Icon Done! ======\n");
			generateLaunch(launchImg, function() {
				console.log("====== Generate Launch Image Done! ======\n")
			});
		});
	} else if (launchImg) {
		generateLaunch(launchImg, function() {
			console.log("====== Generate Launch Image Done! ======\n")
		});
	} else if (iconImg) {
		generateIcon(iconImg, function() {
			console.log("====== Generate Icon Done! ======\n")
		});
	} 
}

function generateIcon(iconImg, cb) {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir);
	}
	var iconCfg = config.icon;
	var names = Object.keys(iconCfg);
	var len = names.length;
	var idx = 0;
	var $next = function() {
		if (idx >= len) {
			cb && cb();
			return;
		}
		var img = names[idx++];
		var size = iconCfg[img];
		var w, h;
		if (Array.isArray(size)) {
			w = size[0];
			h = size[1];
		} else {
			w = h = size;
		}
		resizeImage(iconImg, w, h, path.normalize(outputDir + "/" + img), function() {
			console.log(" Icon: " + w + " * " + h + " " + img + " ");
			$next();
		});
	};
	$next();
}

function generateLaunch(launchImg, cb) {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir);
	}
	var launchCfg = config.launch;
	var names = Object.keys(launchCfg);
	var len = names.length;
	var idx = 0;
	var $next = function() {
		if (idx >= len) {
			cb && cb();
			return;
		}
		var img = names[idx++];
		var size = launchCfg[img];
		var w = size[0],
			  h = size[1];
		var longSide = Math.max(w, h);
		var shortSide = Math.min(w, h);
		var scale = longSide > config.maxSize ? 2 : (longSide < config.minSize ? 0.5 : 1);
		var iw = (shortSide - 80),
				ih = (shortSide - 80);
		var ix = (w - iw) / 2;
		var iy = (h - ih) / 2;
		var r = 0;
		if (landscape) {
			if (w < h) {
				r = 90;
				ix = (h - iw) / 2;
				iy = (w - ih) / 2;
			}
		} else {
			if (w > h) {
				r = -90;
				ix = (h - iw) / 2;
				iy = (w - ih) / 2;
			}
		}

		createImage(launchImg, w, h, bgColor, ix, iy, iw, ih, r, path.normalize(outputDir + "/" + img), function() {
			console.log(" Launch: " + w + " * " + h + " " + img + " ");
			$next();
		});
	};
	var imgW, imgH;
	readImageSize(launchImg, function(w, h) {
		imgW = w;
		imgH = h;
		$next();
	});
	$next();
}

function resizeImage(img, w, h, outImg, cb) {
	cp.exec('convert ' + img + ' -resize ' + w + 'x' + h + '! ' + outImg, function(err, stdout, stderr) {
		if (stderr) {
			// console.log(stderr);
		}
		cb && cb();
	});
}

function createImage(img, w, h, bg, ix, iy, iw, ih, r, outImg, cb) {
	var draw = 'image SrcOver ' + ix + ',' + iy + ' ' + iw + ',' + ih + ' ' + img + '';
    var cmd = 'convert -size ' + w + 'x' + h + ' xc:"' + bg + '" -rotate ' + (-r) + ' -draw "' + draw + '" -rotate ' + (r) + ' ' + outImg;
	cp.exec(cmd, function(err, stdout, stderr) {
		if (stderr) {
			// console.log(stderr);
		}
		cb && cb();
	});
}

function readImageSize(img, cb) {
	cp.exec('identify -format "%[w],%[h]\n" ' + img, function(err, stdout, stderr) {
		if (stderr) {
			// console.log(stderr);
		}
		var w, h;
		if (stdout) {
			var rs = stdout.trim().split(",");
			if (rs.length == 2) {
				w = parseInt(rs[0]);
				h = parseInt(rs[1]);
			}
		}
		cb && cb(w, h);
	});
}

exports.generateIcon = generateIcon;
exports.generateLaunch = generateLaunch;