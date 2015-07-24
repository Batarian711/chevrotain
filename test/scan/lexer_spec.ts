namespace chevrotain.lexer.spec {

    import matchers = specs.matchers
    let NA = Lexer.NA
    let SKIPPED = Lexer.SKIPPED


    export class IntegerTok extends Token { static PATTERN = /^[1-9]\d*/ }
    export class IdentifierTok extends Token { static PATTERN = /^[A-Za-z_]\w*/ }
    export class BambaTok extends Token {
        static PATTERN = /^bamba/
        static LONGER_ALT = IdentifierTok
    }

    let patternsToClass = {}
    patternsToClass[BambaTok.PATTERN.toString()] = BambaTok
    patternsToClass[IntegerTok.PATTERN.toString()] = IntegerTok
    patternsToClass[IdentifierTok.PATTERN.toString()] = IdentifierTok
    let patterns:RegExp[] = <any>_.collect(_.values(patternsToClass), "PATTERN")

    let testLexer = new Lexer([BambaTok, IntegerTok, IdentifierTok])

    describe("The Chevrotain Simple Lexer", function () {

        it("can create a token from a string with priority to the First Token class with the longest match #1", function () {
            // this can match either IdentifierTok or BambaTok but should match BambaTok has its pattern is defined before IdentifierTok
            let input = "bamba"
            let result = testLexer.tokenize(input)
            expect(result.tokens[0]).to.be.an.instanceof(BambaTok)
            expect(result.tokens[0].image).to.equal("bamba")
            expect(result.tokens[0].startLine).to.equal(1)
            expect(result.tokens[0].startColumn).to.equal(1)
        })

        it("can create a token from a string with priority to the First Token class with the longest match #2", function () {
            let input = "bambaMIA"
            let result = testLexer.tokenize(input)
            expect(result.tokens[0]).to.be.an.instanceof(IdentifierTok)
            expect(result.tokens[0].image).to.equal("bambaMIA")
            expect(result.tokens[0].startLine).to.equal(1)
            expect(result.tokens[0].startColumn).to.equal(1)
        })

        it("can create a token from a string", function () {
            let input = "6666543221231"
            let result = testLexer.tokenize(input)
            expect(result.tokens[0]).to.be.an.instanceof(IntegerTok)
            expect(result.tokens[0].image).to.equal("6666543221231")
            expect(result.tokens[0].startLine).to.equal(1)
            expect(result.tokens[0].startColumn).to.equal(1)
        })
    })


    class ValidNaPattern extends Token {
        static PATTERN = NA
    }

    class ValidNaPattern2 extends Token {
        static PATTERN = NA
    }

    class InvalidPattern extends Token {
        static PATTERN = "BAMBA"
    }

    class MissingPattern extends Token {}

    class MultiLinePattern extends Token {
        static PATTERN = /bamba/m
    }

    class EndOfInputAnchor extends Token {
        static PATTERN = /BAMBA$/
    }

    class GlobalPattern extends Token {
        static PATTERN = /bamba/g
    }

    class CaseInsensitivePattern extends Token {
        static PATTERN = /bamba/i
    }

    class IntegerValid extends Token {
        static PATTERN = /0\d*/
    }

    class DecimalInvalid extends Token {
        static PATTERN = /0\d*/ // oops we did copy paste and forgot to change the pattern same as Integer
    }

    class Skipped extends Token {
        static GROUP = SKIPPED
    }

    class Special extends Token {
        static GROUP = "Strange"
    }

    class InvalidGroupNumber extends Token {
        static PATTERN = /\d\d\d/
        static GROUP = 666
    }

    describe("The Simple Lexer Validations", function () {

        it("won't detect valid patterns as missing", function () {
            let result = findMissingPatterns([BambaTok, IntegerTok, IdentifierTok])
            //noinspection BadExpressionStatementJS
            expect(result.errors).to.be.empty
            expect(result.validTokenClasses).to.deep.equal([BambaTok, IntegerTok, IdentifierTok])
        })

        it("will detect missing patterns", function () {
            let tokenClasses = [ValidNaPattern, MissingPattern]
            let result = findMissingPatterns(tokenClasses)
            expect(result.errors.length).to.equal(1)
            expect(result.errors[0].tokenClasses).to.deep.equal([MissingPattern])
            expect(result.errors[0].type).to.equal(LexerDefinitionErrorType.MISSING_PATTERN)
            expect(result.errors[0].message).to.contain("MissingPattern")
            expect(result.validTokenClasses).to.deep.equal([ValidNaPattern])
        })

        it("won't detect valid patterns as invalid", function () {
            let result = findInvalidPatterns([BambaTok, IntegerTok, IdentifierTok, ValidNaPattern])
            //noinspection BadExpressionStatementJS
            expect(result.errors).to.be.empty
            expect(result.validTokenClasses).to.deep.equal([BambaTok, IntegerTok, IdentifierTok, ValidNaPattern])
        })

        it("will detect invalid patterns as invalid", function () {
            let tokenClasses = [ValidNaPattern, InvalidPattern]
            let result = findInvalidPatterns(tokenClasses)
            expect(result.errors.length).to.equal(1)
            expect(result.errors[0].tokenClasses).to.deep.equal([InvalidPattern])
            expect(result.errors[0].type).to.equal(LexerDefinitionErrorType.INVALID_PATTERN)
            expect(result.errors[0].message).to.contain("InvalidPattern")
            expect(result.validTokenClasses).to.deep.equal([ValidNaPattern])
        })

        it("won't detect valid patterns as using unsupported flags", function () {
            let errors = findUnsupportedFlags([BambaTok, IntegerTok, IdentifierTok, CaseInsensitivePattern])
            //noinspection BadExpressionStatementJS
            expect(errors).to.be.empty
        })

        it("will detect patterns using unsupported multiline flag", function () {
            let tokenClasses = [ValidNaPattern, MultiLinePattern]
            let errors = findUnsupportedFlags(tokenClasses)
            expect(errors.length).to.equal(1)
            expect(errors[0].tokenClasses).to.deep.equal([MultiLinePattern])
            expect(errors[0].type).to.equal(LexerDefinitionErrorType.UNSUPPORTED_FLAGS_FOUND)
            expect(errors[0].message).to.contain("MultiLinePattern")
        })

        it("will detect patterns using unsupported global flag", function () {
            let tokenClasses = [ValidNaPattern, GlobalPattern]
            let errors = findUnsupportedFlags(tokenClasses)
            expect(errors.length).to.equal(1)
            expect(errors[0].tokenClasses).to.deep.equal([GlobalPattern])
            expect(errors[0].type).to.equal(LexerDefinitionErrorType.UNSUPPORTED_FLAGS_FOUND)
            expect(errors[0].message).to.contain("GlobalPattern")
        })

        it("won't detect valid patterns as duplicates", function () {
            let errors = findDuplicatePatterns([MultiLinePattern, IntegerValid])
            //noinspection BadExpressionStatementJS
            expect(errors).to.be.empty
        })

        it("won't detect NA patterns as duplicates", function () {
            let errors = findDuplicatePatterns([ValidNaPattern, ValidNaPattern2])
            //noinspection BadExpressionStatementJS
            expect(errors).to.be.empty
        })

        it("will detect patterns using unsupported end of input anchor", function () {
            let tokenClasses = [ValidNaPattern, EndOfInputAnchor]
            let errors = findEndOfInputAnchor(tokenClasses)
            expect(errors.length).to.equal(1)
            expect(errors[0].tokenClasses).to.deep.equal([EndOfInputAnchor])
            expect(errors[0].type).to.equal(LexerDefinitionErrorType.EOI_ANCHOR_FOUND)
            expect(errors[0].message).to.contain("EndOfInputAnchor")
        })

        it("won't detect valid patterns as using unsupported end of input anchor", function () {
            let errors = findEndOfInputAnchor([IntegerTok, IntegerValid])
            //noinspection BadExpressionStatementJS
            expect(errors).to.be.empty
        })

        it("will detect identical patterns for different classes", function () {
            let tokenClasses = [DecimalInvalid, IntegerValid]
            let errors = findDuplicatePatterns(tokenClasses)
            expect(errors.length).to.equal(1)
            expect(errors[0].tokenClasses).to.deep.equal([DecimalInvalid, IntegerValid])
            expect(errors[0].type).to.equal(LexerDefinitionErrorType.DUPLICATE_PATTERNS_FOUND)
            expect(errors[0].message).to.contain("IntegerValid")
            expect(errors[0].message).to.contain("DecimalInvalid")
        })

        it("won't detect valid groups as unsupported", function () {
            let errors = findInvalidGroupType([IntegerTok, Skipped, Special])
            //noinspection BadExpressionStatementJS
            expect(errors).to.be.empty
        })

        it("will detect unsupported group types", function () {
            let tokenClasses = [InvalidGroupNumber]
            let errors = findInvalidGroupType(tokenClasses)
            expect(errors.length).to.equal(1)
            expect(errors[0].tokenClasses).to.deep.equal([InvalidGroupNumber])
            expect(errors[0].type).to.equal(LexerDefinitionErrorType.INVALID_GROUP_TYPE_FOUND)
            expect(errors[0].message).to.contain("InvalidGroupNumber")
        })
    })

    class PatternNoStart extends Token { static PATTERN = /bamba/i }

    class Keyword extends Token { static PATTERN = NA }
    class If extends Keyword { static PATTERN = /if/ }
    class Else extends Keyword { static PATTERN = /else/ }
    class Return extends Keyword { static PATTERN = /return/ }
    class Integer extends Token { static PATTERN = /[1-9]\d*/ }
    class Punctuation extends Token { static PATTERN = NA }
    class LParen extends Punctuation { static PATTERN = /\(/ }
    class RParen extends Punctuation { static PATTERN = /\)/ }

    class Whitespace extends Token {
        static PATTERN = /(\t| )/
        static GROUP = SKIPPED
    }

    class NewLine extends Token {
        static PATTERN = /(\n|\r|\r\n)/
        static GROUP = SKIPPED
    }

    class WhitespaceNotSkipped extends Token {
        static PATTERN = /\s+/
    }

    class Comment extends Token {
        static PATTERN = /\/\/.+/
        static GROUP = "comments"
    }

    class WhitespaceOrAmp extends Token {
        static PATTERN = /\s+|&/
    }


    describe("The Simple Lexer transformations", function () {

        it("can transform a pattern to one with startOfInput mark ('^') #1 (NO OP)", function () {
            let orgSource = BambaTok.PATTERN.source
            let transPattern = addStartOfInput(BambaTok.PATTERN)
            expect(transPattern.source).to.equal("^(?:" + orgSource + ")")
            expect(_.startsWith(transPattern.source, "^")).to.equal(true)
        })

        it("can transform a pattern to one with startOfInput mark ('^') #2", function () {
            let orgSource = PatternNoStart.PATTERN.source
            let transPattern = addStartOfInput(PatternNoStart.PATTERN)
            expect(transPattern.source).to.equal("^(?:" + orgSource + ")")
            expect(_.startsWith(transPattern.source, "^")).to.equal(true)
        })

        it("can transform/analyze an array of Token Classes into matched/ignored/patternToClass", function () {
            let tokenClasses = [Keyword, If, Else, Return, Integer, Punctuation, LParen, RParen, Whitespace, NewLine]
            let analyzeResult = analyzeTokenClasses(tokenClasses)
            expect(analyzeResult.allPatterns.length).to.equal(8)
            let allPatternsString = _.map(analyzeResult.allPatterns, (pattern) => {
                return pattern.source
            })
            matchers.setEquality(allPatternsString, ["^(?:(\\t| ))", "^(?:(\\n|\\r|\\r\\n))",
                "^(?:\\()", "^(?:\\))", "^(?:[1-9]\\d*)", "^(?:if)", "^(?:else)", "^(?:return)"])

            let patternIdxToClass = analyzeResult.patternIdxToClass
            expect(_.keys(patternIdxToClass).length).to.equal(8)
            expect(patternIdxToClass[0]).to.equal(If);
            expect(patternIdxToClass[1]).to.equal(Else);
            expect(patternIdxToClass[2]).to.equal(Return);
            expect(patternIdxToClass[3]).to.equal(Integer);
            expect(patternIdxToClass[4]).to.equal(LParen);
            expect(patternIdxToClass[5]).to.equal(RParen);
            expect(patternIdxToClass[6]).to.equal(Whitespace);
            expect(patternIdxToClass[7]).to.equal(NewLine);
        })

        it("can count the number of line terminators in a string", function () {
            expect(countLineTerminators("bamba\r\nbisli\r")).to.equal(2)
            expect(countLineTerminators("\r\r\r1234\r\n")).to.equal(4)
            expect(countLineTerminators("aaaa\raaa\n\r1234\n")).to.equal(4)
        })
    })

    describe("The Simple Lexer Full flow", function () {

        it("can create a simple Lexer from a List of Token Classes", function () {
            let ifElseLexer = new Lexer([Keyword, If, Else, Return, Integer, Punctuation, LParen, RParen, Whitespace, NewLine])
            //noinspection BadExpressionStatementJS
            expect(ifElseLexer.lexerDefinitionErrors).to.be.empty

            let input = "if (666) return 1\n" +
                "\telse return 2"

            let lexResult = ifElseLexer.tokenize(input)
            expect(lexResult.tokens).to.deep.equal([new If("if", 0, 1, 1), new LParen("(", 3, 1, 4), new Integer("666", 4, 1, 5),
                new RParen(")", 7, 1, 8), new Return("return", 9, 1, 10), new Integer("1", 16, 1, 17), new Else("else", 19, 2, 2),
                new Return("return", 24, 2, 7), new Integer("2", 31, 2, 14)
            ])
            // TODO: support returning skipped tokens under certain conditions (token groups)
            //expect(lexResult.skipped).to.deep.equal([new Whitespace(1, 3, " "), new Whitespace(1, 9, " "), new Whitespace(1, 16, " "),
            //    new NewLine(1, 18, "\n"), new Whitespace(2, 1, "\t"), new Whitespace(2, 6, " "), new Whitespace(2, 13, " ")])
        })

        it("Will throw an error during the creation of a Lexer if the Lexer's definition is invalid", function () {
            expect(() => new Lexer([EndOfInputAnchor, If, Else])).to.throw(/Errors detected in definition of Lexer/)
            expect(() => new Lexer([EndOfInputAnchor, If, Else])).to.throw(/EndOfInputAnchor/)
        })

        it("can defer the throwing of errors during the creation of a Lexer if the Lexer's definition is invalid", function () {
            expect(() => new Lexer([EndOfInputAnchor, If, Else], true)).to.not.throw(/Errors detected in definition of Lexer/)
            expect(() => new Lexer([EndOfInputAnchor, If, Else], true)).to.not.throw(/EndOfInputAnchor/)

            let lexerWithErrs = new Lexer([EndOfInputAnchor, If, Else], true)
            //noinspection BadExpressionStatementJS
            expect(lexerWithErrs.lexerDefinitionErrors).to.not.be.empty
            // even when the Error handling is deferred, actual usage of an invalid lexer is not permitted!
            expect(() => lexerWithErrs.tokenize("else")).to.throw(/Unable to Tokenize because Errors detected in definition of Lexer/)
            expect(() => lexerWithErrs.tokenize("else")).to.throw(/EndOfInputAnchor/)
        })

        it("can skip invalid character inputs and only report one error per sequence of characters skipped", function () {
            let ifElseLexer = new Lexer([Keyword, If, Else, Return, Integer, Punctuation, LParen, RParen, Whitespace, NewLine])


            let input = "if (666) return 1@#$@#$\n" +
                "\telse return 2"

            let lexResult = ifElseLexer.tokenize(input)
            expect(lexResult.errors.length).to.equal(1)
            expect(lexResult.errors[0].message).to.contain("@")
            expect(lexResult.errors[0].line).to.equal(1)
            expect(lexResult.errors[0].column).to.equal(18)
            expect(lexResult.errors[0].length).to.equal(6)
            expect(lexResult.tokens).to.deep.equal([new If("if", 0, 1, 1), new LParen("(", 3, 1, 4), new Integer("666", 4, 1, 5),
                new RParen(")", 7, 1, 8), new Return("return", 9, 1, 10), new Integer("1", 16, 1, 17), new Else("else", 25, 2, 2),
                new Return("return", 30, 2, 7), new Integer("2", 37, 2, 14)
            ])
            // TODO: support returning skipped tokens under certain conditions (token groups)
            //expect(lexResult.skipped).to.deep.equal([new Whitespace(1, 3, " "), new Whitespace(1, 9, " "), new Whitespace(1, 16, " "),
            //    new NewLine(1, 24, "\n"), new Whitespace(2, 1, "\t"), new Whitespace(2, 6, " "), new Whitespace(2, 13, " ")])
        })

        it("won't go into infinite loops when skipping at end of input", function () {
            let ifElseLexer = new Lexer([Keyword, If, Else, Return, Integer, Punctuation, LParen, RParen, Whitespace, NewLine])

            let input = "if&&&&&&&&&&&&&&&&&&&&&&&&&&&&"
            let lexResult = ifElseLexer.tokenize(input)
            expect(lexResult.errors.length).to.equal(1)
            expect(lexResult.errors[0].message).to.contain("&")
            expect(lexResult.errors[0].line).to.equal(1)
            expect(lexResult.errors[0].column).to.equal(3)
            expect(lexResult.errors[0].length).to.equal(28)
            expect(lexResult.tokens).to.deep.equal([new If("if", 0, 1, 1)])
        })

        it("can deal with line terminators during resync", function () {
            let ifElseLexer = new Lexer([If, Else]) // no newLine tokens those will be resynced

            let input = "if\r\nelse\rif\r"
            let lexResult = ifElseLexer.tokenize(input)
            expect(lexResult.errors.length).to.equal(3)
            expect(lexResult.errors[0].message).to.contain("\r")
            expect(lexResult.errors[0].line).to.equal(1)
            expect(lexResult.errors[0].column).to.equal(3)
            expect(lexResult.errors[0].length).to.equal(2)

            expect(lexResult.errors[1].message).to.contain("\r")
            expect(lexResult.errors[1].line).to.equal(2)
            expect(lexResult.errors[1].column).to.equal(5)
            expect(lexResult.errors[1].length).to.equal(1)

            expect(lexResult.errors[2].message).to.contain("\r")
            expect(lexResult.errors[2].line).to.equal(3)
            expect(lexResult.errors[2].column).to.equal(3)
            expect(lexResult.errors[2].length).to.equal(1)
            expect(lexResult.tokens).to.deep.equal([new If("if", 0, 1, 1), new Else("else", 4, 2, 1), new If("if", 9, 3, 1)])
        })

        it("can deal with line terminators inside multi-line Tokens", function () {
            let ifElseLexer = new Lexer([If, Else, WhitespaceNotSkipped])

            let input = "if\r\r\telse\rif\n"
            let lexResult = ifElseLexer.tokenize(input)

            expect(lexResult.tokens).to.deep.equal([
                new If("if", 0, 1, 1, 1, 2),
                new WhitespaceNotSkipped("\r\r\t", 2, 1, 3, 3, 1),
                new Else("else", 5, 3, 2, 3, 5),
                new WhitespaceNotSkipped("\r", 9, 3, 6, 3, 6),
                new If("if", 10, 4, 1, 4, 2),
                new WhitespaceNotSkipped("\n", 12, 4, 3, 4, 3),
            ])
        })

        it("can deal with Tokens which may or may not be a lineTerminator", function () {
            let ifElseLexer = new Lexer([If, Else, WhitespaceOrAmp])

            let input = "if\r\r\telse&if"
            let lexResult = ifElseLexer.tokenize(input)

            expect(lexResult.tokens).to.deep.equal([
                new If("if", 0, 1, 1, 1, 2),
                new WhitespaceOrAmp("\r\r\t", 2, 1, 3, 3, 1),
                new Else("else", 5, 3, 2, 3, 5),
                new WhitespaceOrAmp("&", 9, 3, 6, 3, 6),
                new If("if", 10, 3, 7, 3, 8),
            ])
        })

        it("supports Token groups", function () {

            let ifElseLexer = new Lexer([If, Else, Comment])
            let input = "if//else"
            let lexResult = ifElseLexer.tokenize(input)

            expect(lexResult.tokens).to.deep.equal([
                new If("if", 0, 1, 1, 1, 2),
            ])

            expect((<any>lexResult.groups).comments).to.deep.equal([
                new Comment("//else", 2, 1, 3, 1, 8),
            ])
        })
    })
}


