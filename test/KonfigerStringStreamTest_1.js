
const KonfigerStream = require("../src/io/github/thecarisma/KonfigerStream.js")

var ks = KonfigerStream.stringStream(`
Ones:11111111111
Twos:2222222222222
Threes:3333333333333
Fours:444444444444
Fives:5555555555555
`, ':', '\n')
while (ks.hasNext()) {
    console.log(ks.next())
}