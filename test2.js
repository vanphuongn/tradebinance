const ccxt = require('ccxt');
const talib = require('talib');

async function getKeltnerChannels(exchange, symbol, timeframe, limit, emaPeriod, atrPeriod, atrMultiplier) {
  const ohlcvs = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
  const close = ohlcvs.map((ohlcv) => ohlcv[4]);
  console.log("Close  " + close)
  const ema = talib.execute({
    name: 'EMA',
    startIdx: 0,
    endIdx: close.length - 1,
    inReal: close,
    optInTimePeriod: emaPeriod,
  }).result.outReal;
  const atr = talib.execute({
    name: 'ATR',
    startIdx: 0,
    endIdx: close.length - 1,
    high: ohlcvs.map((ohlcv) => ohlcv[2]),
    low: ohlcvs.map((ohlcv) => ohlcv[3]),
    close: close,
    optInTimePeriod: atrPeriod,
  }).result.outReal;
  const upper = ema.map((value, index) => value + atr[index] * atrMultiplier);
  const lower = ema.map((value, index) => value - atr[index] * atrMultiplier);
  return {
    upper: upper.slice(-10),
    middle: ema.slice(-10),
    lower: lower.slice(-10),
  };
}


async function main() {
  const exchange = new ccxt.binance();
  const symbol = 'BNB/USDT';
  const timeframe = '4h';
  const limit = 100;
  const emaPeriod = 10;
  const atrPeriod = 14;
  const atrMultiplier = 2;
  const keltnerChannels = await getKeltnerChannels(exchange, symbol, timeframe, limit, emaPeriod, atrPeriod, atrMultiplier);
 
  console.log(keltnerChannels);
}

main();