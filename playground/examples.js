function initExamplesDropDown() {
    examplesDropdown.find("option").remove()
    _.forEach(_.keys(samples), function (exampleName, idx) {
        examplesDropdown.append("<option value=\"" + exampleName + "\">" + exampleName + "</option>")
    })
}


function loadExample(exampleName, firstTime) {
    var sample = samples[exampleName]
    // reduce whitespace used for Indentation, 2 spaces is also used in the code mirror editor
    var sampleText = "(" + sample.implementation.toString().replace(/    /g, "  ") + "())"
    // the users of the playground don't care about the @formatter tag of intellij...
    sampleText = sampleText.replace(/\s*\/\/ @formatter:(on|off)/g, "")
    javaScriptEditor.setValue(sampleText)
    updateSamplesDropDown()
    if (firstTime) {
        onImplementationEditorContentChange() // can't wait for debounce on the first load as loadSamples will trigger lexAndParse
    }
    loadSamples(samplesDropdown.val())
}


function loadSamples(sampleKey) {
    var exampleKey = examplesDropdown.val()
    inputEditor.setValue(samples[exampleKey].sampleInputs[sampleKey])
    parserOutput.setValue("")
}


function updateSamplesDropDown() {
    samplesDropdown.find("option").remove()
    _.forOwn(samples[examplesDropdown.val()].sampleInputs, function (exampleValue, exampleName) {
        samplesDropdown.append("<option>" + exampleName + "</option>")
    })
}


function jsonExample() {
    // ----------------- Lexer -----------------
    var createToken = chevrotain.createToken;
    var Lexer = chevrotain.Lexer;

    // In ES6, custom inheritance implementation
    // (such as the one above) can be replaced
    // with a more simple: "class X extends Y"...
    var True = createToken({name: "True", pattern: /true/});
    var False = createToken({name: "False", pattern: /false/});
    var Null = createToken({name: "Null", pattern: /null/});
    var LCurly = createToken({name: "LCurly", pattern: /{/});
    var RCurly = createToken({name: "RCurly", pattern: /}/});
    var LSquare = createToken({name: "LSquare", pattern: /\[/});
    var RSquare = createToken({name: "RSquare", pattern: /]/});
    var Comma = createToken({name: "Comma", pattern: /,/});
    var Colon = createToken({name: "Colon", pattern: /:/});
    var StringLiteral = createToken({
        name: "StringLiteral", pattern: /"(:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/
    });
    var NumberLiteral = createToken({
        name: "NumberLiteral", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
    });
    var WhiteSpace = createToken({name: "WhiteSpace", pattern: /\s+/});
    WhiteSpace.GROUP = Lexer.SKIPPED;


    var jsonTokens = [WhiteSpace, NumberLiteral, StringLiteral, RCurly, LCurly,
        LSquare, RSquare, Comma, Colon, True, False, Null];

    var JsonLexer = new Lexer(jsonTokens);

    // Labels only affect error messages and Diagrams.
    LCurly.LABEL = "'{'";
    RCurly.LABEL = "'}'";
    LSquare.LABEL = "'['";
    RSquare.LABEL = "']'";
    Comma.LABEL = "','";
    Colon.LABEL = "':'";


    // ----------------- parser -----------------
    var Parser = chevrotain.Parser;

    function JsonParser(input) {
        Parser.call(this, input, jsonTokens, {recoveryEnabled: true});
        var $ = this;

        $.RULE("json", function () {
            return $.OR([
                {ALT: function () { return $.SUBRULE($.object) }},
                {ALT: function () { return $.SUBRULE($.array) }}
            ]);
        });

        $.RULE("object", function () {
            // uncomment the debugger statement and open dev tools in chrome/firefox
            // to debug the parsing flow.
            // debugger;
            var obj = {}

            $.CONSUME(LCurly);
            $.MANY_SEP({
                SEP: Comma, DEF: function () {
                    _.assign(obj, $.SUBRULE($.objectItem));
                }
            });
            $.CONSUME(RCurly);

            return obj;
        });


        $.RULE("objectItem", function () {
            var lit, key, value, obj = {};

            lit = $.CONSUME(StringLiteral)
            $.CONSUME(Colon);
            value = $.SUBRULE($.value);

            // an empty json key is not valid, use "BAD_KEY" instead
            key = lit.isInsertedInRecovery ?
                "BAD_KEY" : lit.image.substr(1, lit.image.length - 2);
            obj[key] = value;
            return obj;
        });


        $.RULE("array", function () {
            var arr = [];
            $.CONSUME(LSquare);
            $.MANY_SEP({
                SEP: Comma, DEF: function () {
                    arr.push($.SUBRULE($.value));
                }
            });
            $.CONSUME(RSquare);

            return arr;
        });


        // @formatter:off
        $.RULE("value", function () {
            return $.OR([
                { ALT: function () {
                    var stringLiteral = $.CONSUME(StringLiteral).image
                    // chop of the quotation marks
                    return stringLiteral.substr(1, stringLiteral.length  - 2);
                }},
                { ALT: function () { return Number($.CONSUME(NumberLiteral).image) }},
                { ALT: function () { return $.SUBRULE($.object) }},
                { ALT: function () { return $.SUBRULE($.array) }},
                { ALT: function () {
                    $.CONSUME(True);
                    return true;
                }},
                { ALT: function () {
                    $.CONSUME(False);
                    return false;
                }},
                { ALT: function () {
                    $.CONSUME(Null);
                    return null;
                }}
            ]);
        });
        // @formatter:on

        // very important to call this after all the rules have been setup.
        // otherwise the parser may not work correctly as it will lack information
        // derived from the self analysis.
        Parser.performSelfAnalysis(this);
    }

    JsonParser.prototype = Object.create(Parser.prototype);
    JsonParser.prototype.constructor = JsonParser;

    // for the playground to work the returned object must contain these fields
    return {
        lexer: JsonLexer,
        parser: JsonParser,
        defaultRule: "json"
    };
}

function jsonGrammarOnlyExample() {
    // ----------------- Lexer -----------------
    var createToken = chevrotain.createToken;
    var Lexer = chevrotain.Lexer;

    var True = createToken({name: "True", pattern: /true/});
    var False = createToken({name: "False", pattern: /false/});
    var Null = createToken({name: "Null", pattern: /null/});
    var LCurly = createToken({name: "LCurly", pattern: /{/});
    var RCurly = createToken({name: "RCurly", pattern: /}/});
    var LSquare = createToken({name: "LSquare", pattern: /\[/});
    var RSquare = createToken({name: "RSquare", pattern: /]/});
    var Comma = createToken({name: "Comma", pattern: /,/});
    var Colon = createToken({name: "Colon", pattern: /:/});
    var StringLiteral = createToken({
        name: "StringLiteral", pattern: /"(:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/
    });
    var NumberLiteral = createToken({
        name: "NumberLiteral", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
    });
    var WhiteSpace = createToken({name: "WhiteSpace", pattern: /\s+/});
    WhiteSpace.GROUP = Lexer.SKIPPED;


    var jsonTokens = [WhiteSpace, NumberLiteral, StringLiteral, RCurly, LCurly,
        LSquare, RSquare, Comma, Colon, True, False, Null];

    var JsonLexer = new Lexer(jsonTokens, {
        // reduce verbosity of output pane by tracking less position info.
        positionTracking: "onlyOffset"
    });

    // Labels only affect error messages and Diagrams.
    LCurly.LABEL = "'{'";
    RCurly.LABEL = "'}'";
    LSquare.LABEL = "'['";
    RSquare.LABEL = "']'";
    Comma.LABEL = "','";
    Colon.LABEL = "':'";


    // ----------------- parser -----------------
    var Parser = chevrotain.Parser;

    function JsonParser(input) {
        Parser.call(this, input, jsonTokens, {
            recoveryEnabled: true,
            // This will automatically create a Concrete Syntax Tree
            // You can inspect this structure in the output window.
            outputCst: true
        });
        var $ = this;

        $.RULE("json", function () {
            $.OR([
                {ALT: function () { $.SUBRULE($.object) }},
                {ALT: function () { $.SUBRULE($.array) }}
            ]);
        });

        $.RULE("object", function () {
            $.CONSUME(LCurly);
            $.MANY_SEP({
                SEP: Comma, DEF: function () {
                    $.SUBRULE($.objectItem);
                }
            });
            $.CONSUME(RCurly);
        });


        $.RULE("objectItem", function () {
            $.CONSUME(StringLiteral)
            $.CONSUME(Colon);
            $.SUBRULE($.value);
        });


        $.RULE("array", function () {
            $.CONSUME(LSquare);
            $.MANY_SEP({
                SEP: Comma, DEF: function () {
                    $.SUBRULE($.value);
                }
            });
            $.CONSUME(RSquare);
        });


        $.RULE("value", function () {
            $.OR([
                {ALT: function () { $.CONSUME(StringLiteral) }},
                {ALT: function () { $.CONSUME(NumberLiteral) }},
                {ALT: function () { $.SUBRULE($.object) }},
                {ALT: function () { $.SUBRULE($.array) }},
                {ALT: function () { $.CONSUME(True) }},
                {ALT: function () { $.CONSUME(False) }},
                {ALT: function () { $.CONSUME(Null); }}
            ]);
        });

        // very important to call this after all the rules have been setup.
        // otherwise the parser may not work correctly as it will lack information
        // derived from the self analysis.
        Parser.performSelfAnalysis(this);
    }

    JsonParser.prototype = Object.create(Parser.prototype);
    JsonParser.prototype.constructor = JsonParser;

    // for the playground to work the returned object must contain these fields
    return {
        lexer: JsonLexer,
        parser: JsonParser,
        defaultRule: "json"
    };
}

function cssExample() {
    // Based on the specs in:
    // https://www.w3.org/TR/CSS21/grammar.html

    // A little mini DSL for easier lexer definition using xRegExp.
    var fragments = {}

    function FRAGMENT(name, def) {
        fragments[name] = XRegExp.build(def, fragments)
    }

    function MAKE_PATTERN(def, flags) {
        return XRegExp.build(def, fragments, flags)
    }

    // ----------------- Lexer -----------------
    var Lexer = chevrotain.Lexer;

    // A Little wrapper to save us the trouble of manually building the
    // array of cssTokens
    var cssTokens = [];
    var createToken = function () {
        var newToken = chevrotain.createToken.apply(null, arguments);
        cssTokens.push(newToken);
        return newToken;
    }

    // The order of fragments definitions is important
    FRAGMENT('nl', '\\n|\\r|\\f');
    FRAGMENT('h', '[0-9a-f]');
    FRAGMENT('nonascii', '[\\u0240-\\uffff]');
    FRAGMENT('unicode', '\\{{h}}{1,6}');
    FRAGMENT('escape', '{{unicode}}|\\\\[^\\r\\n\\f0-9a-f]');
    FRAGMENT('nmstart', '[_a-zA-Z]|{{nonascii}}|{{escape}}');
    FRAGMENT('nmchar', '[_a-zA-Z0-9-]|{{nonascii}}|{{escape}}');
    FRAGMENT('string1', '\\"([^\\n\\r\\f\\"]|\\{{nl}}|{{escape}})*\\"');
    FRAGMENT('string2', "\\'([^\\n\\r\\f\\']|\\{{nl}}|{{escape}})*\\'");
    FRAGMENT('comment', '\\/\\*[^*]*\\*+([^/*][^*]*\\*+)*\\/');
    FRAGMENT("name", "({{nmchar}})+");
    FRAGMENT("url", "([!#\\$%&*-~]|{{nonascii}}|{{escape}})*");
    FRAGMENT("spaces", "[ \\t\\r\\n\\f]+");
    FRAGMENT("ident", "-?{{nmstart}}{{nmchar}}*");
    FRAGMENT("num", "[0-9]+|[0-9]*\\.[0-9]+");

    var Whitespace = createToken({name: 'Whitespace', pattern: MAKE_PATTERN('{{spaces}}')});
    var Comment = createToken({name: 'Comment', pattern: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//});
    // the W3C specs are are defined in a whitespace sensitive manner.
    // This implementation ignores that crazy mess, This means that this grammar may be a superset of the css 2.1 grammar.
    // Checking for whitespace related errors can be done in a separate process AFTER parsing.
    Whitespace.GROUP = Lexer.SKIPPED;
    Comment.GROUP = Lexer.SKIPPED;

    // This group has to be defined BEFORE Ident as their prefix is a valid Ident
    var Uri = createToken({name: 'Uri', pattern: Lexer.NA});
    var UriString = createToken({
        name: 'UriString',
        pattern: MAKE_PATTERN('url\\((:?{{spaces}})?({{string1}}|{{string2}})(:?{{spaces}})?\\)')
    });
    var UriUrl = createToken({name: 'UriUrl', pattern: MAKE_PATTERN('url\\((:?{{spaces}})?{{url}}(:?{{spaces}})?\\)')});
    var Func = createToken({name: 'Func', pattern: MAKE_PATTERN('{{ident}}\\(')});
    // Ident must be before Minus
    var Ident = createToken({name: 'Ident', pattern: MAKE_PATTERN('{{ident}}')});

    var Cdo = createToken({name: 'Cdo', pattern: /<!--/});
    // Cdc must be before Minus
    var Cdc = createToken({name: 'Cdc', pattern: /-->/});
    var Includes = createToken({name: 'Includes', pattern: /~=/});
    var Dasmatch = createToken({name: 'Dasmatch', pattern: /\|=/});
    var Exclamation = createToken({name: 'Exclamation', pattern: /!/});
    var Dot = createToken({name: 'Dot', pattern: /\./});
    var LCurly = createToken({name: 'LCurly', pattern: /{/});
    var RCurly = createToken({name: 'RCurly', pattern: /}/});
    var LSquare = createToken({name: 'LSquare', pattern: /\[/});
    var RSquare = createToken({name: 'RSquare', pattern: /]/});
    var LParen = createToken({name: 'LParen', pattern: /\(/});
    var RParen = createToken({name: 'RParen', pattern: /\)/});
    var Comma = createToken({name: 'Comma', pattern: /,/});
    var Colon = createToken({name: 'Colon', pattern: /:/});
    var SemiColon = createToken({name: 'SemiColon', pattern: /;/});
    var Equals = createToken({name: 'Equals', pattern: /=/});
    var Star = createToken({name: 'Star', pattern: /\*/});
    var Plus = createToken({name: 'Plus', pattern: /\+/});
    var Minus = createToken({name: 'Minus', pattern: /-/});
    var GreaterThan = createToken({name: 'GreaterThan', pattern: />/});
    var Slash = createToken({name: 'Slash', pattern: /\//});

    var StringLiteral = createToken({name: 'StringLiteral', pattern: MAKE_PATTERN('{{string1}}|{{string2}}')});
    var Hash = createToken({name: 'Hash', pattern: MAKE_PATTERN('#{{name}}')});

    // note that the spec defines import as : @{I}{M}{P}{O}{R}{T}
    // Where every letter is defined in this pattern:
    // i|\\0{0,4}(49|69)(\r\n|[ \t\r\n\f])?|\\i
    // Lets count the number of ways to write the letter 'i'
    // i // 2 options due to case insensitivity
    // |
    // \\0{0,4} // 5 options for number of spaces
    // (49|69) // 2 options for asci value
    // (\r\n|[ \t\r\n\f])? // 7 options, so the total for this alternative is 5 * 2 * 7 = 70 (!!!)
    // |
    // \\i // 1 option.
    // so there are a total of 73 options to write the letter 'i'
    // This gives us 73^6 options to write the word "import" which is a number with 12 digits...
    // This implementation does not bother with this crap :) and instead settles for
    // "just" 64 option to write "impPorT" (case due to case insensitivity)
    var ImportSym = createToken({name: 'ImportSym', pattern: /@import/i});
    var PageSym = createToken({name: 'PageSym', pattern: /@page/i});
    var MediaSym = createToken({name: 'MediaSym', pattern: /@media/i});
    var CharsetSym = createToken({name: 'CharsetSym', pattern: /@charset/i});
    var ImportantSym = createToken({name: 'ImportantSym', pattern: /important/i});


    var Ems = createToken({name: 'Ems', pattern: MAKE_PATTERN('{{num}}em', 'i')});
    var Exs = createToken({name: 'Exs', pattern: MAKE_PATTERN('{{num}}ex', 'i')});

    var Length = createToken({name: 'Length', pattern: Lexer.NA});
    var Px = createToken({name: 'Px', pattern: MAKE_PATTERN('{{num}}px', 'i'), parent: Length});
    var Cm = createToken({name: 'Cm', pattern: MAKE_PATTERN('{{num}}cm', 'i'), parent: Length});
    var Mm = createToken({name: 'Mm', pattern: MAKE_PATTERN('{{num}}mm', 'i'), parent: Length});
    var In = createToken({name: 'In', pattern: MAKE_PATTERN('{{num}}in', 'i'), parent: Length});
    var Pt = createToken({name: 'Pt', pattern: MAKE_PATTERN('{{num}}pt', 'i'), parent: Length});
    var Pc = createToken({name: 'Pc', pattern: MAKE_PATTERN('{{num}}pc', 'i'), parent: Length});

    var Angle = createToken({name: 'Angle', pattern: Lexer.NA});
    var Deg = createToken({name: 'Deg', pattern: MAKE_PATTERN('{{num}}deg', 'i'), parent: Angle});
    var Rad = createToken({name: 'Rad', pattern: MAKE_PATTERN('{{num}}rad', 'i'), parent: Angle});
    var Grad = createToken({name: 'Grad', pattern: MAKE_PATTERN('{{num}}grad', 'i'), parent: Angle});

    var Time = createToken({name: 'Time', pattern: Lexer.NA});
    var Ms = createToken({name: 'Ms', pattern: MAKE_PATTERN('{{num}}ms', 'i'), parent: Time});
    var Sec = createToken({name: 'Sec', pattern: MAKE_PATTERN('{{num}}sec', 'i'), parent: Time});

    var Freq = createToken({name: 'Freq', pattern: Lexer.NA});
    var Hz = createToken({name: 'Hz', pattern: MAKE_PATTERN('{{num}}hz', 'i'), parent: Freq});
    var Khz = createToken({name: 'Khz', pattern: MAKE_PATTERN('{{num}}khz', 'i'), parent: Freq});

    var Percentage = createToken({name: 'Percentage', pattern: MAKE_PATTERN('{{num}}%', 'i')});

    // Num must appear after all the num forms with a suffix
    var Num = createToken({name: 'Num', pattern: MAKE_PATTERN('{{num}}')});


    var CssLexer = new Lexer(cssTokens);

    // ----------------- parser -----------------
    var Parser = chevrotain.Parser;

    function CssParser(input) {
        Parser.call(this, input, cssTokens,
            {recoveryEnabled: true, maxLookahead: 3});
        var $ = this;

        $.RULE('stylesheet', function () {

            // [ CHARSET_SYM STRING ';' ]?
            $.OPTION(function () {
                $.SUBRULE($.charsetHeader)
            })

            // [S|CDO|CDC]*
            $.SUBRULE($.cdcCdo)

            // [ import [ CDO S* | CDC S* ]* ]*
            $.MANY(function () {
                $.SUBRULE($.cssImport)
                $.SUBRULE2($.cdcCdo)
            })

            // [ [ ruleset | media | page ] [ CDO S* | CDC S* ]* ]*
            $.MANY2(function () {
                $.SUBRULE($.contents)
            })
        });

        $.RULE('charsetHeader', function () {
            $.CONSUME(CharsetSym)
            $.CONSUME(StringLiteral)
            $.CONSUME(SemiColon)
        })

        $.RULE('contents', function () {
            $.OR([
                {ALT: function () { $.SUBRULE($.ruleset)}},
                {ALT: function () { $.SUBRULE($.media)}},
                {ALT: function () { $.SUBRULE($.page)}}
            ]);
            $.SUBRULE3($.cdcCdo)
        })

        // factor out repeating pattern for cdc/cdo
        $.RULE('cdcCdo', function () {
            $.MANY(function () {
                $.OR([
                    {ALT: function () { $.CONSUME(Cdo)}},
                    {ALT: function () { $.CONSUME(Cdc)}}
                ]);
            })
        })

        // IMPORT_SYM S*
        // [STRING|URI] S* media_list? ';' S*
        $.RULE('cssImport', function () {
            $.CONSUME(ImportSym)
            $.OR([
                {ALT: function () { $.CONSUME(StringLiteral)}},
                {ALT: function () { $.CONSUME(Uri)}}
            ]);

            $.OPTION(function () {
                $.SUBRULE($.media_list)
            })

            $.CONSUME(SemiColon)
        });

        // MEDIA_SYM S* media_list '{' S* ruleset* '}' S*
        $.RULE('media', function () {
            $.CONSUME(MediaSym)
            $.SUBRULE($.media_list)
            $.CONSUME(LCurly)
            $.SUBRULE($.ruleset)
            $.CONSUME(RCurly)
        });

        // medium [ COMMA S* medium]*
        $.RULE('media_list', function () {
            $.MANY_SEP({
                SEP: Comma, DEF: function () {
                    $.SUBRULE($.medium)
                }
            })
        });

        // IDENT S*
        $.RULE('medium', function () {
            $.CONSUME(Ident)
        });

        // PAGE_SYM S* pseudo_page?
        // '{' S* declaration? [ ';' S* declaration? ]* '}' S*
        $.RULE('page', function () {
            $.CONSUME(PageSym)
            $.OPTION(function () {
                $.SUBRULE($.pseudo_page)
            })

            $.SUBRULE($.declarationsGroup)
        });

        // '{' S* declaration? [ ';' S* declaration? ]* '}' S*
        // factored out repeating grammar pattern
        $.RULE('declarationsGroup', function () {
            $.CONSUME(LCurly)
            $.OPTION(function () {
                $.SUBRULE($.declaration)
            })

            $.MANY(function () {
                $.CONSUME(SemiColon)
                $.OPTION2(function () {
                    $.SUBRULE2($.declaration)
                })
            })
            $.CONSUME(RCurly)
        });

        // ':' IDENT S*
        $.RULE('pseudo_page', function () {
            $.CONSUME(Colon)
            $.CONSUME(Ident)
        });

        // '/' S* | ',' S*
        $.RULE('operator', function () {
            $.OR([
                {ALT: function () { $.CONSUME(Slash)}},
                {ALT: function () { $.CONSUME(Comma)}}
            ]);
        });

        // '+' S* | '>' S*
        $.RULE('combinator', function () {
            $.OR([
                {ALT: function () { $.CONSUME(Plus)}},
                {ALT: function () { $.CONSUME(GreaterThan)}}
            ]);
        });

        // '-' | '+'
        $.RULE('unary_operator', function () {
            $.OR([
                {ALT: function () { $.CONSUME(Minus)}},
                {ALT: function () { $.CONSUME(Plus)}}
            ]);
        });

        // IDENT S*
        $.RULE('property', function () {
            $.CONSUME(Ident)
        });

        // selector [ ',' S* selector ]*
        // '{' S* declaration? [ ';' S* declaration? ]* '}' S*
        $.RULE('ruleset', function () {
            $.MANY_SEP({
                SEP: Comma, DEF: function () {
                    $.SUBRULE($.selector)
                }
            })

            $.SUBRULE($.declarationsGroup)
        });

        // simple_selector [ combinator selector | S+ [ combinator? selector ]? ]?
        $.RULE('selector', function () {
            $.SUBRULE($.simple_selector)
            $.OPTION(function () {
                $.OPTION2(function () {
                    $.SUBRULE($.combinator)
                })
                $.SUBRULE($.selector)
            })
        });

        // element_name [ HASH | class | attrib | pseudo ]*
        // | [ HASH | class | attrib | pseudo ]+
        $.RULE('simple_selector', function () {
            // @formatter:off
            $.OR([
                {ALT: function() {
                    $.SUBRULE($.element_name)
                    $.MANY(function() {
                        $.SUBRULE($.simple_selector_suffix)
                    })

                }},
                {ALT: function() {
                    $.AT_LEAST_ONE(function() {
                        $.SUBRULE2($.simple_selector_suffix)
                    })
                }}
            ]);
            // @formatter:on
        });

        // helper grammar rule to avoid repetition
        // [ HASH | class | attrib | pseudo ]+
        $.RULE('simple_selector_suffix', function () {
            $.OR([
                {ALT: function () { $.CONSUME(Hash) }},
                {ALT: function () { $.SUBRULE($.class) }},
                {ALT: function () { $.SUBRULE($.attrib) }},
                {ALT: function () { $.SUBRULE($.pseudo) }}
            ]);
        })

        // '.' IDENT
        $.RULE('class', function () {
            $.CONSUME(Dot)
            $.CONSUME(Ident)
        });

        // IDENT | '*'
        $.RULE('element_name', function () {
            $.OR([
                {ALT: function () { $.CONSUME(Ident) }},
                {ALT: function () { $.CONSUME(Star) }}
            ]);
        });

        // '[' S* IDENT S* [ [ '=' | INCLUDES | DASHMATCH ] S* [ IDENT | STRING ] S* ]? ']'
        $.RULE('attrib', function () {
            $.CONSUME(LSquare)
            $.CONSUME(Ident)

            this.OPTION(function () {
                $.OR([
                    {ALT: function () { $.CONSUME(Equals) }},
                    {ALT: function () { $.CONSUME(Includes) }},
                    {ALT: function () { $.CONSUME(Dasmatch) }}
                ]);

                $.OR2([
                    {ALT: function () { $.CONSUME2(Ident) }},
                    {ALT: function () { $.CONSUME(StringLiteral) }}
                ]);
            })
            $.CONSUME(RSquare)
        });

        // ':' [ IDENT | FUNCTION S* [IDENT S*]? ')' ]
        $.RULE('pseudo', function () {
            $.CONSUME(Colon)
            // @formatter:off
            $.OR([
                {ALT: function() {
                    $.CONSUME(Ident)
                }},
                {ALT: function() {
                    $.CONSUME(Func)
                    $.OPTION(function() {
                        $.CONSUME2(Ident)
                    })
                    $.CONSUME(RParen)
                }}
            ]);
            // @formatter:on
        });

        // property ':' S* expr prio?
        $.RULE('declaration', function () {
            $.SUBRULE($.property)
            $.CONSUME(Colon)
            $.SUBRULE($.expr)

            $.OPTION(function () {
                $.SUBRULE($.prio)
            })
        });

        // IMPORTANT_SYM S*
        $.RULE('prio', function () {
            $.CONSUME(ImportantSym)
        });

        // term [ operator? term ]*
        $.RULE('expr', function () {
            $.SUBRULE($.term)
            $.MANY(function () {
                $.OPTION(function () {
                    $.SUBRULE($.operator)
                })
                $.SUBRULE2($.term)
            })
        });

        // unary_operator?
        // [ NUMBER S* | PERCENTAGE S* | LENGTH S* | EMS S* | EXS S* | ANGLE S* |
        // TIME S* | FREQ S* ]
        // | STRING S* | IDENT S* | URI S* | hexcolor | function
        $.RULE('term', function () {
            $.OPTION(function () {
                $.SUBRULE($.unary_operator)
            })

            $.OR([
                {ALT: function () { $.CONSUME(Num) }},
                {ALT: function () { $.CONSUME(Percentage) }},
                {ALT: function () { $.CONSUME(Length) }},
                {ALT: function () { $.CONSUME(Ems) }},
                {ALT: function () { $.CONSUME(Exs) }},
                {ALT: function () { $.CONSUME(Angle) }},
                {ALT: function () { $.CONSUME(Time) }},
                {ALT: function () { $.CONSUME(Freq) }},
                {ALT: function () { $.CONSUME(StringLiteral) }},
                {ALT: function () { $.CONSUME(Ident) }},
                {ALT: function () { $.CONSUME(Uri) }},
                {ALT: function () { $.SUBRULE($.hexcolor) }},
                {ALT: function () { $.SUBRULE($.cssFunction) }}
            ]);
        });

        // FUNCTION S* expr ')' S*
        $.RULE('cssFunction', function () {
            $.CONSUME(Func)
            $.SUBRULE($.expr)
            $.CONSUME(RParen)
        });

        $.RULE('hexcolor', function () {
            $.CONSUME(Hash)
        });


        // very important to call this after all the rules have been setup.
        // otherwise the parser may not work correctly as it will lack information
        // derived from the self analysis.
        Parser.performSelfAnalysis(this);
    }

    CssParser.prototype = Object.create(Parser.prototype);
    CssParser.prototype.constructor = CssParser;

    // for the playground to work the returned object must contain these fields
    return {
        lexer: CssLexer,
        parser: CssParser,
        defaultRule: "stylesheet"
    };
}


function calculatorExample() {
    // ----------------- lexer -----------------
    var createToken = chevrotain.createToken;
    var tokenMatcher = chevrotain.tokenMatcher;
    var Lexer = chevrotain.Lexer;
    var Parser = chevrotain.Parser;

    // using the NA pattern marks this Token class as 'irrelevant' for the Lexer.
    // AdditionOperator defines a Tokens hierarchy but only leafs in this hierarchy
    // define actual Tokens that can appear in the text
    var AdditionOperator = createToken({name: "AdditionOperator", pattern: Lexer.NA});
    var Plus = createToken({name: "Plus", pattern: /\+/, parent: AdditionOperator});
    var Minus = createToken({name: "Minus", pattern: /-/, parent: AdditionOperator});

    var MultiplicationOperator = createToken({name: "MultiplicationOperator", pattern: Lexer.NA});
    var Multi = createToken({name: "Multi", pattern: /\*/, parent: MultiplicationOperator});
    var Div = createToken({name: "Div", pattern: /\//, parent: MultiplicationOperator});

    var LParen = createToken({name: "LParen", pattern: /\(/});
    var RParen = createToken({name: "RParen", pattern: /\)/});
    var NumberLiteral = createToken({name: "NumberLiteral", pattern: /[1-9]\d*/});

    var PowerFunc = createToken({name: "PowerFunc", pattern: /power/});
    var Comma = createToken({name: "Comma", pattern: /,/});

    var WhiteSpace = createToken({name: "WhiteSpace", pattern: /\s+/});
    WhiteSpace.GROUP = Lexer.SKIPPED;

    // whitespace is normally very common so it is placed first to speed up the lexer
    var allTokens = [WhiteSpace,
        Plus, Minus, Multi, Div, LParen, RParen,
        NumberLiteral, AdditionOperator, MultiplicationOperator,
        PowerFunc, Comma];
    var CalculatorLexer = new Lexer(allTokens);


    // ----------------- parser -----------------
    function Calculator(input) {
        // By default if {recoveryEnabled: true} is not passed in the config object
        // error recovery / fault tolerance capabilities will be disabled
        Parser.call(this, input, allTokens);

        var $ = this;

        this.expression = $.RULE("expression", function () {
            // uncomment the debugger statement and open dev tools in chrome/firefox
            // to debug the parsing flow.
            // debugger;
            return $.SUBRULE($.additionExpression)
        });


        // Lowest precedence thus it is first in the rule chain
        // The precedence of binary expressions is determined by
        // how far down the Parse Tree the binary expression appears.
        this.additionExpression = $.RULE("additionExpression", function () {
            var value, op, rhsVal;

            // parsing part
            value = $.SUBRULE($.multiplicationExpression);
            $.MANY(function () {
                // consuming 'AdditionOperator' will consume
                // either Plus or Minus as they are subclasses of AdditionOperator
                op = $.CONSUME(AdditionOperator);
                //  the index "2" in SUBRULE2 is needed to identify the unique
                // position in the grammar during runtime
                rhsVal = $.SUBRULE2($.multiplicationExpression);

                // interpreter part
                // tokenMatcher acts as ECMAScript instanceof operator
                if (tokenMatcher(op, Plus)) {
                    value += rhsVal
                } else { // op "instanceof" Minus
                    value -= rhsVal
                }
            });

            return value
        });


        this.multiplicationExpression = $.RULE("multiplicationExpression", function () {
            var value, op, rhsVal;

            // parsing part
            value = $.SUBRULE($.atomicExpression);
            $.MANY(function () {
                op = $.CONSUME(MultiplicationOperator);
                //  the index "2" in SUBRULE2 is needed to identify the unique
                // position in the grammar during runtime
                rhsVal = $.SUBRULE2($.atomicExpression);

                // interpreter part
                // tokenMatcher acts as ECMAScript instanceof operator
                if (tokenMatcher(op, Multi)) {
                    value *= rhsVal
                } else { // op instanceof Div
                    value /= rhsVal
                }
            });

            return value
        });


        this.atomicExpression = $.RULE("atomicExpression", function () {
            return $.OR([
                // parenthesisExpression has the highest precedence and thus it
                // appears in the "lowest" leaf in the expression ParseTree.
                {ALT: function () { return $.SUBRULE($.parenthesisExpression)}},
                {ALT: function () { return parseInt($.CONSUME(NumberLiteral).image, 10)}},
                {ALT: function () { return $.SUBRULE($.powerFunction)}}
            ]);
        });


        this.parenthesisExpression = $.RULE("parenthesisExpression", function () {
            var expValue;

            $.CONSUME(LParen);
            expValue = $.SUBRULE($.expression);
            $.CONSUME(RParen);

            return expValue
        });

        $.RULE("powerFunction", function () {
            var base, exponent;

            $.CONSUME(PowerFunc);
            $.CONSUME(LParen);
            base = $.SUBRULE($.expression);
            $.CONSUME(Comma);
            exponent = $.SUBRULE2($.expression);
            $.CONSUME(RParen);

            return Math.pow(base, exponent)
        });

        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        Parser.performSelfAnalysis(this);
    }

    // avoids inserting number literals as these have a additional meaning.
    // and we can never choose the "right meaning".
    // For example: a Comma has just one meaning, but a Number may be any of:
    // 1,2,3,...n, 0.4E+3 which value should we used when inserting... ?
    Calculator.prototype.canTokenTypeBeInsertedInRecovery = function (tokClass) {
        return tokClass !== NumberLiteral
    };


    Calculator.prototype = Object.create(Parser.prototype);
    Calculator.prototype.constructor = Calculator;

    // for the playground to work the returned object must contain these fields
    return {
        lexer: CalculatorLexer,
        parser: Calculator,
        defaultRule: "expression"
    };
}

function calculatorExampleCst() {
    "use strict";
    /**
     * An Example of implementing a Calculator with separated grammar and semantics (actions).
     * This separation makes it easier to maintain the grammar and reuse it in different use cases.
     *
     * This is accomplished by using the automatic CST (Concrete Syntax Tree) output capabilities
     * of chevrotain.
     *
     * See farther details here:
     * https://github.com/SAP/chevrotain/blob/master/docs/concrete_syntax_tree.md
     */
        // ----------------- lexer -----------------
    var createToken = chevrotain.createToken;
    var tokenMatcher = chevrotain.tokenMatcher
    var Lexer = chevrotain.Lexer;
    var Parser = chevrotain.Parser;

    // using the NA pattern marks this Token class as 'irrelevant' for the Lexer.
    // AdditionOperator defines a Tokens hierarchy but only the leafs in this hierarchy define
    // actual Tokens that can appear in the text
    var AdditionOperator = createToken({name: "AdditionOperator", pattern: Lexer.NA});
    var Plus = createToken({name: "Plus", pattern: /\+/, parent: AdditionOperator});
    var Minus = createToken({name: "Minus", pattern: /-/, parent: AdditionOperator});

    var MultiplicationOperator = createToken({name: "MultiplicationOperator", pattern: Lexer.NA});
    var Multi = createToken({name: "Multi", pattern: /\*/, parent: MultiplicationOperator});
    var Div = createToken({name: "Div", pattern: /\//, parent: MultiplicationOperator});

    var LParen = createToken({name: "LParen", pattern: /\(/});
    var RParen = createToken({name: "RParen", pattern: /\)/});
    var NumberLiteral = createToken({name: "NumberLiteral", pattern: /[1-9]\d*/});

    var PowerFunc = createToken({name: "PowerFunc", pattern: /power/});
    var Comma = createToken({name: "Comma", pattern: /,/});

    // marking WhiteSpace as 'SKIPPED' makes the lexer skip it.
    var WhiteSpace = createToken({name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED});

    var allTokens = [WhiteSpace, // whitespace is normally very common so it should be placed first to speed up the lexer's performance
        Plus, Minus, Multi, Div, LParen, RParen, NumberLiteral, AdditionOperator, MultiplicationOperator, PowerFunc, Comma];
    var CalculatorLexer = new Lexer(allTokens);


    // ----------------- parser -----------------
    // Note that this is a Pure grammar, it only describes the grammar
    // Not any actions (semantics) to perform during parsing.
    function CalculatorPure(input) {
        Parser.call(this, input, allTokens, {outputCst: true});

        var $ = this;

        $.RULE("expression", function () {
            $.SUBRULE($.additionExpression)
        });

        //  lowest precedence thus it is first in the rule chain
        // The precedence of binary expressions is determined by how far down the Parse Tree
        // The binary expression appears.
        $.RULE("additionExpression", function () {
            $.SUBRULE($.multiplicationExpression);
            $.MANY(function () {
                // consuming 'AdditionOperator' will consume either Plus or Minus as they are subclasses of AdditionOperator
                $.CONSUME(AdditionOperator);
                //  the index "2" in SUBRULE2 is needed to identify the unique position in the grammar during runtime
                $.SUBRULE2($.multiplicationExpression);
            });
        });

        $.RULE("multiplicationExpression", function () {
            $.SUBRULE($.atomicExpression);
            $.MANY(function () {
                $.CONSUME(MultiplicationOperator);
                //  the index "2" in SUBRULE2 is needed to identify the unique position in the grammar during runtime
                $.SUBRULE2($.atomicExpression);
            });
        });

        $.RULE("atomicExpression", function () {
            return $.OR([
                // parenthesisExpression has the highest precedence and thus it appears
                // in the "lowest" leaf in the expression ParseTree.
                {ALT: function () { return $.SUBRULE($.parenthesisExpression)}},
                {ALT: function () { return $.CONSUME(NumberLiteral)}},
                {ALT: function () { return $.SUBRULE($.powerFunction)}}
            ]);
        });

        $.RULE("parenthesisExpression", function () {
            $.CONSUME(LParen);
            $.SUBRULE($.expression);
            $.CONSUME(RParen);
        });

        $.RULE("powerFunction", function () {
            $.CONSUME(PowerFunc);
            $.CONSUME(LParen);
            $.SUBRULE($.expression);
            $.CONSUME(Comma);
            $.SUBRULE2($.expression);
            $.CONSUME(RParen);
        });

        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        Parser.performSelfAnalysis(this);
    }

    CalculatorPure.prototype = Object.create(Parser.prototype);
    CalculatorPure.prototype.constructor = CalculatorPure;


    // wrapping it all together
    // reuse the same parser instance.
    var parser = new CalculatorPure([]);


    // ----------------- Interpreter -----------------
    const BaseCstVisitor = parser.getBaseCstVisitorConstructor()

    class CalculatorInterpreter extends BaseCstVisitor {

        constructor() {
            super()
            // This helper will detect any missing or redundant methods on this visitor
            this.validateVisitor()
        }

        expression(ctx) {
            return this.visit(ctx.additionExpression[0])
        }

        additionExpression(ctx) {
            var lhs = this.visit(ctx.multiplicationExpression[0])
            var result = lhs
            for (var i = 1; i < ctx.multiplicationExpression.length; i++) {
                // There is one less operator than operands
                var operator = ctx.AdditionOperator[i - 1]
                var rhs = this.visit(ctx.multiplicationExpression[i])

                if (tokenMatcher(operator, Plus)) {
                    result += rhs
                }
                else { // Minus
                    result -= rhs
                }
            }
            return result
        }

        multiplicationExpression(ctx) {
            var lhs = this.visit(ctx.atomicExpression[0])
            var result = lhs
            for (var i = 1; i < ctx.atomicExpression.length; i++) {
                // There is one less operator than operands
                var operator = ctx.MultiplicationOperator[i - 1]
                var rhs = this.visit(ctx.atomicExpression[i])

                if (tokenMatcher(operator, Multi)) {
                    result *= rhs
                }
                else { // Division
                    result /= rhs
                }
            }
            return result
        }

        atomicExpression(ctx) {
            if (ctx.parenthesisExpression.length > 0) {
                // TODO: allow accepting array for less verbose syntax
                return this.visit(ctx.parenthesisExpression[0])
            }
            else if (ctx.NumberLiteral.length > 0) {
                return parseInt(ctx.NumberLiteral[0].image, 10)
            }
            else if (ctx.powerFunction.length > 0) {
                return this.visit(ctx.powerFunction[0])
            }
        }

        parenthesisExpression(ctx) {
            // The ctx will also contain the parenthesis tokens, but we don't care about those
            // in the context of calculating the result.
            return this.visit(ctx.expression[0])
        }

        powerFunction(ctx) {
            var base = this.visit(ctx.expression[0])
            var exponent = this.visit(ctx.expression[1])
            return Math.pow(base, exponent)
        }
    }

    // for the playground to work the returned object must contain these fields
    return {
        lexer: CalculatorLexer,
        parser: CalculatorPure,
        visitor: CalculatorInterpreter,
        defaultRule: "expression"
    };
}

var samples = {

    "JSON grammar and CST output": {
        implementation: jsonGrammarOnlyExample,
        sampleInputs: {
            'valid': '{' +
            '\n\t"firstName": "John",' +
            '\n\t"lastName": "Smith",' +
            '\n\t"isAlive": true,' +
            '\n\t"age": 25' +
            '\n}',

            'missing colons': '{' +
            '\n\t"look" "mom",' +
            '\n\t"no" "colons",' +
            '\n\t"!" "success!",' +
            '\n}',

            'missing value': '{' +
            '\n\t"the": "dog",' +
            '\n\t"ate": "my",' +
            '\n\t"will be lost in recovery":,' +
            '\n\t"value": "success!"' +
            '\n}',

            'too many commas': '{' +
            '\n\t"three commas" : 3,,,' +
            '\n\t"five commas": 5,,,,,' +
            '\n\t"!" : "success"' +
            '\n}',

            'missing comma': '{' +
            '\n\t"missing ": "comma->" ' +
            '\n\t"I will be lost in": "recovery", ' +
            '\n\t"but I am still": "here",' +
            '\n\t"partial success": "only one property lost"' +
            '\n}',

            'missing comma in array': '{' +
            '\n\t"name" : "Bobby",' +
            '\n\t"children ages" : [1, 2 3, 4],' +
            '\n\t"partial success": "only one array element lost"' +
            '\n}'
        }
    },

    "JSON grammar and embedded semantics": {
        implementation: jsonExample,
        sampleInputs: {
            'valid': '{' +
            '\n\t"firstName": "John",' +
            '\n\t"lastName": "Smith",' +
            '\n\t"isAlive": true,' +
            '\n\t"age": 25' +
            '\n}',

            'missing colons': '{' +
            '\n\t"look" "mom",' +
            '\n\t"no" "colons",' +
            '\n\t"!" "success!",' +
            '\n}',

            'missing value': '{' +
            '\n\t"the": "dog",' +
            '\n\t"ate": "my",' +
            '\n\t"will be lost in recovery":,' +
            '\n\t"value": "success!"' +
            '\n}',

            'too many commas': '{' +
            '\n\t"three commas" : 3,,,' +
            '\n\t"five commas": 5,,,,,' +
            '\n\t"!" : "success"' +
            '\n}',

            'missing comma': '{' +
            '\n\t"missing ": "comma->" ' +
            '\n\t"I will be lost in": "recovery", ' +
            '\n\t"but I am still": "here",' +
            '\n\t"partial success": "only one property lost"' +
            '\n}',

            'missing comma in array': '{' +
            '\n\t"name" : "Bobby",' +
            '\n\t"children ages" : [1, 2 3, 4],' +
            '\n\t"partial success": "only one array element lost"' +
            '\n}'
        }
    },

    "Calculator separated semantics": {
        implementation: calculatorExampleCst,
        sampleInputs: {
            "parenthesis precedence": "2 * ( 3 + 7)",
            "operator precedence": "2 + 4 * 5 / 10",
            "power function": "1 + power(3, 2)",
            "unidentified Token - success": "1 + @@1 + 1"
        }
    },

    "Calculator embedded semantics": {
        implementation: calculatorExample,
        sampleInputs: {
            "parenthesis precedence": "2 * ( 3 + 7)",
            "operator precedence": "2 + 4 * 5 / 10",
            "power function": "1 + power(3, 2)",
            "unidentified Token - success": "1 + @@1 + 1"
        }
    },

    "CSS Grammar": {
        implementation: cssExample,
        sampleInputs: {
            simpleCss: "@charset \"UTF-8\";\r\n\/* CSS Document *\/\r\n\r\n\/** Structure *\/\r\nbody" +
            " {\r\n  font-family: Arial, sans-serif;\r\n  margin: 0;\r\n  font-size: 14px;\r\n}\r\n\r\n#system-error" +
            " {\r\n  font-size: 1.5em;\r\n  text-align: center;\r\n}",


            "won't stop on first error": "@charset \"UTF-8\";\r\n\/* CSS Document *\/\r\n\r\n\/** Structure *\/\r\nbody" +
            " {\r\n  font-family Arial, sans-serif;\r\n  margin: 0;\r\n  font-size: 14px;\r\n}\r\n\r\n#system-error" +
            " {\r\n  font-size 1.5em;\r\n  text-align: center;\r\n}"
        }
    }
}

