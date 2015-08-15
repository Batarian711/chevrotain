
namespace chevrotain.interpreter.spec {

    import t = specs.samples
    import samples = specs.samples
    import p = chevrotain.path
    import matchers = specs.matchers

    describe("The Grammar Interpeter namespace", function () {
        "use strict"

        describe("The NextAfterTokenWalker", function () {

            it("can compute the next possible token types From ActionDec in scope of ActionDec #1", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec"],
                    occurrenceStack:   [1],
                    lastTok:           t.ActionTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.IdentTok)
            })

            it("can compute the next possible token types From ActionDec in scope of ActionDec #2", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec"],
                    occurrenceStack:   [1],
                    lastTok:           t.IdentTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.LParenTok)
            })

            it("can compute the next possible token types From ActionDec in scope of ActionDec #3", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec"],
                    occurrenceStack:   [1],
                    lastTok:           t.LParenTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(2)
                matchers.setEquality(possibleNextTokTypes, [t.IdentTok, t.RParenTok])
            })

            it("can compute the next possible token types From ActionDec in scope of ActionDec #4", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec"],
                    occurrenceStack:   [1],
                    lastTok:           t.CommaTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.IdentTok)
            })

            it("can compute the next possible token types From ActionDec in scope of ActionDec #5", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec"],
                    occurrenceStack:   [1],
                    lastTok:           t.RParenTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(2)
                matchers.setEquality(possibleNextTokTypes, [t.SemicolonTok, t.ColonTok])
            })

            it("can compute the next possible token types From ActionDec in scope of ActionDec #6", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec"],
                    occurrenceStack:   [1],
                    lastTok:           t.ColonTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.IdentTok)
            })

            it("can compute the next possible token types From ActionDec in scope of ActionDec #7", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec"],
                    occurrenceStack:   [1],
                    lastTok:           t.SemicolonTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(0)
            })

            it("can compute the next possible token types From the first paramSpec INSIDE ActionDec #1", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec"
                    ],
                    occurrenceStack:   [1, 1],
                    lastTok:           t.IdentTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.ColonTok)
            })

            it("can compute the next possible token types From the first paramSpec INSIDE ActionDec #2", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec"
                    ],
                    occurrenceStack:   [1, 1],
                    lastTok:           t.ColonTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.IdentTok)
            })

            it("can compute the next possible token types From the first paramSpec INSIDE ActionDec #3", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec"
                    ],
                    occurrenceStack:   [1, 1],
                    lastTok:           t.LSquareTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.RSquareTok)
            })

            it("can compute the next possible token types From the first paramSpec INSIDE ActionDec #4", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec"
                    ],
                    occurrenceStack:   [1, 1],
                    lastTok:           t.RSquareTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(2)
                matchers.setEquality(possibleNextTokTypes, [t.CommaTok, t.RParenTok])
            })

            it("can compute the next possible token types From the second paramSpec INSIDE ActionDec #1", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec"
                    ],
                    occurrenceStack:   [1, 2],
                    lastTok:           t.IdentTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.ColonTok)
            })

            it("can compute the next possible token types From the second paramSpec INSIDE ActionDec #2", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec"
                    ],
                    occurrenceStack:   [1, 2],
                    lastTok:           t.ColonTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.IdentTok)
            })

            it("can compute the next possible token types From the second paramSpec INSIDE ActionDec #3", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec"
                    ],
                    occurrenceStack:   [1, 2],
                    lastTok:           t.LSquareTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.RSquareTok)
            })

            it("can compute the next possible token types From the second paramSpec INSIDE ActionDec #4", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec"
                    ],
                    occurrenceStack:   [1, 2],
                    lastTok:           t.RSquareTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(2)
                matchers.setEquality(possibleNextTokTypes, [t.CommaTok, t.RParenTok])
            })

            it("can compute the next possible token types From a fqn inside an actionParamSpec" +
            " inside an paramSpec INSIDE ActionDec #1", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec",
                        "qualifiedName"
                    ],
                    occurrenceStack:   [1, 1, 1],
                    lastTok:           t.IdentTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(4)
                matchers.setEquality(possibleNextTokTypes, [t.DotTok, t.LSquareTok, t.CommaTok, t.RParenTok])
            })

            it("can compute the next possible token types From a fqn inside an actionParamSpec" +
            " inside an paramSpec INSIDE ActionDec #2", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec",
                        "qualifiedName"
                    ],
                    occurrenceStack:   [1, 1, 1],
                    lastTok:           t.DotTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.IdentTok)
            })

            it("can compute the next possible token types From a fqn inside an actionParamSpec" +
            " inside an paramSpec INSIDE ActionDec #3", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["actionDec",
                        "paramSpec",
                        "qualifiedName"
                    ],
                    occurrenceStack:   [1, 1, 1],
                    lastTok:           t.IdentTok,
                    lastTokOccurrence: 2
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.actionDec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(4)
                matchers.setEquality(possibleNextTokTypes, [t.DotTok, t.LSquareTok, t.CommaTok, t.RParenTok])
            })

            it("can compute the next possible token types From a fqn inside an actionParamSpec" +
            " inside an paramSpec INSIDE ActionDec #3", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["paramSpec",
                        "qualifiedName"
                    ],
                    occurrenceStack:   [1, 1],
                    lastTok:           t.IdentTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.paramSpec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(2)
                matchers.setEquality(possibleNextTokTypes, [t.DotTok, t.LSquareTok])
            })

            it("can compute the next possible token types From a fqn inside an actionParamSpec" +
            " inside an paramSpec INSIDE ActionDec #3", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["paramSpec",
                        "qualifiedName"
                    ],
                    occurrenceStack:   [1, 1],
                    lastTok:           t.DotTok,
                    lastTokOccurrence: 1
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.paramSpec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(1)
                expect(possibleNextTokTypes[0]).to.equal(t.IdentTok)
            })

            it("can compute the next possible token types From a fqn inside an actionParamSpec" +
            " inside an paramSpec INSIDE ActionDec #3", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["paramSpec",
                        "qualifiedName"
                    ],
                    occurrenceStack:   [1, 1],
                    lastTok:           t.IdentTok,
                    lastTokOccurrence: 2
                }

                let possibleNextTokTypes = new NextAfterTokenWalker(samples.paramSpec, caPath).startWalking()
                expect(possibleNextTokTypes.length).to.equal(2)
                matchers.setEquality(possibleNextTokTypes, [t.DotTok, t.LSquareTok])
            })

            it("will fail if we try to compute the next token starting from a rule that does not match the path", function () {
                let caPath:p.ITokenGrammarPath = {
                    ruleStack:         ["I_WILL_FAIL_THE_WALKER",
                        "qualifiedName"
                    ],
                    occurrenceStack:   [1, 1],
                    lastTok:           t.IdentTok,
                    lastTokOccurrence: 2
                }

                let walker = new NextAfterTokenWalker(samples.paramSpec, caPath)
                expect(() => walker.startWalking()).to.throw("The path does not start with the walker's top Rule!")
            })
        })


        describe("The NextInsideOptionWalker", function () {
            it("can compute the next possible token types inside the OPTION in paramSpec", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["paramSpec"],
                    occurrenceStack: [1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideOptionWalker(samples.paramSpec, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.LSquareTok])
            })

            it("can compute the next possible token types inside the OPTION in paramSpec inside ActionDec", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["actionDec", "paramSpec"],
                    occurrenceStack: [1, 1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideOptionWalker(samples.actionDec, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.LSquareTok])
            })

            it("can compute the next possible token types inside the OPTION in paramSpec inside ActionDec", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["actionDec"],
                    occurrenceStack: [1],
                    occurrence:      2
                }

                let possibleNextTokTypes = new NextInsideOptionWalker(samples.actionDec, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.ColonTok])
            })
        })

        describe("The NextInsideManyWalker", function () {
            it("can compute the next possible token types inside the MANY in QualifiedName", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["qualifiedName"],
                    occurrenceStack: [1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideManyWalker(samples.qualifiedName, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.DotTok])
            })

            it("can compute the next possible token types inside the MANY in paramSpec inside ActionDec", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["actionDec"],
                    occurrenceStack: [1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideManyWalker(samples.actionDec, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.CommaTok])
            })

            it("can compute the next possible token types inside the MANY in paramSpec inside ParamSpec --> QualifiedName", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["paramSpec", "qualifiedName"],
                    occurrenceStack: [1, 1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideManyWalker(samples.paramSpec, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.DotTok])
            })

            it("can compute the next possible token types inside the MANY inside: manyActions --> actionDec ", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["manyActions", "actionDec"],
                    occurrenceStack: [1, 1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideManyWalker(samples.manyActions, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.CommaTok])
            })
        })

        describe("The NextInsideManySepWalker", function () {
            it("can compute the next possible token types inside the MANY_SEP in callArguments", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["callArguments"],
                    occurrenceStack: [1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideManySepWalker(samples.callArguments, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.IdentTok])
            })

            it("can compute the next possible token types inside the MANY_SEP in actionDecSep", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["actionDecSep"],
                    occurrenceStack: [1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideManySepWalker(samples.actionDecSep, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.IdentTok])
            })
        })

        describe("The NextInsideAtLeastOneWalker", function () {
            it("can compute the next possible token types inside the AT_LEAST_ONE in callArguments", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["atLeastOneRule"],
                    occurrenceStack: [1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideAtLeastOneWalker(samples.atLeastOneRule, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.EntityTok])
            })

            it("can compute the next possible token types inside the AT_LEAST_ONE in actionDecSep", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["atLeastOneRule"],
                    occurrenceStack: [1],
                    occurrence:      2
                }

                let possibleNextTokTypes = new NextInsideAtLeastOneWalker(samples.atLeastOneRule, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.EntityTok])
            })

            it("can compute the next possible token types inside the AT_LEAST_ONE in actionDecSep", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["atLeastOneRule"],
                    occurrenceStack: [1],
                    occurrence:      3
                }

                let possibleNextTokTypes = new NextInsideAtLeastOneWalker(samples.atLeastOneRule, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.EntityTok])
            })
        })

        describe("The NextInsideAtLeastOneSepWalker", function () {
            it("can compute the next possible token types inside the AT_LEAST_ONE_SEP in atLeastOneSepRule", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["atLeastOneSepRule"],
                    occurrenceStack: [1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideAtLeastOneSepWalker(samples.atLeastOneSepRule, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.EntityTok])
            })

            it("can compute the next possible token types inside the AT_LEAST_ONE_SEP in atLeastOneSepRule 2", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["atLeastOneSepRule"],
                    occurrenceStack: [1],
                    occurrence:      2
                }

                let possibleNextTokTypes = new NextInsideAtLeastOneSepWalker(samples.atLeastOneSepRule, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.EntityTok])
            })

            it("can compute the next possible token types inside the AT_LEAST_ONE_SEP in atLeastOneSepRule 3", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["atLeastOneSepRule"],
                    occurrenceStack: [1],
                    occurrence:      3
                }

                let possibleNextTokTypes = new NextInsideAtLeastOneSepWalker(samples.atLeastOneSepRule, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.EntityTok])
            })

            it("can compute the next possible token types inside the AT_LEAST_ONE_SEP in qualifiedNameSep", function () {
                let path:p.IRuleGrammarPath = {
                    ruleStack:       ["qualifiedNameSep"],
                    occurrenceStack: [1],
                    occurrence:      1
                }

                let possibleNextTokTypes = new NextInsideAtLeastOneSepWalker(samples.qualifiedNameSep, path).startWalking()
                matchers.setEquality(possibleNextTokTypes, [t.IdentTok])
            })
        })
    })

    describe("The NextTerminalAfterManyWalker", function () {
        it("can compute the next possible token types after the MANY in QualifiedName", function () {
            let result = new NextTerminalAfterManyWalker(samples.qualifiedName, 1).startWalking()
            //noinspection BadExpressionStatementJS
            expect(result.occurrence).to.be.undefined
            //noinspection BadExpressionStatementJS
            expect(result.token).to.be.undefined
        })

        it("can compute the next possible token types after the MANY in paramSpec inside ActionDec", function () {
            let result = new NextTerminalAfterManyWalker(samples.actionDec, 1).startWalking()
            expect(result.occurrence).to.equal(1)
            expect(result.token).to.equal(t.RParenTok)
        })
    })

    describe("The NextTerminalAfterManySepWalker", function () {
        it("can compute the next possible token types after the MANY_SEP in QualifiedName", function () {
            let result = new NextTerminalAfterManySepWalker(samples.callArguments, 1).startWalking()
            //noinspection BadExpressionStatementJS
            expect(result.occurrence).to.be.undefined
            //noinspection BadExpressionStatementJS
            expect(result.token).to.be.undefined
        })

        it("can compute the next possible token types after the MANY in paramSpec inside ActionDec", function () {
            let result = new NextTerminalAfterManySepWalker(samples.actionDecSep, 1).startWalking()
            expect(result.occurrence).to.equal(1)
            expect(result.token).to.equal(t.RParenTok)
        })
    })

    describe("The NextTerminalAfterAtLeastOneWalker", function () {
        it("can compute the next possible token types after an AT_LEAST_ONE production", function () {
            let result = new NextTerminalAfterAtLeastOneWalker(samples.atLeastOneRule, 1).startWalking()
            expect(result.occurrence).to.equal(2)
            expect(result.token).to.equal(t.DotTok)

            let result2 = new NextTerminalAfterAtLeastOneWalker(samples.atLeastOneRule, 2).startWalking()
            expect(result2.occurrence).to.equal(1)
            expect(result2.token).to.equal(t.DotTok)

            let result3 = new NextTerminalAfterAtLeastOneWalker(samples.atLeastOneRule, 3).startWalking()
            expect(result3.occurrence).to.equal(1)
            expect(result3.token).to.equal(t.CommaTok)
        })
    })

    describe("The NextTerminalAfterAtLeastOneSepWalker", function () {
        it("can compute the next possible token types after an AT_LEAST_ONE_SEP production", function () {
            let result = new NextTerminalAfterAtLeastOneSepWalker(samples.atLeastOneSepRule, 1).startWalking()
            expect(result.occurrence).to.equal(2)
            expect(result.token).to.equal(t.DotTok)

            let result2 = new NextTerminalAfterAtLeastOneSepWalker(samples.atLeastOneSepRule, 2).startWalking()
            expect(result2.occurrence).to.equal(1)
            expect(result2.token).to.equal(t.DotTok)

            let result3 = new NextTerminalAfterAtLeastOneSepWalker(samples.atLeastOneSepRule, 3).startWalking()
            expect(result3.occurrence).to.equal(1)
            expect(result3.token).to.equal(t.CommaTok)
        })

        it("can compute the next possible token types after an AT_LEAST_ONE_SEP production EMPTY", function () {
            let result = new NextTerminalAfterAtLeastOneSepWalker(samples.qualifiedNameSep, 1).startWalking()
            //noinspection BadExpressionStatementJS
            expect(result.occurrence).to.be.undefined
            //noinspection BadExpressionStatementJS
            expect(result.token).to.be.undefined
        })
    })

    describe("The NextInsideOrWalker", function () {

        it("can compute the First Tokens for all alternatives of an OR", function () {
            let result = new NextInsideOrWalker(samples.cardinality, 1).startWalking()
            expect(result.length).to.equal(2)
            matchers.setEquality(<any>result[0], [t.UnsignedIntegerLiteralTok])
            matchers.setEquality(<any>result[1], [t.AsteriskTok])
        })

        it("can compute the First Tokens for all alternatives of an OR (complex)", function () {
            let result1 = new NextInsideOrWalker(samples.lotsOfOrs, 1).startWalking()
            expect(result1.length).to.equal(2)
            matchers.setEquality(<any>result1[0], [t.CommaTok, t.KeyTok])
            matchers.setEquality(<any>result1[1], [t.EntityTok])
        })
    })
}
