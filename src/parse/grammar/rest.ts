namespace chevrotain.rest {

    import g = chevrotain.gast


    /**
     *  A Grammar Walker that computes the "remaining" grammar "after" a productions in the grammar.
     */
    export abstract class RestWalker {

        walk(prod:g.AbstractProduction, prevRest:any[] = []):void {
            _.forEach(prod.definition, (subProd:gast.IProduction, index) => {
                let currRest = _.drop(prod.definition, index + 1)

                if (subProd instanceof g.NonTerminal) {
                    this.walkProdRef(subProd, currRest, prevRest)
                }
                else if (subProd instanceof g.Terminal) {
                    this.walkTerminal(subProd, currRest, prevRest)
                }
                else if (subProd instanceof g.Flat) {
                    this.walkFlat(subProd, currRest, prevRest)
                }
                else if (subProd instanceof g.Option) {
                    this.walkOption(subProd, currRest, prevRest)
                }
                else if (subProd instanceof g.RepetitionMandatory) {
                    this.walkAtLeastOne(subProd, currRest, prevRest)
                }
                else if (subProd instanceof g.RepetitionMandatoryWithSeparator) {
                    this.walkAtLeastOneSep(subProd, currRest, prevRest)
                }
                else if (subProd instanceof g.RepetitionWithSeparator) {
                    this.walkManySep(subProd, currRest, prevRest)
                }
                else if (subProd instanceof g.Repetition) {
                    this.walkMany(subProd, currRest, prevRest)
                }
                else if (subProd instanceof g.Alternation) {
                    this.walkOr(subProd, currRest, prevRest)
                }
                else {throw Error("non exhaustive match") }
            })
        }

        walkTerminal(terminal:g.Terminal, currRest:g.IProduction[], prevRest:g.IProduction[]):void {}

        walkProdRef(refProd:g.NonTerminal, currRest:g.IProduction[], prevRest:g.IProduction[]):void {}

        walkFlat(flatProd:g.Flat, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            // ABCDEF => after the D the rest is EF
            let fullOrRest = currRest.concat(prevRest)
            this.walk(flatProd, <any>fullOrRest)
        }

        walkOption(optionProd:g.Option, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            // ABC(DE)?F => after the (DE)? the rest is F
            let fullOrRest = currRest.concat(prevRest)
            this.walk(optionProd, <any>fullOrRest)
        }

        walkAtLeastOne(atLeastOneProd:g.RepetitionMandatory, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            // ABC(DE)+F => after the (DE)+ the rest is (DE)?F
            let fullAtLeastOneRest:g.IProduction[] = [new g.Option(atLeastOneProd.definition)].concat(<any>currRest, <any>prevRest)
            this.walk(atLeastOneProd, fullAtLeastOneRest)
        }

        walkAtLeastOneSep(atLeastOneSepProd:g.RepetitionMandatoryWithSeparator, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            // ABC DE(,DE)* F => after the (,DE)+ the rest is (,DE)?F
            let fullAtLeastOneSepRest = restForRepetitionWithSeparator(atLeastOneSepProd, currRest, prevRest)
            this.walk(atLeastOneSepProd, fullAtLeastOneSepRest)
        }

        walkMany(manyProd:g.Repetition, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            // ABC(DE)*F => after the (DE)* the rest is (DE)?F
            let fullManyRest:g.IProduction[] = [new g.Option(manyProd.definition)].concat(<any>currRest, <any>prevRest)
            this.walk(manyProd, fullManyRest)
        }

        walkManySep(manySepProd:g.RepetitionWithSeparator, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            // ABC (DE(,DE)*)? F => after the (,DE)* the rest is (,DE)?F
            let fullManySepRest = restForRepetitionWithSeparator(manySepProd, currRest, prevRest)
            this.walk(manySepProd, fullManySepRest)
        }

        walkOr(orProd:g.Alternation, currRest:g.IProduction[], prevRest:g.IProduction[]):void {
            // ABC(D|E|F)G => when finding the (D|E|F) the rest is G
            let fullOrRest = currRest.concat(prevRest)
            // walk all different alternatives
            _.forEach(orProd.definition, (alt) => {
                // wrapping each alternative in a single definition wrapper
                // to avoid errors in computing the rest of that alternative in the invocation to computeInProdFollows
                // (otherwise for OR([alt1,alt2]) alt2 will be considered in 'rest' of alt1
                let prodWrapper = new gast.Flat([alt])
                this.walk(prodWrapper, <any>fullOrRest)
            })
        }
    }

    function restForRepetitionWithSeparator(repSepProd, currRest, prevRest) {
        let repSepRest = [new g.Option([<any>new g.Terminal(repSepProd.separator)].concat(repSepProd.definition))]
        let fullRepSepRest:g.IProduction[] = repSepRest.concat(<any>currRest, <any>prevRest)
        return fullRepSepRest
    }
}
