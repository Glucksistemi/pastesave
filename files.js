var fs = require('fs');
const {app} = require('electron');
var path = require("path");
exports.loadConfig = function () {
    var cfile = path.join(app.getPath('appData'), 'pastesavecfg.json');
    if (fs.existsSync(cfile)) {
        this.config = JSON.parse(fs.readFileSync(cfile))
    } else {
        let default_path = path.join(app.getPath('pictures'), 'pastesave');
        if (!fs.existsSync(default_path)) {
            fs.mkdirSync(default_path)
        }
        this.config = {
            "folder": default_path
        };
        fs.writeFileSync(cfile, JSON.stringify(this.config));
    }
    return this.config
};
exports.editConfig = function (param, value) {
    this.config[param] = value;
    var cfile = path.join(app.getPath('appData'), 'pastesavecfg.json');
    fs.writeFileSync(cfile, JSON.stringify(this.config))
};
exports.saveImage = function (data) {
    let extension;
    switch (data.mime) {
        case "image/x-icon":
            extension = "ico";
            break;
        case "image/jpeg":
            extension = "jpg";
            break;
        case "image/svg+xml":
            extension = "svg";
            break;
        default:
            let mime_split = data.mime.split('/');
            if (mime_split[0] == "image") {
                extension = mime_split[1]
            } else {
                return { error: "BAD DATA" }
            }
            break;
    }
    let pth;
    let name = new Date().toISOString().split(":").join(".");
    name = name+"."+extension;
    if (!data.subfolder || data.subfolder == ":root") {
        pth = path.join(this.config.folder, name)
    } else {
        pth = path.join(this.config.folder, data.subfolder, name)
    }
    fs.writeFileSync(pth, data.blob, 'base64');
    return {
        error: false,
        path: pth
    }
};

exports.getSubFolders = function () {
    return fs.readdirSync(this.config.folder)
        .filter(file => fs.statSync(path.join(this.config.folder, file)).isDirectory())
};

exports.createSubFolder = function (name) {
    try {
        fs.mkdirSync(path.join(this.config.folder, name))
    } catch (error) {
        console.log(JSON.stringify(error));
        return {error: JSON.stringify(error)}
    }
    return "ok"
};