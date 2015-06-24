/// <reference path="../libs/node.d.ts" />

/**
 * defines the public API of Chevrotain.
 * changes here may require major version change. (semVer)
 */

declare var CHEV_TEST_MODE
/* istanbul ignore next */
var testMode = (typeof global === "object" && (<any>global).CHEV_TEST_MODE) ||
    (typeof window === "object" && (<any>window).CHEV_TEST_MODE)

var API:any = {}
/* istanbul ignore next */
if (!testMode) {
    // runtime API
    API.Parser = chevrotain.Parser
    API.Lexer = chevrotain.Lexer
    API.Token = chevrotain.Token

    // utilities
    API.extendToken = chevrotain.extendToken

    // grammar reflection API
    API.gast = {}
    API.gast.GAstVisitor = chevrotain.gast.GAstVisitor
    API.gast.FLAT = chevrotain.gast.FLAT
    API.gast.AT_LEAST_ONE = chevrotain.gast.AT_LEAST_ONE
    API.gast.MANY = chevrotain.gast.MANY
    API.gast.OPTION = chevrotain.gast.OPTION
    API.gast.OR = chevrotain.gast.OR
    API.gast.ProdRef = chevrotain.gast.ProdRef
    API.gast.Terminal = chevrotain.gast.Terminal
    API.gast.TOP_LEVEL = chevrotain.gast.TOP_LEVEL
}
else {
    console.log("running in TEST_MODE")
    API = chevrotain
}


