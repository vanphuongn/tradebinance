var Binance = require('binance-api-node').default;
// const Binance2 = require('node-binance-api');
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

var RSI = require('technicalindicators').RSI;
var bb = require('technicalindicators').BollingerBands;




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

const { StochasticRSI, ema, macd, fibonacciretracement } = require('technicalindicators');

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
// const client2 = new Binance2().options({
//     apiKey: '6aAHxmZy3L491NNOpOzts4PaQcxtcXliFxXg2ACtRW9cUw5zbBHKAHwt9HJ7DO4c',
//     apiSecret: 'lBCPfrYD9D9OeokixySh5yMNSaJgRQoYzM9gkXxMoB7JxUCyMHPkrCCw5RsvXb22',
//     useServerTime: true,
//     recvWindow: 1000, // Set a higher recvWindow to increase response timeout
// });

var log_str = "";




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

var curentSymbolOrder = ""
var curentTimeOfSymbolOrder = ""
var curentCommandTypeOfSymbolOrder = ""

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    console.log(" receive new message " + msg.text)
    const myArray = msg.text.split("_");
    if (myArray.length > 0) {
        curentSymbolOrder = myArray[0]
        curentTimeOfSymbolOrder = myArray[1]
        curentCommandTypeOfSymbolOrder = myArray[2]
    }
    else {
        curentSymbolOrder = ""
        curentTimeOfSymbolOrder = ""
        curentCommandTypeOfSymbolOrder = ""
    }
    // for(var i = 0; i < myArray.length; i++)
    // {
    //     console.log("  i " + myArray[i])
    // }
    bot.sendMessage(chatId, " receive new message " + msg.text)
})

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

function fibonacciForClosingPrice(previousClose = 0.0, currentClose = 0.0) {

    const ratio = 0.618; // Tỷ lệ Fibonacci
    var fibonacciValue = 0.0;
    fibonacciValue = Number(currentClose) - (ratio * (Number(currentClose) - Number(previousClose)));
    //  console.log("xxx "+previousClose + "  "+ currentClose  + " fb "+ fibonacciValue)
    return Number(fibonacciValue);
}

const find3TimeRedFutureForBuy = async (coinName2, timeRequest) => {

    //   console.log("coinname : " + coinName2 + "  timeRequest " + timeRequest)
    try {
        var priceDatas = await client.futuresCandles({ symbol: coinName2, limit: 1000, interval: timeRequest })
        var openPrices = []
        var closePrices = []

        var last10Prices = []
        var last5Prices = []

        //   console.log(" priceDatas[priceDatas.length-1].closeTime   "+ typeof( priceDatas[priceDatas.length-1].close));

        // console.log(coinName2+ " priceDatas " +  "  timeRequest "+ timeRequest)
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

        var inputRSI = { values: closePrices, period: 14 }
        var rsiValues = RSI.calculate(inputRSI)
        var macdInput = {
            values: closePrices,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        }

        var macdData2 = MACD.calculate(macdInput)

        var bbInput = {
            period: 20,
            values: closePrices,
            stdDev: 2
        }
        const bbResult = bb.calculate(bbInput)
        var resultLength = bbResult.length
        var lastestEma10UnderEma50 = -1;
        var lastestEma10UnderEma89 = -1;
        var idxCheck = 0;

        for (var i = idxCheck; i < ema10.length - 1; i++) {
            if ((ema10[ema10.length - 1 - i] > ema89[ema89.length - 1 - i]) && (ema10[ema10.length - 1 - i - 1] < ema89[ema89.length - 1 - i - 1])) {
                lastestEma10UnderEma89 = i;
                //  console.log("pass 1    " + lastestEma10UnderEma89)
                break;
            }
        }

        var ema10CutEma50InUnderEma89 = -1
        for (var i = idxCheck; i < ema10.length - 1; i++) {
            if ((ema10[ema10.length - 1 - i] > ema50[ema50.length - 1 - i]) && (ema10[ema10.length - 1 - i - 1] < ema50[ema50.length - 1 - i - 1])) {
                lastestEma10UnderEma50 = i;
                if (lastestEma10UnderEma50 > lastestEma10UnderEma89) {
                    ema10CutEma50InUnderEma89 = i;
                    //      console.log("pass 0    " + lastestEma10UnderEma50)
                    break;
                }
            }
        }

        var last2Time4EmaIsAscendingOrder = -1
        for (var i = ema10CutEma50InUnderEma89; i < ema10.length; i++) {
            if ((ema10[ema10.length - 1 - i] > ema20[ema20.length - 1 - i])
                && (ema20[ema20.length - 1 - i] > ema50[ema50.length - 1 - i])
                && (ema50[ema50.length - 1 - i] > ema89[ema89.length - 1 - i])
            ) {
                last2Time4EmaIsAscendingOrder = i;
                break;
            }
        }

        // cach giao dich
        // tu cay nen cao nhat khi 4 duong ema sap xep theo thu tu
        // doi khi
        // co headfake
        // sau do co cay nen enguffing thi vao lenh

        var lastest4EmaIsAscendingOrder = -1
        //  for (var idx = idxCheck; idx < ema10.length; idx++)
        {
            if ((ema10[ema10.length - 1] > ema20[ema20.length - 1])
                && (ema20[ema20.length - 1] > ema50[ema50.length - 1])
                && (ema10[ema10.length - 1] > ema89[ema89.length - 1])
                && (lastestEma10UnderEma50 > lastestEma10UnderEma89)
            ) {


                for (var i = idxCheck; i < lastestEma10UnderEma89; i++) {
                    if ((ema10[ema10.length - 1 - i] > ema20[ema20.length - 1 - i])
                        && (ema20[ema20.length - 1 - i] > ema50[ema50.length - 1 - i])
                        && (ema10[ema10.length - 1 - i] > ema89[ema89.length - 1 - i])
                        && (ema20[ema20.length - 1 - i] > ema50[ema50.length - 1 - i])
                        && (ema50[ema50.length - 1 - i] > ema89[ema89.length - 1 - i])
                        && ((ema50[ema50.length - 1 - (i + 1)] < ema89[ema89.length - 1 - (i + 1)])
                            //  && (ema50[ema50.length-1-i] > ema89[ema89.length-1-i])
                            // && ((ema10[ema10.length-1-(i+1)] < ema20[ema20.length-1-(i+1)])
                            //     || ((macdData2[(macdData2.length -1-i)].MACD > macdData2[(macdData2.length -1-i)].signal)
                            //         && (macdData2[(macdData2.length -1-(i+1))].MACD < macdData2[(macdData2.length -1-(i+1))].signal)
                            //         )
                        )
                    ) {
                        lastest4EmaIsAscendingOrder = i;
                        //       console.log("lastest4EmaIsAscendingOrder " + lastest4EmaIsAscendingOrder)
                        //   break;

                    }
                }



                // console.log("lastest4EmaIsAscendingOrder " + lastest4EmaIsAscendingOrder
                // + " last2Time4EmaIsAscendingOrder  "+ last2Time4EmaIsAscendingOrder
                // )
                if ((lastest4EmaIsAscendingOrder != -1) && (lastestEma10UnderEma89 != -1)
                    && (priceDatas[priceDatas.length - 1 - last2Time4EmaIsAscendingOrder].close > priceDatas[priceDatas.length - 1 - lastest4EmaIsAscendingOrder].close)
                ) {
                    var hasLowerEma89 = false
                    var candleHasLowerEma89Idx = -1
                    var hasHeadFake = false
                    var candleHasHeadFakeIdx = -1
                    var candleHasLowerEma89IdxArr = []
                    // check lower
                    for (var i = 0; i < lastest4EmaIsAscendingOrder; i++) {

                        if ((priceDatas[priceDatas.length - 1 - i].low < ema89[ema89.length - 1 - i])
                            && (ema10[ema10.length - 1 - i] < ema20[ema20.length - 1 - i])
                        ) {
                            hasLowerEma89 = true;
                            // cay nen nay la cay nen thap nhat
                            // thi nen i co low nho hon low trc, va nho hon low sau
                            if((priceDatas[priceDatas.length-1-i].low < priceDatas[priceDatas.length-1-(i+1)].low )
                            && (priceDatas[priceDatas.length-1-i].low < priceDatas[priceDatas.length-1-(i-1)].low )
                            )
                            {
                             candleHasLowerEma89IdxArr.push(i)
                            }
                            //    candleHasLowerEma89Idx = i
                            //   break;
                        }

                    }
                    //    console.log("candleHasLowerEma89Idx "+ candleHasLowerEma89Idx)
                    if (candleHasLowerEma89IdxArr.length > 0) {
                        for (var k = 0; k < candleHasLowerEma89IdxArr.length; k++) {
                            candleHasLowerEma89Idx = candleHasLowerEma89IdxArr.at(k)
                            if (hasLowerEma89 == true) {
                                // check xem co headfake chua
                                for (var i = 0; i < candleHasLowerEma89Idx - 1; i++) {
                                    // cay nen hien tai la cay nen do
                                    // cay nen trc do co rau nen gia cao nhat lon hon bb thi la headfake
                                    try {
                                        // console.log(" i "+ i + "  "+ priceDatas[priceDatas.length - 1 - i].close)
                                        if ((priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open)
                                            && (priceDatas[priceDatas.length - 1 - (i + 1)].high > ema10[ema10.length - 1 - (i + 1)]))//bbResult[resultLength - 1 - (i + 1)].upper)) 
                                        {
                                            hasHeadFake = true;
                                            candleHasHeadFakeIdx = i;

                                            //  break;
                                        }
                                    } catch (err) {
                                        //	 log_str += err + "  " + coinName + "\n";
                                        console.log("err 222  " + err + "  i  " + i + "\n");
                                    }
                                }
                                //   console.log("hasHeadFake + candleHasHeadFakeIdx  " + candleHasHeadFakeIdx)
                                var idexForBuy = -1
                                var hasEnguffing = false
                                var enguffingCandleIndex = -1
                                // doi cay nen xanh bat len tren cay nen do
                                for (var i = idxCheck; i < candleHasHeadFakeIdx; i++) {

                                    var twoCandleBullishInput = {
                                        open: [priceDatas[priceDatas.length - 1 - (i + 1)].open, priceDatas[priceDatas.length - 1 - (i)].open],
                                        high: [priceDatas[priceDatas.length - 1 - (i + 1)].high, priceDatas[priceDatas.length - 1 - (i)].high],
                                        close: [priceDatas[priceDatas.length - 1 - (i + 1)].close, priceDatas[priceDatas.length - 1 - (i)].close],
                                        low: [priceDatas[priceDatas.length - 1 - (i + 1)].low, priceDatas[priceDatas.length - 1 - (i)].low],
                                    }

                                    var result = false;// bullishengulfingpattern(twoCandleBullishInput);

                                    if ((priceDatas[priceDatas.length - 1 - i].close > priceDatas[priceDatas.length - 1 - i].open)
                                        && (priceDatas[priceDatas.length - 1 - (i + 1)].close < priceDatas[priceDatas.length - 1 - (i + 1)].open)
                                        && (priceDatas[priceDatas.length - 1 - (i + 2)].close < priceDatas[priceDatas.length - 1 - (i + 2)].open)
                                        && (priceDatas[priceDatas.length - 1 - i].close > priceDatas[priceDatas.length - 1 - (i + 2)].open)
                                        && (priceDatas[priceDatas.length - 1 - (i + 1)].low < ema50[ema50.length - 1 - (i + 1)])
                                    ) {
                                        result = true;
                                    }

                                    if (result == true) {
                                        if (priceDatas[priceDatas.length - 1 - (i + 1)].low <= ema20[ema20.length - 1 - (i + 1)]) {
                                            // cay nen  i+1 la cay nen thap nhat nhung van lown hon cay nen co dong cua < ema89
                                            if ((priceDatas[priceDatas.length - 1 - (i + 1)].close > priceDatas[priceDatas.length - 1 - candleHasLowerEma89Idx].close) 
                                            && (priceDatas[priceDatas.length - 1 - (i + 1)].close > ema89[ema89.length-1-candleHasLowerEma89Idx] )
                                            )
                                            {
                                                // them 1 dieu kien nua la cay nen i+1 vs cay nho hon ema89 ko co giao cat nao ma ema10 cat len ema20
                                                var hasEma10OverCutEma20 = false;
                                                for (var j = i; j < candleHasLowerEma89Idx; j++) {
                                                    if ((ema10[ema10.length - 1 - j] > ema20[ema20.length - 1 - j])
                                                        && (ema10[ema10.length - 1 - (j + 1)] < ema20[ema20.length - 1 - (j + 1)])
                                                    ) {
                                                        hasEma10OverCutEma20 = true;
                                                    }

                                                }
                                                if (hasEma10OverCutEma20 == false) {
                                                    enguffingCandleIndex = i;
                                                    //  console.log("price enguffing "+ priceDatas[priceDatas.length-1-enguffingCandleIndex].close)
                                                    hasEnguffing = true;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (hasEnguffing == true) {
                                    if (enguffingCandleIndex <= 3)// && enguffingCandleIndex >0)
                                    {
                                        bot.sendMessage(chatId, coinName2 + "  " + timeRequest + " idx buy " + enguffingCandleIndex);
                                    }
                                    console.log(coinName2 + "  " + timeRequest + " idx buy " + enguffingCandleIndex)
                                }
                            }
                        }
                    }
                }

            }

        }
    } catch (e) {
        console.log("error 2 " + e + " " + coinName2)
    }

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

        for (var coinIndex = 0; coinIndex < pricesArr.length; coinIndex++)
        // for(var coinIndex = 0; coinIndex < top20.length; coinIndex++)
        {
            var coinName2 = pricesArr[coinIndex].toString();
            // var coinName2 = top20[coinIndex].symbol ;
            //  console.log("coinName  " + coinName2)
            // var coinName2 = "CHRUSDT"

            if (coinName2.includes("USDT") && (coinName2 != "COCOSUSDT") && (coinName2 != "BICOUSDT")) {
                try {

                    var test15m = await find3TimeRedFutureForBuy(coinName2, timeRequest)

                    // var test5m = await find3TimeRedForBuy(coinName2, timeRequest)
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
    bot.sendMessage(chatId, " =============Start 1 vong requets ======");
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


            await updatePrice("5m");
            await sync();
            await updatePrice("15m");
            await sync();
            await updatePrice("30m");
            await sync();
            //
            await updatePrice("1h");
            await sync();
            await updatePrice("4h");
            await sync();



            // if (curentSymbolOrder != "") {
            //     checkTp(curentSymbolOrder, curentTimeOfSymbolOrder, curentCommandTypeOfSymbolOrder);
            // }
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
        await sync();
        await wait(10000);
    }

})();































