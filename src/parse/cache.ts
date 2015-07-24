/**
 *
namespace used to cache static information about parsers,
 */
namespace chevrotain.cache {
    export let CLASS_TO_DEFINITION_ERRORS = new lang.HashTable<IParserDefinitionError[]>()

    export let CLASS_TO_SELF_ANALYSIS_DONE = new lang.HashTable<boolean>()

    export let CLASS_TO_GRAMMAR_PRODUCTIONS = new lang.HashTable<lang.HashTable<gast.Rule>>()

    export function getProductionsForClass(className:string):lang.HashTable<gast.Rule> {
        return getFromNestedHashTable(className, CLASS_TO_GRAMMAR_PRODUCTIONS)
    }

    export let CLASS_TO_RESYNC_FOLLOW_SETS = new lang.HashTable<lang.HashTable<Function[]>>()

    export function getResyncFollowsForClass(className:string):lang.HashTable<Function[]> {
        return getFromNestedHashTable(className, CLASS_TO_RESYNC_FOLLOW_SETS)
    }

    export function setResyncFollowsForClass(className:string, followSet:lang.HashTable<Function[]>):void {
        CLASS_TO_RESYNC_FOLLOW_SETS.put(className, followSet)
    }

    export let CLASS_TO_LOOKAHEAD_FUNCS = new lang.HashTable<lang.HashTable<Function>>()

    export function getLookaheadFuncsForClass(className:string):lang.HashTable<Function> {
        return getFromNestedHashTable(className, CLASS_TO_LOOKAHEAD_FUNCS)
    }

    export let CLASS_TO_FIRST_AFTER_REPETITION = new lang.HashTable<lang.HashTable<interpreter.IFirstAfterRepetition>>()

    export function getFirstAfterRepForClass(className:string):lang.HashTable<interpreter.IFirstAfterRepetition> {
        return getFromNestedHashTable(className, CLASS_TO_FIRST_AFTER_REPETITION)
    }

    export let CLASS_TO_OR_LA_CACHE = new lang.HashTable<lang.HashTable<string>[]>()
    export let CLASS_TO_MANY_LA_CACHE = new lang.HashTable<lang.HashTable<string>[]>()
    export let CLASS_TO_AT_LEAST_ONE_LA_CACHE = new lang.HashTable<lang.HashTable<string>[]>()
    export let CLASS_TO_OPTION_LA_CACHE = new lang.HashTable<lang.HashTable<string>[]>()

    // TODO: CONST in typescript 1.5
    // TODO reflective test to verify this has not changed, for example (OPTION6 added)
    export let MAX_OCCURRENCE_INDEX = 5

    export function initLookAheadKeyCache(className) {
        CLASS_TO_OR_LA_CACHE[className] = new Array(MAX_OCCURRENCE_INDEX)
        CLASS_TO_MANY_LA_CACHE[className] = new Array(MAX_OCCURRENCE_INDEX)
        CLASS_TO_AT_LEAST_ONE_LA_CACHE[className] = new Array(MAX_OCCURRENCE_INDEX)
        CLASS_TO_OPTION_LA_CACHE[className] = new Array(MAX_OCCURRENCE_INDEX)

        initSingleLookAheadKeyCache(CLASS_TO_OR_LA_CACHE[className])
        initSingleLookAheadKeyCache(CLASS_TO_MANY_LA_CACHE[className])
        initSingleLookAheadKeyCache(CLASS_TO_AT_LEAST_ONE_LA_CACHE[className])
        initSingleLookAheadKeyCache(CLASS_TO_OPTION_LA_CACHE[className])
    }

    function initSingleLookAheadKeyCache(laCache:lang.HashTable<string>[]):void {
        for (let i = 0; i < MAX_OCCURRENCE_INDEX; i++) {
            laCache[i] = new lang.HashTable<string>()
        }
    }

    function getFromNestedHashTable(className:string, hashTable:lang.HashTable<any>) {
        let result = hashTable.get(className)
        if (result === undefined) {
            hashTable.put(className, new lang.HashTable<any>())
            result = hashTable.get(className)
        }
        return result
    }
}
