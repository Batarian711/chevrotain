"use strict"
import { VERSION } from "../../src/version"
const createSyntaxDiagramsCode = require("../../src/api")
    .createSyntaxDiagramsCode
import { DDLExampleRecoveryParser } from "../full_flow/error_recovery/sql_statements/sql_recovery_parser"

const { lt } = require("semver")

// more in depth testing will require jsdom to support SVG elements (WIP).
describe("The Chevrotain diagrams rendering APIs", function() {
    const serializedGrammar = new DDLExampleRecoveryParser().getSerializedGastProductions()

    let skipOnNode4 = it
    if (lt(process.version, "6.0.0")) {
        skipOnNode4 = <any>it.skip
    }

    skipOnNode4(
        "Produces valid and executable html text with custom options",
        function(done) {
            const jsdom = require("jsdom")
            const { JSDOM } = jsdom
            const htmlText = createSyntaxDiagramsCode(serializedGrammar, {
                resourceBase: `https://cdn.jsdelivr.net/npm/chevrotain@${VERSION}/diagrams/`
            })

            const dom = new JSDOM(htmlText, {
                runScripts: "dangerously",
                resources: "usable"
            })

            const document = dom.window.document

            document.addEventListener(
                "DOMContentLoaded",
                function() {
                    try {
                        expect(document.scripts.length).to.equal(6)
                        expect(document.scripts.item(1).src).to.include(
                            "jsdelivr"
                        )
                        expect(
                            document.getElementById("diagrams")
                        ).to.not.equal(null)
                        done()
                    } catch (e) {
                        done(e)
                    }
                },
                false
            )
        }
    )

    skipOnNode4("Produces valid and executable html text", done => {
        const jsdom = require("jsdom")
        const { JSDOM } = jsdom
        const htmlText = createSyntaxDiagramsCode(serializedGrammar)

        const dom = new JSDOM(htmlText, {
            runScripts: "dangerously",
            resources: "usable"
        })

        const document = dom.window.document

        document.addEventListener(
            "DOMContentLoaded",
            function() {
                try {
                    expect(document.scripts.length).to.equal(6)
                    expect(document.scripts.item(1).src).to.include("unpkg")
                    expect(document.getElementById("diagrams")).to.not.equal(
                        null
                    )
                    done()
                } catch (e) {
                    done(e)
                }
            },
            false
        )
    })
})
