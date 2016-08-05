(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['chevrotain'], factory)
    } else {
        factory(root.chevrotain)
    }
}(this, function(chevrotain) {

    // ----------------- lexer -----------------
    var extendToken = chevrotain.extendToken
    var Lexer = chevrotain.Lexer
    var Parser = chevrotain.Parser

    // In ES6, custom inheritance implementation (such as 'extendToken(...)') can be replaced with simple "class X extends Y"...
    var True = extendToken("True", /true/)
    var False = extendToken("False", /false/)
    var Null = extendToken("Null", /null/)
    var LCurly = extendToken("LCurly", /{/)
    var RCurly = extendToken("RCurly", /}/)
    var LSquare = extendToken("LSquare", /\[/)
    var RSquare = extendToken("RSquare", /]/)
    var Comma = extendToken("Comma", /,/)
    var Colon = extendToken("Colon", /:/)
    var StringLiteral = extendToken("StringLiteral", /"(?:[^\\"]+|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/)
    var NumberLiteral = extendToken("NumberLiteral", /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/)
    var WhiteSpace = extendToken("WhiteSpace", /\s+/)
    WhiteSpace.GROUP = Lexer.SKIPPED // marking WhiteSpace as 'SKIPPED' makes the lexer skip it.

    var allTokens = [WhiteSpace, NumberLiteral, StringLiteral, LCurly, RCurly, LSquare, RSquare, Comma, Colon, True, False, Null]
    var JsonLexer = new Lexer(allTokens)


    // ----------------- parser -----------------

    function JsonParser(input) {
        // invoke super constructor
        Parser.call(this, input, allTokens)

        // not mandatory, using <$> (or any other sign) to reduce verbosity (this. this. this. this. .......)
        var $ = this

        this.json = this.RULE("json", function() {
            // @formatter:off
        $.OR([
            { ALT: function () { $.SUBRULE($.object) }},
            { ALT: function () { $.SUBRULE($.array) }}
        ])
        // @formatter:on
        })

        this.object = this.RULE("object", function() {
            $.CONSUME(LCurly)
            $.OPTION(function() {
                $.SUBRULE($.objectItem)
                $.MANY(function() {
                    $.CONSUME(Comma)
                    $.SUBRULE2($.objectItem)
                })
            })
            $.CONSUME(RCurly)
        })

        this.objectItem = this.RULE("objectItem", function() {
            $.CONSUME(StringLiteral)
            $.CONSUME(Colon)
            $.SUBRULE($.value)
        })

        this.array = this.RULE("array", function() {
            $.CONSUME(LSquare)
            $.OPTION(function() {
                $.SUBRULE($.value)
                $.MANY(function() {
                    $.CONSUME(Comma)
                    $.SUBRULE2($.value)
                })
            })
            $.CONSUME(RSquare)
        })

        // @formatter:off
    this.value = this.RULE("value", function () {
        $.OR([
            { ALT: function () { $.CONSUME(StringLiteral) }},
            { ALT: function () { $.CONSUME(NumberLiteral) }},
            { ALT: function () { $.SUBRULE($.object) }},
            { ALT: function () { $.SUBRULE($.array) }},
            { ALT: function () { $.CONSUME(True) }},
            { ALT: function () { $.CONSUME(False) }},
            { ALT: function () { $.CONSUME(Null) }}
        ], "a value")
    })
    // @formatter:on

        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        Parser.performSelfAnalysis(this)
    }

    // inheritance as implemented in javascript in the previous decade... :(
    JsonParser.prototype = Object.create(Parser.prototype)
    JsonParser.prototype.constructor = JsonParser

    // ----------------- wrapping it all together -----------------

    // reuse the same parser instance.
    var parser = new JsonParser([]);

    function parseJson(text) {
        var lexResult = JsonLexer.tokenize(text);

        // setting a new input will RESET the parser instance's state.
        parser.input = lexResult.tokens;

        // any top level rule may be used as an entry point
        var value = parser.json();

        return {
            value:       value, // this is a pure grammar, the value will always be <undefined>
            lexErrors:   lexResult.errors,
            parseErrors: parser.errors
        };
    }

    describe('The Json Parser', function() {

        it('can parse a simple Json without errors', function() {
            var inputText = '{ "arr": [1,2,3], "obj": {"num":666}}'
            var lexAndParseResult = parseJson(inputText)

            expect(lexAndParseResult.lexErrors).to.be.empty
            expect(lexAndParseResult.parseErrors).to.be.empty
        })

        // attempt to resolve random failures when running multiple (separate) karma tests
        // on travis-ci + chrome.
        after(function(done) {
            setTimeout(done, 1000)
        })
    })
}))