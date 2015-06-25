
module chevrotain.interpreter {

    import g = chevrotain.gast
    import f = chevrotain.first
    import r = chevrotain.rest
    import p = chevrotain.path

    export class AbstractNextPossibleTokensWalker extends r.RestWalker {

        protected possibleTokTypes:Function[] = []
        protected ruleStack:string[]
        protected occurrenceStack:number[]

        protected nextProductionName = ""
        protected nextProductionOccurrence = 0
        protected found = false
        protected isAtEndOfPath = false;

        constructor(protected topProd:g.Rule, protected path:p.IGrammarPath) {super() }

        startWalking():Function[] {

            this.found = false

            if (this.path.ruleStack[0] !== this.topProd.name) {
                throw Error("The path does not start with the walker's top Rule!")
            }

            // immutable for the win
            this.ruleStack = (<any>_.clone(this.path.ruleStack)).reverse() // intelij bug requires assertion
            this.occurrenceStack = (<any>_.clone(this.path.occurrenceStack)).reverse() // intelij bug requires assertion

            // already verified that the first production is valid, we now seek the 2nd production
            this.ruleStack.pop()
            this.occurrenceStack.pop()

            this.updateExpectedNext()
            this.walk(this.topProd)

            return this.possibleTokTypes
        }


        walk(prod:g.AbstractProduction, prevRest:gast.IProduction[] = []):void {
            // stop scanning once we found the path
            if (!this.found) {
                super.walk(prod, prevRest)
            }
        }

        walkProdRef(refProd:g.NonTerminal, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            // found the next production, need to keep walking in it
            if (refProd.referencedRule.name === this.nextProductionName &&
                refProd.occurrenceInParent === this.nextProductionOccurrence
            ) {
                var fullRest = currRest.concat(prevRest)
                this.updateExpectedNext()
                this.walk(refProd.referencedRule, <any>fullRest)
            }
        }

        updateExpectedNext():void {
            // need to consume the Terminal
            if (_.isEmpty(this.ruleStack)) {
                // must reset nextProductionXXX to avoid walking down another Top Level production while what we are
                // really seeking is the last Terminal...
                this.nextProductionName = ""
                this.nextProductionOccurrence = 0
                this.isAtEndOfPath = true
            }
            else {
                this.nextProductionName = this.ruleStack.pop()
                this.nextProductionOccurrence = this.occurrenceStack.pop()
            }

        }
    }

    export class NextAfterTokenWalker extends AbstractNextPossibleTokensWalker {
        private nextTerminalName = ""
        private nextTerminalOccurrence = 0

        constructor(topProd:g.Rule, protected path:p.ITokenGrammarPath) {
            super(topProd, path)
            this.nextTerminalName = tokenName(this.path.lastTok)
            this.nextTerminalOccurrence = this.path.lastTokOccurrence
        }

        walkTerminal(terminal:g.Terminal, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            if (this.isAtEndOfPath && tokenName(terminal.terminalType) === this.nextTerminalName &&
                terminal.occurrenceInParent === this.nextTerminalOccurrence && !(this.found)
            ) {
                var fullRest = currRest.concat(prevRest)
                var restProd = new g.Flat(<any>fullRest)
                this.possibleTokTypes = f.first(restProd)
                this.found = true
            }
        }
    }

    export class NextInsideOptionWalker extends AbstractNextPossibleTokensWalker {

        private nextOptionOccurrence = 0

        constructor(topProd:g.Rule, protected path:p.IRuleGrammarPath) {
            super(topProd, path)
            this.nextOptionOccurrence = this.path.occurrence
        }

        walkOption(optionProd:g.Option, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            if (this.isAtEndOfPath && optionProd.occurrenceInParent === this.nextOptionOccurrence && !(this.found)) {
                var restProd = new g.Flat(optionProd.definition)
                this.possibleTokTypes = f.first(restProd)
                this.found = true
            }
            else {
                super.walkOption(optionProd, currRest, prevRest)
            }
        }
    }

    export class NextInsideManyWalker extends AbstractNextPossibleTokensWalker {

        private nextOccurrence = 0

        constructor(topProd:g.Rule, protected path:p.IRuleGrammarPath) {
            super(topProd, path)
            this.nextOccurrence = this.path.occurrence
        }

        walkMany(manyProd:g.Repetition, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            if (this.isAtEndOfPath && manyProd.occurrenceInParent === this.nextOccurrence && !(this.found)) {
                var restProd = new g.Flat(manyProd.definition)
                this.possibleTokTypes = f.first(restProd)
                this.found = true
            }
            else {
                super.walkMany(manyProd, currRest, prevRest)
            }
        }
    }

    export class NextInsideAtLeastOneWalker extends AbstractNextPossibleTokensWalker {

        private nextOccurrence = 0

        constructor(topProd:g.Rule, protected path:p.IRuleGrammarPath) {
            super(topProd, path)
            this.nextOccurrence = this.path.occurrence
        }

        walkAtLeastOne(atLeastOneProd:g.RepetitionMandatory, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            if (this.isAtEndOfPath && atLeastOneProd.occurrenceInParent === this.nextOccurrence && !(this.found)) {
                var restProd = new g.Flat(atLeastOneProd.definition)
                this.possibleTokTypes = f.first(restProd)
                this.found = true
            }
            else {
                super.walkAtLeastOne(atLeastOneProd, currRest, prevRest)
            }
        }
    }

    export type AlternativesFirstTokens = Function[][]

    export class NextInsideOrWalker extends r.RestWalker {

        public result:AlternativesFirstTokens = []

        constructor(protected topRule:g.Rule, protected occurrence:number) {
            super()
        }

        startWalking():AlternativesFirstTokens {
            this.walk(this.topRule)
            return this.result
        }

        walkOr(orProd:g.Alternation, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            if (orProd.occurrenceInParent === this.occurrence) {
                this.result = _.map(orProd.definition, (alt) => {
                    var altWrapper = new gast.Flat([alt])
                    return f.first(altWrapper)
                })
            }
            else {
                super.walkOr(orProd, currRest, prevRest)
            }
        }
    }

    export interface IFirstAfterRepetition {
        token:Function
        occurrence:number
        isEndOfRule:boolean
    }

    /**
     * This walker only "walks" a single "TOP" level in the Grammar Ast, this means
     * it never "follows" production refs
     */
    export class AbstractNextTerminalAfterProductionWalker extends r.RestWalker {

        protected result = {token: undefined, occurrence: undefined, isEndOfRule: undefined}

        constructor(protected topRule:g.Rule, protected occurrence:number) {
            super()
        }

        startWalking():IFirstAfterRepetition {
            this.walk(this.topRule)
            return this.result
        }
    }

    export class NextTerminalAfterManyWalker extends AbstractNextTerminalAfterProductionWalker {

        walkMany(manyProd:g.Repetition, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            if (manyProd.occurrenceInParent === this.occurrence) {

                var firstAfterMany = _.first(currRest.concat(prevRest))
                this.result.isEndOfRule = firstAfterMany === undefined
                if (firstAfterMany instanceof gast.Terminal) {
                    this.result.token = firstAfterMany.terminalType
                    this.result.occurrence = firstAfterMany.occurrenceInParent
                }
            }
            else {
                super.walkMany(manyProd, currRest, prevRest)
            }
        }
    }

    export class NextTerminalAfterAtLeastOneWalker extends AbstractNextTerminalAfterProductionWalker {

        walkAtLeastOne(atLeastOneProd:g.RepetitionMandatory, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            if (atLeastOneProd.occurrenceInParent === this.occurrence) {

                var firstAfterAtLeastOne = _.first(currRest.concat(prevRest))
                this.result.isEndOfRule = firstAfterAtLeastOne === undefined
                if (firstAfterAtLeastOne instanceof gast.Terminal) {
                    this.result.token = firstAfterAtLeastOne.terminalType
                    this.result.occurrence = firstAfterAtLeastOne.occurrenceInParent
                }
            }
            else {
                super.walkAtLeastOne(atLeastOneProd, currRest, prevRest)
            }
        }
    }
}
