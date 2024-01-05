var Binance = require('binance-api-node').default;
//const ema = require('trading-indicator').ema;


const TelegramBot = require('node-telegram-bot-api');
var MACD = require('technicalindicators').MACD;
var EMA = require('technicalindicators').EMA

var bullishengulfingpattern = require('technicalindicators').bullishengulfingpattern;
var morningstar = require('technicalindicators').morningstar;
var bullishharami = require('technicalindicators').bullishharami;
var bullishharamicross = require('technicalindicators').bullishharamicross;

var bullishmarubozu = require('technicalindicators').bullishmarubozu;
var bullishspinningtop = require('technicalindicators').bullishspinningtop;

const bullishhammer = require('technicalindicators').bullishhammer;
var threewhitesoldiers = require('technicalindicators').threewhitesoldiers;
const tweezerbottom = require('technicalindicators').tweezerbottom;

var bb = require('technicalindicators').BollingerBands;

var express = require('express');
var app = express();
const WebSocketClient = require('ws')
app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
//const token = '1677444880:AAHC0UgHkuf0Y7NqsubVJSN4Q0WpPfFOYb8';
const token = '5967294536:AAHR4YyRbr5OdMMfVn7xvc3xFLAITBQGw4I';

const chatId = "662991734";
const HaID = "197407951"
//const bot = new TelegramBot(token,{polling:true});

const token_warning = "6037137720:AAFBEfCG9xWY4K_3tx7VSZzMXGgmt9-Zdog"
const bot = new TelegramBot(token_warning, { polling: true });


const token_check_log_ = "6166932215:AAEbZ28_7Um4n3K64DOOA1BRisiSTg9siBQ"
const bot_check_log = new TelegramBot(token_check_log_, { polling: true });


const { StochasticRSI, ema, macd } = require('technicalindicators');

//const client = Binance().options({
//
//	apiKey: '6oHHrDBqe5pra9PhYEoafxbNMANrLW1XNR75B1Lqe3sFAetMapH5P18SmCRGYvPx',
//	apiSecret:'8bvKE2GciMLJHNTPpLIDOwGDG8sCOUs7dUTUQFnad3RbuulIjXYwyC4CzhYVII4H',
//	useServerTime:true,kdj
//
//});
const client = new Binance({
    apiKey: '6aAHxmZy3L491NNOpOzts4PaQcxtcXliFxXg2ACtRW9cUw5zbBHKAHwt9HJ7DO4c',
    apiSecret: 'lBCPfrYD9D9OeokixySh5yMNSaJgRQoYzM9gkXxMoB7JxUCyMHPkrCCw5RsvXb22',
    useServerTime: true,
    recvWindow: 1000, // Set a higher recvWindow to increase response timeout


});
var log_str = "";

app.get('/', function (request, response) {
    var result = 'App is running \n';
    response.send(result + log_str);

}).listen(app.get('port'), function () {
    console.log('App is running, server is listening on port ', app.get('port'));
});


// VARIABLES - Binance API
let buyOrderInfo = null;
let sellOrderInfo = null;
let INDEX_USDT = 11;
const PRICE_UPDATE_PERIOD = 5000; // Price update times varies a lot
const ORDER_UPDATE_PERIOD = 3000;

let coin_name = 'ETHUSDT';
let INDEX_COINT = 2;

// Pauses execution for a specified amount of time
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Synchronizes with the Binance API server
const sync = async () => {
    console.log('SYNCING ...');
    let serverTime = await client.time();
    console.log('serverTime: ', serverTime);
    let timeDifference = serverTime % 60000;
    console.log('timeDifference: ', timeDifference);
    await wait(timeDifference); // Waits 1s more to make sure the prices were updated
    console.log('SYNCED WITH BINANCE SERVER! \n');
}

let ema10 = 0;
let ema20 = 0;
let ema50 = 0;

let timeRequest = "30m";
let prices;

function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}

var MACD = require('technicalindicators').MACD;

requestTime = "30m"
var total_coin_phanky = 0
var coinDivergenceList = []
so_nen_check_giao_cat = 20
currentSymbols = []



const getLowe2LeverTimeRequest = (timeRequest) => {
    var higherTimeRequest = timeRequest
    if (timeRequest == "15m") {
        higherTimeRequest = "3m"
    } else if (timeRequest == "30m") {
        higherTimeRequest = "5m"
    } else if (timeRequest == "1h") {
        higherTimeRequest = "15m"
    } else if (timeRequest == "2h") {
        higherTimeRequest = "30m"
    }
    else if (timeRequest == "4h") {
        higherTimeRequest = "1h"
    }
    else if (timeRequest == "6h") {
        higherTimeRequest = "1h"
    }
    else if (timeRequest == "8h") {
        higherTimeRequest = "2h"
    }

    return higherTimeRequest;

}

const getHigherTimeRequest = (timeRequest) => {
    var higherTimeRequest = timeRequest
    if (timeRequest == "15m") {
        higherTimeRequest = "30m"
    } else if (timeRequest == "30m") {
        higherTimeRequest = "1h"
    } else if (timeRequest == "1h") {
        higherTimeRequest = "2h"
    } else if (timeRequest == "2h") {
        higherTimeRequest = "4h"
    }
    else if (timeRequest == "4h") {
        higherTimeRequest = "6h"
    }
    else if (timeRequest == "6h") {
        higherTimeRequest = "8h"
    }
    else if (timeRequest == "8h") {
        higherTimeRequest = "12h"
    }

    return higherTimeRequest;

}


class RedRange {
    constructor(start, stop, delta) {
        this.startIndex = start;
        this.stopIndex = stop;
        this.deltaPrice = delta;
    }
}

function isBullishPinbar(candle) {
    // Kiểm tra xem cây nến có phải là pinbar tăng không
    const bodyLength = Math.abs(candle.open - candle.close);
    const upperShadowLength = candle.high - Math.max(candle.open, candle.close);
    const lowerShadowLength = Math.min(candle.open, candle.close) - candle.low;

    const isBullish = candle.close > candle.open;
    const hasLongUpperShadow = lowerShadowLength >= bodyLength * 2;

    return isBullish && hasLongUpperShadow;
}

const checkHigherEma89 = async (coinName2, timeRequestNumber) => {
    try {
        console.log("timeRequestNumber  " + timeRequestNumber)
        var higherTimeRequest = getHigherTimeRequest(string(timeRequestNumber) + "m")
        console.log("higherTimeRequest  " + higherTimeRequest)
        let priceDatas = await client.futuresCandles({ symbol: coinName2, limit: 1000, interval: higherTimeRequest })
        var openPrices = []
        var closePrices = []

        var last10Prices = []
        var last5Prices = []

        // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))

        //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
        for (var i = 0; i < priceDatas.length; i++) {
            // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
            closePrices.push(Number(priceDatas[i].close))
            openPrices.push(Number(priceDatas[i].open))
        }

        var ema10 = EMA.calculate({ period: 10, values: closePrices })
        var ema20 = EMA.calculate({ period: 20, values: closePrices })
        var ema34 = EMA.calculate({ period: 34, values: closePrices })
        var ema50 = EMA.calculate({ period: 50, values: closePrices })
        var ema89 = EMA.calculate({ period: 89, values: closePrices })
        var ema200 = EMA.calculate({ period: 200, values: closePrices })

        if (ema10[ema10.length - 1] > ema89[ema89.length - 1]) {
            return true;
        }
    } catch (error) {
        console.log(" err 444" + err)
    }
    return false;
}

const findEmaOverForBuy = async (coinName2, timeRequest) => {

    // var timeRequest = ""
    // if (timeRequestNumber < 5) {
    //     timeRequest = timeRequestNumber + "h"
    // } else {
    //     timeRequest = timeRequestNumber + "m"
    // }

    var priceDatas = await client.futuresCandles({ symbol: coinName2, limit: 1000, interval: timeRequest })
    var openPrices = []
    var closePrices = []

    var last10Prices = []
    var last5Prices = []

    //  console.log(" priceDatas[priceDatas.length-1].closeTime   "+ typeof( priceDatas[priceDatas.length-1].close));

    //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for (var i = 0; i < priceDatas.length; i++) {
        //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        closePrices.push(Number(priceDatas[i].close))
        openPrices.push(Number(priceDatas[i].open))
    }

    var ema10 = EMA.calculate({ period: 10, values: closePrices })
    var ema20 = EMA.calculate({ period: 20, values: closePrices })
    var ema34 = EMA.calculate({ period: 34, values: closePrices })
    var ema50 = EMA.calculate({ period: 50, values: closePrices })
    var ema89 = EMA.calculate({ period: 89, values: closePrices })
    var ema200 = EMA.calculate({ period: 200, values: closePrices })


    for (var i = beginIndex; i <= beginIndexArr[0]; i++) {
        // console.log(coinName2 + "  " + timeRequest + " ===== beginIndexArr========= "+ beginIndexArr )
        if ((priceDatas[priceDatas.length - 1 - i].close >= priceDatas[priceDatas.length - 1 - i].open)
            && (priceDatas[priceDatas.length - 1 - (i + 1)].close >= priceDatas[priceDatas.length - 1 - (i + 1)].open)
            && (priceDatas[priceDatas.length - 1 - (i + 2)].close >= priceDatas[priceDatas.length - 1 - (i + 2)].open)
        ) {

            lastBegin3CandleBlue = i;
            tpValue = priceDatas[priceDatas.length - 1 - i].close - priceDatas[priceDatas.length - 1 - (i + 2)].open;
            //   console.log(coinName2 + "  " + timeRequest + " ===== lastBegin3CandleBlue========= "+ lastBegin3CandleBlue )

        }
    }

    return false;

}

const findEmaOverForSell = async (coinName2, timeRequest) => {

    // var timeRequest = ""
    // if (timeRequestNumber < 5) {
    //     timeRequest = timeRequestNumber + "h"
    // } else {
    //     timeRequest = timeRequestNumber + "m"
    // }
    try {



        var priceDatas = await client.futuresCandles({ symbol: coinName2, limit: 1000, interval: timeRequest })
        var openPrices = []
        var closePrices = []

        var last10Prices = []
        var last5Prices = []

        //  console.log(" priceDatas[priceDatas.length-1].closeTime   "+ typeof( priceDatas[priceDatas.length-1].close));

        //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
        for (var i = 0; i < priceDatas.length; i++) {
            //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
            closePrices.push(Number(priceDatas[i].close))
            openPrices.push(Number(priceDatas[i].open))
        }

        var ema10 = EMA.calculate({ period: 10, values: closePrices })
        var ema20 = EMA.calculate({ period: 20, values: closePrices })
        var ema34 = EMA.calculate({ period: 34, values: closePrices })
        var ema50 = EMA.calculate({ period: 50, values: closePrices })
        var ema89 = EMA.calculate({ period: 89, values: closePrices })
        var ema200 = EMA.calculate({ period: 200, values: closePrices })


        if (ema10[ema10.length - 1] < ema89[ema89.length - 1]) {

            // for sell
            var lastestEma10OverEma89 = 1000;
            for (var i = 0; i < priceDatas.length; i++) {
                if ((ema10[ema10.length - 1 - i] < ema89[ema89.length - 1 - i]) && ((ema10[ema10.length - 1 - (i + 1)] > ema89[ema89.length - 1 - (i + 1)]))) {
                    lastestEma10OverEma89 = i;
                    break;
                }
            }


            //     console.log(coinName2+" "+ timeRequest + " lastestEma10OverEma89 " + lastestEma10OverEma89)
            {


                var priceFromLastestEma10OverEma89Arr = []

                var beginIndex = 0;
                for (var i = beginIndex; i < lastestEma10OverEma89; i++) {
                    priceFromLastestEma10OverEma89Arr.push(priceDatas[priceDatas.length - 1 - i].close);
                }

                var priceMinFromLastestEma10OverEma89 = Math.min(...priceFromLastestEma10OverEma89Arr)
                var min_89_index = -1;

                for (var i = beginIndex; i < lastestEma10OverEma89; i++) {
                    if (priceDatas[priceDatas.length - 1 - i].close == priceMinFromLastestEma10OverEma89) {
                        min_89_index = i;
                        break;
                    }

                }


                var threeCandleBlueTime = 0;
                // mang nay luu tru gia tri min cua cac bo 3 cay nen
                var maxPriceArr = []
                // luu tru cac cay nen dau tien cua bo 3 cay nen 
                var beginIndexArr = []

                //     console.log("min_89_index "+ min_89_index + "  lastestEma10OverEma89 "+ lastestEma10OverEma89+" priceMinFromLastestEma10OverEma89 "+ priceMinFromLastestEma10OverEma89)
                // tinh tu cay nen co gia cao nhat tu khi ema10  cat ema89 tu duoi len
                for (var i = beginIndex; i < min_89_index; i++) {

                    try {
                        // tim cay nen xanh
                        if ((priceDatas[priceDatas.length - 1 - i].close > priceDatas[priceDatas.length - 1 - i].open)) {

                            var index_begin = i;
                            var hasCanleRed = false;


                            // tim 3 cay nen xanh lien tiep
                            // 
                            while (hasCanleRed == false) {

                                // if ((priceDatas[priceDatas.length - 1 - i].close > priceDatas[priceDatas.length - 1 - i].open)
                                //     && ((priceDatas[priceDatas.length - 1 - (i + 1)].close > priceDatas[priceDatas.length - 1 - (i + 1)].open) ||
                                //         ((priceDatas[priceDatas.length - 1 - (i + 1)].close <= priceDatas[priceDatas.length - 1 - (i + 1)].open)
                                //             && (priceDatas[priceDatas.length - 1 - (i + 2)].close > priceDatas[priceDatas.length - 1 - (i + 2)].open)
                                //             && (priceDatas[priceDatas.length - 1 - (i + 1)].close > priceDatas[priceDatas.length - 1 - (i + 2)].open)
                                //             && (priceDatas[priceDatas.length - 1 - (i)].close > priceDatas[priceDatas.length - 1 - (i + 1)].open)
                                //         )
                                //     )
                                // ) 
                                if ((priceDatas[priceDatas.length - 1 - i].close > priceDatas[priceDatas.length - 1 - i].open)
                                    || ((priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open)
                                        && (i > 0)
                                        && (priceDatas[priceDatas.length - 1 - (i + 1)].close > priceDatas[priceDatas.length - 1 - (i + 1)].open)
                                        && (priceDatas[priceDatas.length - 1 - (i - 1)].close > priceDatas[priceDatas.length - 1 - (i - 1)].open)
                                        && (priceDatas[priceDatas.length - 1 - (i)].open <= priceDatas[priceDatas.length - 1 - (i + 1)].close)
                                        && (priceDatas[priceDatas.length - 1 - (i)].close >= priceDatas[priceDatas.length - 1 - (i - 1)].low)
                                        && (priceDatas[priceDatas.length - 1 - (i)].open < priceDatas[priceDatas.length - 1 - (i - 1)].close) // cay nen do nay co gia mo cua nho hon gia dong cua cay nen -1
                                        && (priceDatas[priceDatas.length - 1 - (i)].low >= priceDatas[priceDatas.length - 1 - (i + 1)].low)
                                        &&  (Math.abs(priceDatas[priceDatas.length - 1 - (i)].close - priceDatas[priceDatas.length - 1 - (i)].open) < 0.5*Math.abs(priceDatas[priceDatas.length - 1 - (i+1)].close - priceDatas[priceDatas.length - 1 - (i+1)].open))
                                    )
                                ) {
                                    i = i + 1;
                                } else {
                                    hasCanleRed = true;
                                    break;
                                }

                            }

                            var index_end = i;



                            hasCanleRed = false;
                            // neu so cay nen do lien tiep > 2 thi add vao mang 
                            if (index_end - index_begin >= 2) {
                                var bluePriceArr = [];
                                for (var j = index_begin; j < index_end; j++) {

                                    bluePriceArr.push(priceDatas[priceDatas.length - 1 - j].close)
                                }
                                var maxPriceI = Math.max(...bluePriceArr)
                                maxPriceArr.push(maxPriceI)
                                // console.log(" minPriceArr  "+ minPriceI)

                                beginIndexArr.push(index_begin)
                                threeCandleBlueTime += 1;

                                if (threeCandleBlueTime >= 3) {

                                    //    console.log(coinName2 +"  "+ timeRequest+ " threeCandleRedTime "+ threeCandleBlueTime + " index_begin " + index_begin )
                                }

                            }
                        }

                    } catch (error) {
                        console.log("errpr  2" + error + "  coinName2 " + coinName2)
                        return false;
                    }
                }

                // for(var i =0; i < minPriceArr.length; i++)
                // {
                //     console.log(" minPriceArr  "+ minPriceArr[i])
                // }

                // neu bo 3 cay nen thoa man cac cap giam dan thi xuong duoi
                // neu tu khi ema10 cat ema89 có so bo 3 cay nen > 3 thi chay xuong duoi
                if ((maxPriceArr[0] > maxPriceArr[1])
                    && (maxPriceArr[1] > maxPriceArr[2])
                    && (threeCandleBlueTime >= 3)
                ) {
                    var lastBegin3CandleRed = -1;
                    var tpValue = 0;

                    // tim bo 3 cay nen do gan nhat vs bo 3 cay nen do
                    for (var i = beginIndex; i <= beginIndexArr[0]; i++) {

                        if ((priceDatas[priceDatas.length - 1 - i].close <= priceDatas[priceDatas.length - 1 - i].open)
                            && (priceDatas[priceDatas.length - 1 - (i + 1)].close <= priceDatas[priceDatas.length - 1 - (i + 1)].open)
                            && (priceDatas[priceDatas.length - 1 - (i + 2)].close <= priceDatas[priceDatas.length - 1 - (i + 2)].open)
                        ) {

                            lastBegin3CandleRed = i;
                            tpValue = priceDatas[priceDatas.length - 1 - (i + 2)].open - priceDatas[priceDatas.length - 1 - i].close;
                            //console.log(coinName2+ " =====check sell lastBegin3CandleRed========= "+ lastBegin3CandleRed  + " index_begin_0  " + beginIndexArr[0] + " " + beginIndexArr[1] + " " + beginIndexArr[2] );
                        }
                    }

                    if (lastBegin3CandleRed > 0) {
                        //console.log(" ===== lastBegin3CandleBlue========= "+ lastBegin3CandleBlue )
                        console.log(coinName2 + "  " + timeRequest + " =====check sell lastBegin3CandleRed========= " + lastBegin3CandleRed + " index_begin_0  " + beginIndexArr[0] + " " + beginIndexArr[1] + " " + beginIndexArr[2]);
                    }
                    var index_for_sell = -1;
                    // 
                    if (lastBegin3CandleRed > 1) {
                        // tim cay nen do gan nhat vs bo 3 cay nen do lien tiep mà phai xen lan it nhat 1 nen xanh
                        // cay nen do phai dong cua thap hon cay nen do thap nhat trong bo 3 cay nen do ben tren
                        for (var i = 0; i < lastBegin3CandleRed; i++) {
                            var hasBlueCandle = false;

                            if ((priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open)
                                && (priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - lastBegin3CandleRed].close)
                                && (priceDatas[priceDatas.length - 1 - i].high > priceDatas[priceDatas.length - 1 - lastBegin3CandleRed].close)

                            ) {
                                for (var j = i; j < lastBegin3CandleRed; j++) {
                                    if ((priceDatas[priceDatas.length - 1 - j].close > priceDatas[priceDatas.length - 1 - j].open)) {
                                        hasBlueCandle = true;
                                    }
                                }

                                if (hasBlueCandle == true) {
                                    index_for_sell = i;
                                }
                            }
                        }
                    }

                    if ((index_for_sell < 5) && (index_for_sell > 0)) {
                        var maxPriceArr = []
                        var maxValueBuy = 0;
                        for (var i = index_for_sell; i < lastBegin3CandleRed; i++) {
                            maxPriceArr.push(priceDatas[priceDatas.length - 1 - i].high);
                        }
                        maxValueBuy = Math.max(...maxPriceArr)
                        var tpPrice = maxValueBuy - tpValue;

                        var tpPercen = (1 - (tpPrice / parseFloat(priceDatas[priceDatas.length - 1].close))) * 100;
                        var slPercen = ((maxValueBuy / parseFloat(priceDatas[priceDatas.length - 1].close)) - 1) * 100;

                        var hasCanleHitedTp = false;
                        for (var i = 0; i < lastBegin3CandleRed; i++) {
                            if (priceDatas[priceDatas.length - 1 - i].low < tpPrice) {
                                hasCanleHitedTp = true;
                            }
                        }

                        if ((tpPrice < priceDatas[priceDatas.length - 1].close) ) {
                            if( (hasCanleHitedTp == false))
                            {
                                var logData = " sell " + coinName2 + "  " + timeRequest + "  " + index_for_sell + " lastRed " + lastBegin3CandleRed + " index_begin_0  " + beginIndexArr[0] + " " + beginIndexArr[1] + " " + beginIndexArr[2]
                                    + " tpPercen " + tpPercen + " tp " + tpPrice + " slPercen " + slPercen + " sl " + maxValueBuy;
                                console.log(logData);
                                bot.sendMessage(chatId, logData);
                            }else{
                                var logData = "  da hit sell " + coinName2 + "  " + timeRequest + "  " + index_for_sell + " lastRed " + lastBegin3CandleRed + " index_begin_0  " + beginIndexArr[0] + " " + beginIndexArr[1] + " " + beginIndexArr[2]
                                + " tpPercen " + tpPercen + " tp " + tpPrice + " slPercen " + slPercen + " sl " + maxValueBuy;
                                console.log(logData);
                            }

                        }
                    }
                }


            }


        }
    } catch (err) {
        console.log("err 5 " + err)
    }

    return false;

}
const updatePrice = async (timeRequest) => {

    try {

        let accountInfo = await client.accountInfo();

        currentSymbols = await client.futuresOpenOrders()

        //	prices = await client.prices();
        prices = await client.futuresPrices();
        let pricesArr = Object.keys(prices);
        total_coin_phanky = 0
        coinDivergenceList = []


        //	currentSymbols = await client.futuresOpenOrders()
        //  currentSymbols = []
        //  currentSymbols = await client.futuresOpenOrders()
        // console.log(currentSymbols);

        //   var test15m =  await  updatePriceForBuy(coinName2, "15m")
        //          var test30m =  await  checkBUSDUSDTForBuy("BUSDUSDT", "30m")
        //          await wait(100);
        //       var test1h =  await  checkBUSDUSDTForBuy("BUSDUSDT", "1h")
        //       await wait(100);
        //       var test2h =  await  checkBUSDUSDTForBuy("BUSDUSDT", "2h")
        //       await wait(100);
        //       var test4h =  await  checkBUSDUSDTForBuy("BUSDUSDT", "4h")
        //       await wait(100);

        //       var test30m =  await  checkBUSDUSDTForBuy("USDCUSDT", "30m")
        //       await wait(100);
        //    var test1h =  await  checkBUSDUSDTForBuy("USDCUSDT", "1h")
        //    await wait(100);
        //    var test2h =  await  checkBUSDUSDTForBuy("USDCUSDT", "2h")
        //    await wait(100);
        //    var test4h =  await  checkBUSDUSDTForBuy("USDCUSDT", "4h")
        //    await wait(100);

        //    //       var test30m =  await  updatePriceForBuy(coinName2, "15m")
        //    var test30m =  await  findEmaOverForUSDTBuy("USDCUSDT", "30m")
        //    await wait(100);
        // var test1h =  await  findEmaOverForUSDTBuy("USDCUSDT", "1h")
        // await wait(100);
        // var test2h =  await  findEmaOverForUSDTBuy("USDCUSDT", "2h")
        // await wait(100);
        // var test4h =  await  findEmaOverForUSDTBuy("USDCUSDT", "4h")
        // await wait(100);


        // // //       var test30m =  await  updatePriceForBuy(coinName2, "15m")
        // var test30m =  await  findEmaOverForUSDTBuy("BUSDUSDT", "30m")
        // await wait(100);
        // var test1h =  await  findEmaOverForUSDTBuy("BUSDUSDT", "1h")
        // await wait(100);
        // var test2h =  await  findEmaOverForUSDTBuy("BUSDUSDT", "2h")
        // await wait(100);
        // var test4h =  await  findEmaOverForUSDTBuy("BUSDUSDT", "4h")
        // await wait(100);


        for (var coinIndex = 0; coinIndex < pricesArr.length; coinIndex++)
        // for(var coinIndex = 0; coinIndex < top20.length; coinIndex++)
        {
            var coinName2 = pricesArr[coinIndex].toString();
            // var coinName2 = top20[coinIndex].symbol ;
            //   console.log("coinName  " + coinName2)
         //   var coinName2 = "KNCUSDT"

            if (coinName2.includes("USDT") && (coinName2 != "COCOSUSDT") && (coinName2 != "BICOUSDT")) {
                try {
                    var timeRequestNumber = 5;
                    var score = 0;
                    var timeRequestStr = "";
                    //var test15m = await findEmaOverForBuy(coinName2, 3)
                    // var test5m = await findEmaOverForBuy(coinName2, "3m")
                    // await wait(100);
                     //var test5m = await findEmaOverForBuy(coinName2, "5m")
                    await wait(200);
                    var test15m = await findEmaOverForBuy(coinName2, "15m")
                    await wait(200);
                     var test30m = await findEmaOverForBuy(coinName2, "30m")
                    // await wait(100);
                    // nho hon 5 thi la gio await wait(100);
                    //   var test1h = await findEmaOverForBuy(coinName2, "1h")
                    await wait(200);
                    // var test2h = await findEmaOverForBuy(coinName2, "2h")
                    // await wait(100);
                  //   var test4h = await findEmaOverForBuy(coinName2, "4h")
                    // var test2h = await findEmaOverForBuy(coinName2, "8h")
                    // var test4h = await findEmaOverForBuy(coinName2, "12h")

                 //   var test5m = await findEmaOverForSell(coinName2, "5m")
                    await wait(200);
                   //  var test5m = await findEmaOverForSell(coinName2, "5m")
                    await wait(200);
                   var test5m = await findEmaOverForSell(coinName2, "15m")
                    // await wait(100);
                    var test5m = await findEmaOverForSell(coinName2, "30m")
                    await wait(200);
                 //      var test5m = await findEmaOverForSell(coinName2, "1h")
                    await wait(100);
                    //var test5m = await findEmaOverForSell(coinName2, "4h")

                } catch (err) {
                    console.log(coinName2 + "  " + err + "\n");
                    continue;

                }
                //	coinNameChars = coinName.split("USDT");
                //	coinName= coinNameChars[0]+ "/"+ "USDT"

            }
            await wait(100);
            //   break;
        }


    } catch (err) {
        //	 log_str += err + "  " + coinName + "\n";
        console.log(err + "\n");
    }
}

(async function main() {

    let buySuccess = null;

    //	await updateEMA();
    //bot.sendMessage(chatId," =============Start 1 vong requets ======" );
    while (true) {
        log_str = "";
        //	bot.sendMessage(chatId," =============Start 1 vong requets ======" );
        try {

            //	await sell();

        } catch (e) {
            console.log("Error for sell", e);
            process.exit(-1);
        }

        try {

            await updatePrice("4h");
            //			     await updateEMA("15m");
            //				await updateEMA("30m");
            //				await updateEMA("1h");
            await sync();
        } catch (e) {
            console.log('Erorr Update ema', e);
            process.exit(-1);
        }

        // console.log("ema10 " + ema10 + "ema20 " + ema20 + "ema50 " + ema50);
        // // console.log("ema20 " + ema20);
        // // console.log("ema50 " + ema50);

        // //buySuccess = await buy();
        // if(ema10 > ema20 && ema10 > ema50
        // 	&& ema20 > ema50)
        // {
        // 	try{

        // 	//	buySuccess = await buy();
        // 	} catch (e) {
        // 		console.log('ERROR IN buy(): ', e);
        // 		console.log('RESUMING OPERATIONS\n');
        // 		continue;
        // 	}
        // 	// buy
        // }else{
        // 	console.log("Doi mua");
        // }
        // if(buySuccess === 'failure') continue; 
        //	bot.sendMessage(chatId," =============Ket thuc 1 vong requets ======" );
        await wait(20000);
    }

})();




































