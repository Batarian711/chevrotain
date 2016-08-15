// ----------------- Lexer -----------------
var Token = chevrotain.Token;
// https://github.com/SAP/chevrotain/blob/master/docs/faq.md#Q6 (Use Lazy Tokens)
var extendToken = chevrotain.extendLazyToken;
var ChevrotainLexer = chevrotain.Lexer;

// In ES6, custom inheritance implementation (such as the one above) can be replaced with a more simple: "class X extends Y"...
var True = extendToken("True", /true/);
var False = extendToken("False", /false/);
var Null = extendToken("Null", /null/);
var LCurly = extendToken("LCurly", /{/);
var RCurly = extendToken("RCurly", /}/);
var LSquare = extendToken("LSquare", /\[/);
var RSquare = extendToken("RSquare", /]/);
var Comma = extendToken("Comma", /,/);
var Colon = extendToken("Colon", /:/);
var StringLiteral = extendToken("StringLiteral", /"(?:[^\\"]+|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/);
var NumberLiteral = extendToken("NumberLiteral", /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
var WhiteSpace = extendToken("WhiteSpace", /\s+/);
WhiteSpace.GROUP = ChevrotainLexer.SKIPPED; // marking WhiteSpace as 'SKIPPED' makes the lexer skip it.


var jsonTokens = [WhiteSpace, NumberLiteral, StringLiteral, RCurly, LCurly, LSquare, RSquare, Comma, Colon, True, False, Null];
var ChevJsonLexer = new ChevrotainLexer(jsonTokens);


// ----------------- parser -----------------

// https://github.com/SAP/chevrotain/blob/master/docs/faq.md#Q6
// (Do not create a new Parser instance for each new input.)
var ChevrotainParser = chevrotain.Parser;

function ChevrotainJsonParser(input) {
    ChevrotainParser.call(this, input, jsonTokens);
    var _this = this;

    this.json = this.RULE("json", function () {
        // @formatter:off
        _this.OR([
            { ALT: function () { _this.SUBRULE(_this.object) }},
            { ALT: function () { _this.SUBRULE(_this.array) }}
        ]);
        // @formatter:on
    });

    this.object = this.RULE("object", function () {
        _this.CONSUME(LCurly);
        _this.OPTION(function () {
            _this.SUBRULE(_this.objectItem);
            _this.MANY(function () {
                _this.CONSUME(Comma);
                _this.SUBRULE2(_this.objectItem);
            });
        });
        _this.CONSUME(RCurly);
    });

    this.objectItem = this.RULE("objectItem", function () {
        _this.CONSUME(StringLiteral);
        _this.CONSUME(Colon);
        _this.SUBRULE(_this.value);
    });

    this.array = this.RULE("array", function () {
        _this.CONSUME(LSquare);
        _this.OPTION(function () {
            _this.SUBRULE(_this.value);
            _this.MANY(function () {
                _this.CONSUME(Comma);
                _this.SUBRULE2(_this.value);
            });
        });
        _this.CONSUME(RSquare);
    });

    // @formatter:off
    this.value = this.RULE("value", function () {
        _this.OR([
            { ALT: function () { _this.CONSUME(StringLiteral) }},
            { ALT: function () { _this.CONSUME(NumberLiteral) }},
            { ALT: function () { _this.SUBRULE(_this.object) }},
            { ALT: function () { _this.SUBRULE(_this.array) }},
            { ALT: function () { _this.CONSUME(True) }},
            { ALT: function () { _this.CONSUME(False) }},
            { ALT: function () { _this.CONSUME(Null) }}
        ], "a value");
    });
    // @formatter:on

    // very important to call this after all the rules have been setup.
    // otherwise the parser may not work correctly as it will lack information
    // derived from the self analysis.
    ChevrotainParser.performSelfAnalysis(this);
}

ChevrotainJsonParser.prototype = Object.create(ChevrotainParser.prototype);
ChevrotainJsonParser.prototype.constructor = ChevrotainJsonParser;

