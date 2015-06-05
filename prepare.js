var fs = require('fs');
var path = require('path');
var src=[
	'./node_modules/bootstrap/dist/css/bootstrap.min.css',
	'./node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
	'./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.eot',
	'./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.svg',
	'./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
	'./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
	'./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2',
	'./node_modules/bootstrap/dist/js/bootstrap.min.js',
];
var dst='./public/';

for(var i=0; i<src.length; i++){
	var ext = path.extname(src[i]);
	var sub = ".";
	switch(ext){
		case ".css":
			sub="stylesheets";
			break;
		case ".woff2":
		case ".woff":
		case ".ttf":
		case ".svg":
		case ".eot":
			sub="fonts";
			break;
		case ".js":
			sub="javascripts"; 
			break;
	}
	var d = path.join(dst, sub, path.basename(src[i])).replace(/\\/g,"/");
	fs.createReadStream(src[i]).pipe(fs.createWriteStream(d));
}