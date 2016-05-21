/**
 * An Example of using chevrotain to implement content assist (both syntatic and semantic)
 * for a mini SQL like language.
 *
 * The suggestions will be Keywords(SELECT/FROM/WHERE) and symbols (column/table names)
 *
 * For symbol names:
 * The Implementation accepts as a parameter a symbol table which specifies the
 * existing column and table names. Of these symbols only relevant ones will be suggested.
 * For example:
 * 1. in a <FROM> clause, only table names will be suggested.
 * 2. in a <SELECT> clause, only column names will be suggested.
 *
 * In all cases the existing prefix of a word will be used to filter the suggestions.
 *
 * Note that this content assist logic may also work if the preceding input is not valid.
 * (see tests in content_assist_spec.js) as long as Chevrotain's error recovery heuristics managed
 * to overcome the issue...
 */

"use strict"

var chevrotain = require("chevrotain");
var _ = require("lodash");

var Lexer = chevrotain.Lexer;
var Parser = chevrotain.Parser;
var extendToken = chevrotain.extendToken;

// all keywords (from/select/where/...) extend a base Keyword class, thus
// they will be easy to identify for the purpose of content assist.
var Keyword = extendToken("Keyword", Lexer.NA);
var Select = extendToken("Select", /SELECT/, Keyword);
var From = extendToken("From", /FROM/, Keyword);
var Where = extendToken("Where", /WHERE/, Keyword);
var Comma = extendToken("Comma", /,/);
var Identifier = extendToken("Identifier", /\w+/);
var Integer = extendToken("Integer", /0|[1-9]\d+/);
var GreaterThan = extendToken("GreaterThan", /</);
var LessThan = extendToken("LessThan", />/);
var WhiteSpace = extendToken("WhiteSpace", /\s+/);
WhiteSpace.GROUP = Lexer.SKIPPED;

var allTokens = [WhiteSpace, Select, From, Where, Comma, Identifier, Integer, GreaterThan, LessThan];
var SelectLexer = new Lexer(allTokens, true);


// ----------------- parser -----------------
class SelectParser extends chevrotain.Parser {

    constructor(input) {
        super(input, allTokens,
            {recoveryEnabled: true});

        var $ = this;


        this.selectStatement = $.RULE("selectStatement", function() {
            $.SUBRULE($.selectClause);
            $.SUBRULE($.fromClause);
            $.OPTION(function() {
                $.SUBRULE($.whereClause);
            });
        });


        this.selectClause = $.RULE("selectClause", function() {
            $.CONSUME(Select);
            $.CONSUME(Identifier);
            $.MANY(function() {
                $.CONSUME(Comma);
                $.CONSUME2(Identifier);
            });
        });


        this.fromClause = $.RULE("fromClause", function() {
            $.CONSUME(From);
            $.CONSUME(Identifier);
        });


        this.whereClause = $.RULE("whereClause", function() {
            $.CONSUME(Where);
            $.SUBRULE($.expression);
        });


        this.expression = $.RULE("expression", function() {
            $.SUBRULE($.atomicExpression);
            $.SUBRULE($.relationalOperator);
            $.SUBRULE2($.atomicExpression);
        });


        this.atomicExpression = $.RULE("atomicExpression", function() {
            $.OR([
                {ALT: function() { $.CONSUME(Integer)}},
                {ALT: function() { $.CONSUME(Identifier)}}
            ]);
        });


        this.relationalOperator = $.RULE("relationalOperator", function() {
            $.OR([
                {ALT: function() { $.CONSUME(GreaterThan)}},
                {ALT: function() { $.CONSUME(LessThan)}}
            ]);
        });

        Parser.performSelfAnalysis(this);
    }
}

class SelectContentAssistParser extends SelectParser {

    constructor(input, assistOffset) {
        super(input);
        this.assistOffset = assistOffset;
        this.lastGrammarPath = {
            ruleStack:         [],
            occurrenceStack:   [],
            lastTok:           undefined,
            lastTokOccurrence: undefined
        };
    }

    /**
     * Overrides the protected Parser.prototype <consumeInternal> method
     * To calculate the syntactic information related to content assist
     *
     * Will terminate the parser's execution once the assistOffset has been reached.
     *
     */
    consumeInternal(tokClass, idx) {

        var consumedToken;
        var contentAssistPointReached = false;
        var pathToTokenBeforeContentAssist;
        var prefix = "";

        try {
            this.lastGrammarPath = this.getCurrentGrammarPath(tokClass, idx);
            consumedToken = super.consumeInternal(tokClass, idx);

            var nextToken = this.NEXT_TOKEN();
            var nextTokenEndOffset = nextToken.offset + nextToken.image.length;

            // no prefix scenario (SELECT age FROM ^)
            if (consumedToken !== undefined &&
                // we have reached the end of the input without encountering the contentAssist offset
                // this means the content assist offset is AFTER the input
                (this.NEXT_TOKEN() instanceof chevrotain.EOF ||
                    // we consumed the last token BEFORE the content assist of offset
                    this.NEXT_TOKEN().offset > this.assistOffset
                )) {
                // reached the content assist point AFTER consuming some token successfully.
                contentAssistPointReached = true;
                pathToTokenBeforeContentAssist = this.getCurrentGrammarPath(tokClass, idx);
            }
            // The prefix scenario (SELECT age FRO^)
            else if (nextTokenEndOffset >= this.assistOffset && // going to reach or pass the assist offset.
                nextToken.offset < this.assistOffset &&
                // only provide suggestions if it was requested after some word like(Ident/Keyword) prefix.
                (nextToken instanceof Identifier || nextToken instanceof Keyword)) {
                contentAssistPointReached = true;
                prefix = nextToken.image.substring(0, this.assistOffset - nextToken.offset);
                // we need the last grammar path and not the current one as we need to find out what TokenTypes the prefix
                // may belong to, and not what may come after the Token the prefix belongs to.
                pathToTokenBeforeContentAssist = this.lastGrammarPath;
            }

            return consumedToken
        }
        finally {
            // halt the parsing flow if we have reached the content assist point
            if (contentAssistPointReached) {
                var nextPossibleTokTypes = this.getNextPossibleTokenTypes(pathToTokenBeforeContentAssist);
                var contentAssistEarlyExitError = new Error("Content Assist path found");

                contentAssistEarlyExitError.path = pathToTokenBeforeContentAssist;
                contentAssistEarlyExitError.nextPossibleTokTypes = nextPossibleTokTypes;
                contentAssistEarlyExitError.prefix = prefix;
                //noinspection ThrowInsideFinallyBlockJS
                throw contentAssistEarlyExitError;
            }
        }
    }
}

module.exports = {

    /**
     * @param {string} text
     * @param {number} offset - the offset in which content assist is requested
     * @param {{tableNames: Array.<string>, columnNames: Array.<string>}} symbolTable -
     *                      list of known symbol names divided by to their semantic type.
     *
     * @returns {Array<string>}
     */
    getContentAssist: function(text, offset, symbolTable) {
        var lexResult = SelectLexer.tokenize(text);
        if (lexResult.errors.length >= 1) {
            throw new Error("sad sad panda, lexing errors detected");
        }

        var parser = new SelectContentAssistParser(lexResult.tokens, offset);

        try {
            parser.selectStatement();
        }
        catch (e) {
            if (e.message === "Content Assist path found") {
                var path = e.path;
                var nextPossibleTokTypes = e.nextPossibleTokTypes;
                var prefix = e.prefix;

                // handling keyword suggestions
                var nextPossibleKeywordsTypes = _.filter(nextPossibleTokTypes, function(currPossibleTokType) {
                    return new currPossibleTokType("dummy") instanceof Keyword;
                })
                var possibleKeywordSuggestions = _.map(nextPossibleKeywordsTypes, function(currKeywordType) {
                    // relying on the fact that the keyword patterns(regexps) are identical to the strings they match. (very simple regexps)
                    return currKeywordType.PATTERN.source;
                })

                // handling Identifier Suggestions
                var possibleIdentifierSuggestions = [];
                if (_.contains(nextPossibleTokTypes, Identifier)) {
                    var currentParsingRule = _.last(path.ruleStack);
                    // filter the semantic options (available global symbols) using syntactic context.
                    if (currentParsingRule === "fromClause") {
                        possibleIdentifierSuggestions = symbolTable.tableNames;
                    }
                    //  only in the <fromClause> table names are valid in this mini SQL example.
                    else {
                        possibleIdentifierSuggestions = symbolTable.columnNames;
                    }
                }

                var allPossibleSuggestions = possibleKeywordSuggestions.concat(possibleIdentifierSuggestions);
                return filterByPrefix(allPossibleSuggestions, prefix);
            }
        }
        return [];
    }
}

// utilities
function filterByPrefix(arr, prefix) {
    return _.filter(arr, function(currElem) {
        return currElem.lastIndexOf(prefix, 0) === 0;
    })
}
