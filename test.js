const bullishhammer = require('technicalindicators').bullishhammer;

var singleInput = {
  open: [30.10],
  high: [32.10],
  close: [32.10],
  low: [26.10],
}

const result = bullishhammer(singleInput) ? 'yes' : 'no';
console.log(`Is Bullish Hammer Pattern? : ${result}`);
