var fs = require('fs')
var jf = require('jsonfile')
var path = require('path')
var _ = require('lodash')

apiPath = path.join(__dirname, '../src/api.ts')
travisPath = path.join(__dirname, '../.travis.yml')
packagePath = path.join(__dirname, '../package.json')
bowerPath = path.join(__dirname, '../bower.json')

var pkgJson = jf.readFileSync(packagePath)
var bowerJson = jf.readFileSync(bowerPath)
var travisString = fs.readFileSync(travisPath, 'utf8').toString()
var apiString = fs.readFileSync(apiPath, 'utf8').toString()

var mode = ""
if (_.includes(process.argv, "patch")) {
    mode = "patch"
}
else if (_.includes(process.argv, "minor")) {
    mode = "minor"
}
else {
    console.log("release mode (patch|minor) not provided")
    process.exit(-1)
}

module.exports = {
    apiPath:      apiPath,
    travisPath:   travisPath,
    packagePath:  packagePath,
    bowerPath:    bowerPath,
    pkgJson:      pkgJson,
    bowerJson:    bowerJson,
    travisString: travisString,
    apiString:    apiString,
    currVersion:  pkgJson.version,
    mode:         mode,
    tagPrefix:    "v"

}
