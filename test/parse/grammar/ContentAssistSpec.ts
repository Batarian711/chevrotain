module chevrotain.parse.grammar.interpreter.spec {

    import t = test.parser.grammar.samples;
    import samples = test.parser.grammar.samples;
    import p = chevrotain.parse.grammar.path;
    import matchers = test.matchers;

    describe("The Grammar Ast Content Assist Module", function () {
        "use strict";

        it("can compute the next possible token types From ActionDec in scope of ActionDec #1", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec"],
                occurrenceStack: [1],
                lastTok: t.ActionTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.IdentTok);
        });

        it("can compute the next possible token types From ActionDec in scope of ActionDec #2", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec"],
                occurrenceStack: [1],
                lastTok: t.IdentTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.LParenTok);
        });

        it("can compute the next possible token types From ActionDec in scope of ActionDec #3", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec"],
                occurrenceStack: [1],
                lastTok: t.LParenTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(2);
            matchers.arrayEqualityNoOrder(possibleNextTokTypes, [t.IdentTok, t.RParenTok]);
        });

        it("can compute the next possible token types From ActionDec in scope of ActionDec #4", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec"],
                occurrenceStack: [1],
                lastTok: t.CommaTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.IdentTok);
        });

        it("can compute the next possible token types From ActionDec in scope of ActionDec #5", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec"],
                occurrenceStack: [1],
                lastTok: t.RParenTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(2);
            matchers.arrayEqualityNoOrder(possibleNextTokTypes, [t.SemicolonTok, t.ColonTok]);
        });

        it("can compute the next possible token types From ActionDec in scope of ActionDec #6", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec"],
                occurrenceStack: [1],
                lastTok: t.ColonTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.IdentTok);
        });

        it("can compute the next possible token types From ActionDec in scope of ActionDec #7", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec"],
                occurrenceStack: [1],
                lastTok: t.SemicolonTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(0);
        });

        it("can compute the next possible token types From the first ParamSpec INSIDE ActionDec #1", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec"
                ],
                occurrenceStack: [1, 1],
                lastTok: t.IdentTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.ColonTok);
        });

        it("can compute the next possible token types From the first ParamSpec INSIDE ActionDec #2", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec"
                ],
                occurrenceStack: [1, 1],
                lastTok: t.ColonTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.IdentTok);
        });

        it("can compute the next possible token types From the first ParamSpec INSIDE ActionDec #3", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec"
                ],
                occurrenceStack: [1, 1],
                lastTok: t.LSquareTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.RSquareTok);
        });

        it("can compute the next possible token types From the first ParamSpec INSIDE ActionDec #4", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec"
                ],
                occurrenceStack: [1, 1],
                lastTok: t.RSquareTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(2);
            matchers.arrayEqualityNoOrder(possibleNextTokTypes, [t.CommaTok, t.RParenTok]);
        });

        it("can compute the next possible token types From the second ParamSpec INSIDE ActionDec #1", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec"
                ],
                occurrenceStack: [1, 2],
                lastTok: t.IdentTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.ColonTok);
        });

        it("can compute the next possible token types From the second ParamSpec INSIDE ActionDec #2", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec"
                ],
                occurrenceStack: [1, 2],
                lastTok: t.ColonTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.IdentTok);
        });

        it("can compute the next possible token types From the second ParamSpec INSIDE ActionDec #3", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec"
                ],
                occurrenceStack: [1, 2],
                lastTok: t.LSquareTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.RSquareTok);
        });

        it("can compute the next possible token types From the second ParamSpec INSIDE ActionDec #4", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec"
                ],
                occurrenceStack: [1, 2],
                lastTok: t.RSquareTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(2);
            matchers.arrayEqualityNoOrder(possibleNextTokTypes, [t.CommaTok, t.RParenTok]);
        });

        it("can compute the next possible token types From a fqn inside an actoinParamSpec inside an ParamSpec INSIDE ActionDec #1", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec",
                    "qualifiedName"
                ],
                occurrenceStack: [1, 1, 1],
                lastTok: t.IdentTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(4);
            matchers.arrayEqualityNoOrder(possibleNextTokTypes, [t.DotTok, t.LSquareTok, t.CommaTok, t.RParenTok]);
        });

        it("can compute the next possible token types From a fqn inside an actoinParamSpec inside an ParamSpec INSIDE ActionDec #2", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec",
                    "qualifiedName"
                ],
                occurrenceStack: [1, 1, 1],
                lastTok: t.DotTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.IdentTok);
        });

        it("can compute the next possible token types From a fqn inside an actoinParamSpec inside an ParamSpec INSIDE ActionDec #3", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["actionDec",
                    "ParamSpec",
                    "qualifiedName"
                ],
                occurrenceStack: [1, 1, 1],
                lastTok: t.IdentTok,
                lastTokOccurrence: 2
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.actionDec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(4);
            matchers.arrayEqualityNoOrder(possibleNextTokTypes, [t.DotTok, t.LSquareTok, t.CommaTok, t.RParenTok]);
        });

        it("can compute the next possible token types From a fqn inside an actoinParamSpec inside an ParamSpec INSIDE ActionDec #3", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["ParamSpec",
                    "qualifiedName"
                ],
                occurrenceStack: [1, 1],
                lastTok: t.IdentTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.ParamSpec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(2);
            matchers.arrayEqualityNoOrder(possibleNextTokTypes, [t.DotTok, t.LSquareTok]);
        });

        it("can compute the next possible token types From a fqn inside an actoinParamSpec inside an ParamSpec INSIDE ActionDec #3", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["ParamSpec",
                    "qualifiedName"
                ],
                occurrenceStack: [1, 1],
                lastTok: t.DotTok,
                lastTokOccurrence: 1
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.ParamSpec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(1);
            expect(possibleNextTokTypes[0]).toBe(t.IdentTok);
        });

        it("can compute the next possible token types From a fqn inside an actoinParamSpec inside an ParamSpec INSIDE ActionDec #3", function () {
            var caPath:p.IGrammarPath = {
                ruleStack: ["ParamSpec",
                    "qualifiedName"
                ],
                occurrenceStack: [1, 1],
                lastTok: t.IdentTok,
                lastTokOccurrence: 2
            };

            var possibleNextTokTypes = new NextPossibleTokensWalker(samples.ParamSpec, caPath).startWalking();
            expect(possibleNextTokTypes.length).toBe(2);
            matchers.arrayEqualityNoOrder(possibleNextTokTypes, [t.DotTok, t.LSquareTok]);
        });

    });

}
