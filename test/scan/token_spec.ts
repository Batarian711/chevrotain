import {extendToken, tokenName, tokenLabel, Token, tokenMatcher, extendLazyToken, extendSimpleLazyToken} from "../../src/scan/tokens_public"
import {createSimpleLazyToken, augmentTokenClasses} from "../../src/scan/tokens"

let TrueLiteral = extendToken("TrueLiteral")
class FalseLiteral extends Token {}

describe("The Chevrotain Tokens namespace", () => {
    "use strict"

    it("exports a utility function that returns a token's name", () => {
        // FalseLiteral was created with an anonymous function as its constructor yet tokenName(...)
        // should still work correctly on it if the 'tokenName' property has been set on its constructor.
        expect(tokenName(FalseLiteral)).to.equal("FalseLiteral")
        expect(tokenName(TrueLiteral)).to.equal("TrueLiteral")
    })

    let A = extendToken("A")
    let B = extendToken("B", A)
    B.GROUP = "Special"

    let C = extendToken("C", /\d+/, B)
    let D = extendToken("D", /\w+/, B)
    let Plus = extendToken("Plus", /\+/)
    Plus.LABEL = "+"

    it("provides an offset property for backwards compatibility", () => {
        let token = new A("Hello", 5, 4, 1)
        expect((<any>token).offset).to.equal(5);
        (<any>token).offset = 666
        expect((<any>token).offset).to.equal(666)
    })

    it("provides an extendToken utility - creating an instance", () => {
        let aInstance = new A("Hello", 0, 1, 1)
        expect(aInstance.image).to.equal("Hello")
        expect(aInstance.startOffset).to.equal(0)
        expect(aInstance.startLine).to.equal(1)
        expect(aInstance.endLine).to.equal(1)
        expect(aInstance.startColumn).to.equal(1)
        expect(aInstance.endColumn).to.equal(5)
    })

    it("provides an extendToken utility - creating a subclass instance", () => {
        let aInstance = new C("world", 0, 1, 1)
        expect(aInstance.image).to.equal("world")
        expect(aInstance.startOffset).to.equal(0)
        expect(aInstance.startLine).to.equal(1)
        expect(aInstance.endLine).to.equal(1)
        expect(aInstance.startColumn).to.equal(1)
        expect(aInstance.endColumn).to.equal(5)
    })

    it("provides an extendToken utility - inheritance chain", () => {
        let dInstance = new D("world", 0, 1, 1)
        expect(dInstance).to.be.an.instanceof(A)
        expect(dInstance).to.be.an.instanceof(B)
        expect(dInstance).not.to.be.an.instanceof(C)

        let cInstance = new C("666", 0, 1, 1)
        expect(cInstance).to.be.an.instanceof(A)
        expect(cInstance).to.be.an.instanceof(B)

        let bInstance = new B("666", 0, 1, 1)
        expect(bInstance).to.be.an.instanceof(A)
    })

    it("provides an extendToken utility - static properties inheritance", () => {
        expect(D.GROUP).to.equal("Special")
        expect(C.GROUP).to.equal("Special")
    })

    it("Allows customization of the label", () => {
        // Default to class name
        expect(tokenLabel(B)).to.equal("B")
        // Unless there's a LABEL property
        expect(tokenLabel(Plus)).to.equal("+")
    })

    it("provides a utility to verify if a token instance matches a Token Type", () => {
        let ATokRegular = extendToken("ATokRegular")
        let BTokRegular = extendToken("BTokRegular")
        let AInstanceRegular = new ATokRegular("a", -1, -1, -1, -1, -1)
        let BInstanceRegular = new BTokRegular("b", -1, -1, -1, -1, -1)

        expect(tokenMatcher(AInstanceRegular, ATokRegular)).to.be.true
        expect(tokenMatcher(AInstanceRegular, BTokRegular)).to.be.false
        expect(tokenMatcher(BInstanceRegular, BTokRegular)).to.be.true
        expect(tokenMatcher(BInstanceRegular, ATokRegular)).to.be.false

        let ATokLazy = extendLazyToken("ATokLazy")
        let BTokLazy = extendLazyToken("BTokLazy")
        let AInstanceLazy = new ATokLazy(0, 0, {})
        let BInstanceLazy = new BTokLazy(0, 0, {})

        expect(tokenMatcher(AInstanceLazy, ATokLazy)).to.be.true
        expect(tokenMatcher(AInstanceLazy, BTokLazy)).to.be.false
        expect(tokenMatcher(BInstanceLazy, BTokLazy)).to.be.true
        expect(tokenMatcher(BInstanceLazy, ATokLazy)).to.be.false

        let ATokSimple = extendSimpleLazyToken("ATokSimple")
        let BTokSimple = extendSimpleLazyToken("BTokSimple")
        augmentTokenClasses([ATokSimple, BTokSimple])
        let AInstanceSimple = createSimpleLazyToken(0, 1, ATokSimple, {lineToOffset: [], orgText: ""})
        let BInstanceSimple = createSimpleLazyToken(0, 1, BTokSimple, {lineToOffset: [], orgText: ""})

        expect(tokenMatcher(AInstanceSimple, ATokSimple)).to.be.true
        expect(tokenMatcher(AInstanceSimple, BTokSimple)).to.be.false
        expect(tokenMatcher(BInstanceSimple, BTokSimple)).to.be.true
        expect(tokenMatcher(BInstanceSimple, ATokSimple)).to.be.false
    })

    it("Will augment Token Constructors with additional metadata basic", () => {
        let A = extendToken("A")
        let B = extendToken("B")

        expect(A.tokenType).to.be.greaterThan(0)
        expect(B.tokenType).to.be.greaterThan(A.tokenType)

        expect(A.extendingTokenTypes).to.be.an.instanceOf(Array)
        expect(A.extendingTokenTypes).to.be.empty
        expect(B.extendingTokenTypes).to.be.an.instanceOf(Array)
        expect(B.extendingTokenTypes).to.be.empty
    })

    it("Will augment Token Constructors with additional metadata - inheritance", () => {
        let A = extendToken("A")
        let A1 = extendToken("A1", A)
        let A2 = extendToken("A2", A1)

        expect(A.tokenType).to.be.greaterThan(0)
        expect(A1.tokenType).to.be.greaterThan(A.tokenType)
        expect(A2.tokenType).to.be.greaterThan(A1.tokenType)

        expect(A.extendingTokenTypes).to.contain(A1.tokenType)
        expect(A.extendingTokenTypes).to.contain(A2.tokenType)
        expect(A.extendingTokenTypes).to.have.lengthOf(2)

        expect(A1.extendingTokenTypes).to.contain(A2.tokenType)
        expect(A1.extendingTokenTypes).to.have.lengthOf(1)

        expect(A2.extendingTokenTypes).to.be.empty
    })
})
