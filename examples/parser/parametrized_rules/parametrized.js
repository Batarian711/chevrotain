/*
 * Example Of using parametrized grammar rules.
 * An call to a sub grammar rule may supply an array of argument which will be used
 * in the invocation of the sub-rule.
 *
 * This example additionally displays the use of gates/predicates to control the grammar flow.
 *
 * The Parser in this example accepts a <mood> argument with the invocation of the <topRule>
 * This parameter is passed down to the <hello> rule where it is used to determine the possible grammar path.
 */
"use strict"

var chevrotain = require("chevrotain")
var Token = chevrotain.Token

// ----------------- lexer -----------------
var Lexer = chevrotain.Lexer
var Parser = chevrotain.Parser
var extendToken = chevrotain.extendToken

class Hello extends Token {}
Hello.PATTERN = /hello/
class World extends Token {}
World.PATTERN = /world/

class Cruel extends Token {}
Cruel.PATTERN = /cruel/
class Bad extends Token {}
Bad.PATTERN = /bad/
class Evil extends Token {}
Evil.PATTERN = /evil/

class Good extends Token {}
Good.PATTERN = /good/
class Wonderful extends Token {}
Wonderful.PATTERN = /wonderful/
class Amazing extends Token {}
Amazing.PATTERN = /amazing/

var WhiteSpace = extendToken("WhiteSpace", /\s+/)
WhiteSpace.GROUP = Lexer.SKIPPED

var allTokens = [WhiteSpace, Hello, World,
    Cruel, Bad, Evil, Good, Wonderful, Amazing]

var HelloLexer = new Lexer(allTokens)


// ----------------- parser -----------------
class HelloParser extends chevrotain.Parser {

    constructor(input) {

        super(input, allTokens)

        this.topRule = this.RULE("topRule", (mood) => {
            // SUBRULE may be called with a array of arguments which will be passed to the sub-rule's implementation
            this.SUBRULE(this.hello, [mood])
        })

        // the <hello> rule's implementation is defined with a <mood> parameter
        this.hello = this.RULE("hello", (mood) => {
            this.CONSUME(Hello)

            // The mood parameter is used to determine which path to take
            this.OR([
                {WHEN: () => mood === "positive", THEN_DO: () => this.SUBRULE(this.positive)},
                {WHEN: () => mood === "negative", THEN_DO: () => this.SUBRULE(this.negative)}
            ])

            this.CONSUME(World)
        })

        this.negative = this.RULE("negative", () => {
            this.OR([
                {ALT: () => {this.CONSUME(Cruel)}},
                {ALT: () => {this.CONSUME(Bad)}},
                {ALT: () => {this.CONSUME(Evil)}}
            ])
        })

        this.positive = this.RULE("positive", () => {
            this.OR([
                {ALT: () => {this.CONSUME(Good)}},
                {ALT: () => {this.CONSUME(Wonderful)}},
                {ALT: () => {this.CONSUME(Amazing)}}
            ])
        })

        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        Parser.performSelfAnalysis(this)
    }
}


// ----------------- wrapping it all together -----------------
module.exports = function(text, mood) {

    var fullResult = {}
    var lexResult = HelloLexer.tokenize(text)
    fullResult.tokens = lexResult.tokens
    fullResult.ignored = lexResult.ignored
    fullResult.lexErrors = lexResult.errors

    var parser = new HelloParser(lexResult.tokens)

    // Passing the argument to the top rule.
    // note that because we are invoking a "start rule" we must provide the arguments as the second parameter.
    // with the first parameter provided the value <1>
    // also note that the arguments are passed as an array
    parser.topRule(1, [mood])

    fullResult.parseErrors = parser.errors

    return fullResult
}
