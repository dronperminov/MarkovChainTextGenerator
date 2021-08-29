function MarkovChain(text, n, regex) {
    this.n = n
    this.regex = regex
    this.tokens = text.match(regex)
    this.table = this.CalculateTable()
}

MarkovChain.prototype.Table2Probabilities = function(table) {
    for (let prefix of Object.keys(table)) {
        total = 0

        for (let value of Object.values(table[prefix]))
            total += value

        for (suffix of Object.keys(table[prefix]))
            table[prefix][suffix] /= total
    }

    return table
}

MarkovChain.prototype.CalculateTable = function() {
    table = {}

    for (let i = 0; i < this.tokens.length - this.n; i++) {
        let x = this.tokens.slice(i, i + this.n).join('')
        let y = this.tokens[i + this.n]

        if (x in table) {
            table[x][y] = y in table[x] ? table[x][y] + 1 : 1
        }
        else {
            table[x] = {}
            table[x][y] = 1
        }
    }

    return this.Table2Probabilities(table)
}

MarkovChain.prototype.RandomChoice = function(values) {
    return values[Math.floor(Math.random() * values.length)]
}

MarkovChain.prototype.WeightedRandomChoice = function(values, probability) {
    let sum = probability.reduce((sum, v) => sum + v)

    if (probability.find((p) => p < 0) != undefined) {
        throw Error("Probability can not contain negative values");
    }

    if (values.length != probability.length) {
        throw Error("Events have to be same length as probability");
    }

    let probabilityRanges = probability.reduce((ranges, v, i) => {
        let start = i > 0 ? ranges[i - 1][1] : 0 - Number.EPSILON
        ranges.push([start, v + start + Number.EPSILON])
        return ranges
    }, []);

    let random = Math.random()
    return values[probabilityRanges.findIndex((v, i) => random > v[0] && random <= v[1])]
}

MarkovChain.prototype.GetNextWord = function(prefix) {
    let tokens = prefix.match(this.regex) || []
    prefix = tokens.slice(tokens.length - this.n).join('')

    if (prefix in this.table) {
        let possibleChars = Object.keys(this.table[prefix])
        let possibleProbs = Object.values(this.table[prefix])

        return this.WeightedRandomChoice(possibleChars, possibleProbs)
    }

    return this.RandomChoice(Object.keys(this.table))
}

MarkovChain.prototype.Generate = function(prefix, maxLength) {
    let sentence = prefix

    for (let i = 0; i < maxLength; i++)
        sentence += this.GetNextWord(sentence)

    return sentence
}
