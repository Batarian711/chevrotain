var config = require('./release_config')
var git = require('gitty')
var _ = require('lodash')
var semver = require('semver')
var jf = require('jsonfile')
var fs = require('fs')
var wrench = require("wrench")

var myRepo = git('')
var status = myRepo.statusSync()

if (!_.isEmpty(status.staged) || !_.isEmpty(status.unstaged) || !_.isEmpty(status.untracked)) {
    console.log("Error: git working directory must be clean in order to perform a release")
    process.exit(-1)
}

var branchesInfo = myRepo.getBranchesSync()

if (branchesInfo.current !== "master") {
    console.log("Error: can only perform release job from master branch")
    process.exit(-1)
}

var dateTemplateRegExp = /^(## X\.Y\.Z )\(INSERT_DATE_HERE\)/
if (!dateTemplateRegExp.test(config.changeLogString)) {
    console.log("CHANGELOG.md must have first line in the format '## X.Y.Z (INSERT_DATE_HERE)'")
    process.exit(-1)
}

var pkgVersion = config.pkgJson.version
var bowerVersion = config.bowerJson.version

if (_.uniq([pkgVersion, bowerVersion]).length !== 1) {
    console.log("Error: package.json / bower.json versions must be identical")
    process.exit(-1)
}

var oldVersion = config.currVersion
var newVersion = semver.inc(config.currVersion, config.mode)

var bumpedPkgJson = _.clone(config.pkgJson)
var bumpBowerJson = _.clone(config.bowerJson)
bumpedPkgJson.version = newVersion
bumpBowerJson.version = newVersion
var oldVersionRegExpGlobal = new RegExp(oldVersion, "g")
var bumpedApiString = config.apiString.replace(oldVersionRegExpGlobal, newVersion)

jf.spaces = 2
jf.writeFileSync(config.packagePath, bumpedPkgJson)
jf.writeFileSync(config.bowerPath, bumpBowerJson)
fs.writeFileSync(config.apiPath, bumpedApiString)


// updating CHANGELOG.md date
var nowDate = new Date()
var nowDateString = nowDate.toLocaleDateString().replace(/\//g, "-")
var changeLogDate = config.changeLogString.replace(dateTemplateRegExp, "## " + newVersion + " " + "(" + nowDateString + ")")
fs.writeFileSync(config.changeLogPath, changeLogDate)


var docsOldVersionRegExp = new RegExp(oldVersion.replace(/\./g, "_"), "g")
_.forEach(config.docFilesPaths, function(currDocPath) {
    console.log("bumping file: <" + currDocPath + ">")
    var currItemContents = fs.readFileSync(currDocPath, 'utf8').toString()
    var bumpedItemContents = currItemContents.replace(docsOldVersionRegExp, newVersion.replace(/\./g, "_"))
    fs.writeFileSync(currDocPath, bumpedItemContents)
})
