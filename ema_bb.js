var Binance = require('binance-api-node').default;
//const ema = require('trading-indicator').ema;
const kdj = require('kdj').kdj;
const macd = require('trading-indicator').macd;
const TelegramBot = require('node-telegram-bot-api');
var MACD = require('technicalindicators').MACD;
var EMA = require('technicalindicators').EMA

var bullishengulfingpattern =require('technicalindicators').bullishengulfingpattern;
var bullishharami =require('technicalindicators').bullishharami;
var bullishharamicross =require('technicalindicators').bullishharamicross;

var bullishmarubozu =require('technicalindicators').bullishmarubozu;
var bullishspinningtop =require('technicalindicators').bullishspinningtop;

const bullishhammer = require('technicalindicators').bullishhammer;
var threewhitesoldiers =require('technicalindicators').threewhitesoldiers;
const tweezerbottom = require('technicalindicators').tweezerbottom;

var bb = require('technicalindicators').BollingerBands;

var express = require('express');
var app     = express();
const WebSocketClient = require('ws')
app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
//const token = '1677444880:AAHC0UgHkuf0Y7NqsubVJSN4Q0WpPfFOYb8';
const token = '5967294536:AAHR4YyRbr5OdMMfVn7xvc3xFLAITBQGw4I';

const chatId = "662991734";
//const bot = new TelegramBot(token,{polling:true});

const token_warning = "6037137720:AAFBEfCG9xWY4K_3tx7VSZzMXGgmt9-Zdog"
const bot = new TelegramBot(token_warning,{polling:true});


const token_check_log_ = "6166932215:AAEbZ28_7Um4n3K64DOOA1BRisiSTg9siBQ"
const bot_check_log = new TelegramBot(token_check_log_,{polling:true});


const {StochasticRSI} = require('technicalindicators');

//const client = Binance().options({
//
//	apiKey: '6oHHrDBqe5pra9PhYEoafxbNMANrLW1XNR75B1Lqe3sFAetMapH5P18SmCRGYvPx',
//	apiSecret:'8bvKE2GciMLJHNTPpLIDOwGDG8sCOUs7dUTUQFnad3RbuulIjXYwyC4CzhYVII4H',
//	useServerTime:true,
//
//});
const client = new Binance({
   apiKey: '6aAHxmZy3L491NNOpOzts4PaQcxtcXliFxXg2ACtRW9cUw5zbBHKAHwt9HJ7DO4c',
	apiSecret:'lBCPfrYD9D9OeokixySh5yMNSaJgRQoYzM9gkXxMoB7JxUCyMHPkrCCw5RsvXb22',
	useServerTime:true,
    recvWindow: 1000, // Set a higher recvWindow to increase response timeout


});
var log_str = "";

app.get('/', function(request, response) {
    var result = 'App is running \n';
    response.send(result + log_str);

}).listen(app.get('port'), function() {
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
	await wait(timeDifference ); // Waits 1s more to make sure the prices were updated
	console.log('SYNCED WITH BINANCE SERVER! \n');
}

let ema10 = 0;
let ema20 = 0;
let ema50 = 0;

let timeRequest = "30m";
let prices ;

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp );
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

var MACD = require('technicalindicators').MACD;

requestTime = "30m"
var total_coin_phanky = 0
var coinDivergenceList = []
so_nen_check_giao_cat = 20
currentSymbols = []



const checkBUSDUSDTForBuy = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
        //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
        prices.push(Number(1.0/priceDatas[i].close))
    }

    var bbInput = {
        period: 14,
        values: prices,
        stdDev : 2
    }
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length
    // for(var i =0; i < 10; i++){
    //   //  console.log("coinName2  "+ coinName2 + JSON.stringify(result) + "  length  "+ result.length)
    //    console.log("coinName2  "+ coinName2 + "   " + bbResult[resultLength-1 -i].middle + "  "+ bbResult[resultLength-1 -i].upper+ "  "+ bbResult[resultLength -1-i].lower);
        
    // }
    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})
	
    console.log("coinName2  "+ coinName2 + "   " + ema10[ema10.length-1] + "  "+ ema89[ema89.length-1]+ "  "+ ema50[ema50.length-1] + "  "+ bbResult[bbResult.length-1].middle+ "  "+ bbResult[bbResult.length-1].lower);
    if( (ema10[ema10.length-1] > ema89[ema89.length-1])&& (ema50[ema50.length-1] > ema89[ema89.length-1]))
    {
        if( (ema10[ema10.length-1] > ema50[ema50.length-1])  && (ema10[ema10.length-2] < ema50[ema50.length-2]))
        {
            
            if((ema89[ema89.length-1]<bbResult[bbResult.length-1].middle) &&  (ema89[ema89.length-1]>bbResult[bbResult.length-1].lower))
            {
                var profit = priceDatas[priceDatas.length-1].close* 1.02
                var stoplossPersion  = 100*(1- (ema89[ema89.length-1]/priceDatas[priceDatas.length-1].close))
                bot.sendMessage(chatId,timeRequest+"   buy USDT/ couple " + coinName2 +"  profit : "+ profit+ " stoploss "+ ema89[ema89.length-1] + " %stoploss : "+ stoplossPersion);
            }
        }
    }
}


const findEmaOverForUSDTBuy = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
        //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
        prices.push(Number(priceDatas[i].close))
    }

    var bbInput = {
        period: 14,
        values: prices,
        stdDev : 2
    }
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length
    // for(var i =0; i < 10; i++){
    //   //  console.log("coinName2  "+ coinName2 + JSON.stringify(result) + "  length  "+ result.length)
    //    console.log("coinName2  "+ coinName2 + "   " + bbResult[resultLength-1 -i].middle + "  "+ bbResult[resultLength-1 -i].upper+ "  "+ bbResult[resultLength -1-i].lower);
        
    // }
    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})
	
    console.log("coinName2  "+ coinName2 + "   " + ema10[ema10.length-1] + "  "+ ema89[ema89.length-1]+ "  "+ ema50[ema50.length-1] + "  "+ bbResult[bbResult.length-1].middle+ "  "+ bbResult[bbResult.length-1].lower);
    if( (ema10[ema10.length-1] > ema89[ema89.length-1])&& (ema50[ema50.length-1] > ema89[ema89.length-1]))
    {
        if( (ema10[ema10.length-1] > ema50[ema50.length-1])  && (ema10[ema10.length-2] < ema50[ema50.length-2]))
        {
            
            if((ema89[ema89.length-1]<bbResult[bbResult.length-1].middle) &&  (ema89[ema89.length-1]>bbResult[bbResult.length-1].lower))
            {
                var profit = priceDatas[priceDatas.length-1].close* 1.02
                var stoplossPersion  = 100*(1- (ema89[ema89.length-1]/priceDatas[priceDatas.length-1].close))
                bot.sendMessage(chatId,timeRequest+"   buy " + coinName2 +"  profit : "+ profit+ " stoploss "+ ema89[ema89.length-1] + " %stoploss : "+ stoplossPersion);
            }
        }
    }
}

const getBBUper = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
      //    console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var bbInput = {
        period: 14,
        values: prices,
        stdDev : 2
    }
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length

    return bbResult[bbResult.length-1].upper
}

const getBBLower = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
      //    console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var bbInput = {
        period: 14,
        values: prices,
        stdDev : 2
    }
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length

    return bbResult[bbResult.length-1].lower
}
const findEmaOverForBuy = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
      //    console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var bbInput = {
        period: 20,
        values: prices,
        stdDev : 2
    }
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length
    // for(var i =0; i < 10; i++){
    //   //  console.log("coinName2  "+ coinName2 + JSON.stringify(result) + "  length  "+ result.length)
    //    console.log("coinName2  "+ coinName2 + "   " + bbResult[resultLength-1 -i].middle + "  "+ bbResult[resultLength-1 -i].upper+ "  "+ bbResult[resultLength -1-i].lower);
        
    // }
    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})

    var lastestEMa10OverEma20 = 1000;
    for(var i =0; i < ema10.length;i++){
        if((ema10[ema10.length-1-i] < ema20[ema20.length-1-i])&&(ema10[ema10.length-1-(i+1)] > ema20[ema20.length-1-(i+1)]))
        {
            lastestEMa10OverEma20 =i;
            break;
        }
    }
    var lastestEMa89UnderBBLower = 1000;
    for(var i =0; i < ema89.length;i++){
        if((ema89[ema89.length-1-i] > bbResult[bbResult.length-1-i].lower)&& (ema89[ema89.length-1-(i+1)] < bbResult[bbResult.length-1-(i+1)].lower))
        {
            // console.log(coinName2 +  "    timeStamp "+ timeRequest
            // +"  ema89  "+ ema89[ema89.length-1-i]
            // + " bbResult_lower  " + bbResult[bbResult.length-1-i-1].lower
            // +"  ema89 -2 "+ ema89[ema89.length-1-i]
            // + " bbResult_lower -2 " + bbResult[bbResult.length-1-i-1].lower
            // + "  i  "+ i
            // )
            lastestEMa89UnderBBLower = i;
            break;
        }
    }

    var lastestEMa10OUnderEma20 = 1000;
    for(var i =0; i < ema10.length;i++){
        if((ema10[ema10.length-1-i] > ema20[ema20.length-1-i])&&(ema10[ema10.length-1-(i+1)] < ema20[ema20.length-1-(i+1)]))
        {
            lastestEMa10OUnderEma20 =i;
            break;
        }
    }


    var lastestCandleBlueAfterRed = 1000;
    for(var i =0; i < lastestEMa10OUnderEma20; i++){
        // tu cay nen hien tai den cay nen ma ema10 cat ema20 tu duoi len
        // neu cay nen trc do la cay nen đỏ, cây hiện tại là xanh thì vào lệnh
        var hightLastCandle = Math.abs(priceDatas[priceDatas.length-1-(i+1)].close-priceDatas[priceDatas.length-1-(i+1)].open)
        if((priceDatas[priceDatas.length-1-(i+1)].close > priceDatas[priceDatas.length-1-(i+1)].open)  // cay nen trc la xanh
        && (priceDatas[priceDatas.length-1-(i+2)].close < priceDatas[priceDatas.length-1-(i+2)].open) // nen trc 2 cay la do
        && (priceDatas[priceDatas.length-1-i].close > (priceDatas[priceDatas.length-1-(i+1)].open + 0.5*hightLastCandle))// nen hien tai xanh
        && (i+2 < lastestEMa10OUnderEma20)
        )
        {
            lastestCandleBlueAfterRed = i;
          

        }
    }
    // console.log(coinName2 +  "    timeStamp "+ timeRequest
    // +"  lastestCandleBlueAfterRed  "+ lastestCandleBlueAfterRed
   
    // )
 
    var checkAllEma89UnderEma10 = true;
    if(lastestEMa89UnderBBLower < lastestEMa10OverEma20)
    {
       // console.log("coinName2  "+ coinName2 + "    timeStamp "+ timeRequest+"  lastestEMa89UnderBBLower  "+lastestEMa89UnderBBLower+ "   "+ ema10[ema10.length-1] +"  "+ bbResult[bbResult.length-1].middle+ "  "+ bbResult[bbResult.length-1].lower);
       
        if( (ema10[ema10.length-1] > ema89[ema89.length-1])&& (ema50[ema50.length-1] > ema89[ema89.length-1]))
        {
           // if( (ema10[ema10.length-1] > ema20[ema20.length-1])  && (ema10[ema10.length-2] < ema20[ema20.length-2]))
           if((lastestCandleBlueAfterRed ==0) &&(ema10[ema10.length-1] > ema20[ema20.length-1]) )
           {
                if((ema89[ema89.length-1]< bbResult[bbResult.length-1].middle) &&  (ema89[ema89.length-1]>bbResult[bbResult.length-1].lower))
                {
                
                    var hasEMa10UnderEma89 = false;
                    for(var i =0; i < lastestEMa89UnderBBLower; i++)
                    {
                        // neu co truong hop tu luc cat den luc hien tai ma ema10 co duoi ema89 thi loai
                        if(ema10[ema10.length-1-i]< ema89[ema89.length-1-i] )
                        {
                            hasEMa10UnderEma89 = true;
                            break;
                        }
                    }
                    if((hasEMa10UnderEma89 == false)&& (priceDatas[priceDatas.length-1-lastestEMa89UnderBBLower].close <bbResult[bbResult.length-1-lastestEMa89UnderBBLower].middle )){
                       var higherTimeReques = "4h"
                       if(timeRequest == "15m")
                       {
                        higherTimeReques = "30m"
                       }else if(timeRequest == "30m")
                       {
                        higherTimeReques = "1h"
                       }else if(timeRequest == "1h")
                       {
                        higherTimeReques = "2h"
                       }else if(timeRequest == "2h")
                       {
                        higherTimeReques = "4h"
                       }  else if(timeRequest == "4h")
                       {
                        higherTimeReques = "8h"
                       }
                       
                       var bbUpperOfHigherTime = await getBBUper(coinName2, higherTimeReques)
                       var profitPercen = ((bbUpperOfHigherTime/priceDatas[priceDatas.length-1].close)-1)*100
                        //var profit = priceDatas[priceDatas.length-1].close* 1.02
                        var stoplossPersion  = 100*(1- ( priceDatas[ priceDatas.length-1-lastestEMa10OUnderEma20].close/priceDatas[priceDatas.length-1].close))
                        bot.sendMessage(chatId,timeRequest+"   buy " + coinName2 +" \n profit : "+ bbUpperOfHigherTime + " \n% profit "+profitPercen + "\n stoploss "+ priceDatas[ priceDatas.length-1-lastestEMa10OUnderEma20].close+ " \n%stoploss : "+ stoplossPersion);
                    }
                }
            }
        }
    }
}

const findEmaOverForSell = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
        //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
        prices.push(Number(priceDatas[i].close))
    }

    var bbInput = {
        period: 20,
        values: prices,
        stdDev : 2
    }
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length
    // for(var i =0; i < 10; i++){
    //   //  console.log("coinName2  "+ coinName2 + JSON.stringify(result) + "  length  "+ result.length)
    //    console.log("coinName2  "+ coinName2 + "   " + bbResult[resultLength-1 -i].middle + "  "+ bbResult[resultLength-1 -i].upper+ "  "+ bbResult[resultLength -1-i].lower);
        
    // }
    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})
	
    var lastestEMa10UnderEma20 = 1000;
    for(var i =0; i < ema10.length;i++){
        if((ema10[ema10.length-1-i]  > ema20[ema20.length-1-i])&&(ema10[ema10.length-1-(i+1)] < ema20[ema20.length-1-(i+1)]))
        {
            lastestEMa10UnderEma20 =i;
            break;
        }
    }
    var lastestEMa89OverBBUpper = 1000;
    for(var i =0; i < ema89.length;i++){
        if((ema89[ema89.length-1-i] < bbResult[bbResult.length-1-i].upper)&& (ema89[ema89.length-1-(i+1)] > bbResult[bbResult.length-1-(i+1)].upper))
        {
            lastestEMa89OverBBUpper = i;
            break;
        }
    }

    var lastestEMa1O_OverEma20 = 1000;
    for(var i =0; i < ema10.length;i++){
        if((ema10[ema10.length-1-i] < ema20[ema20.length-1-i])&&(ema10[ema10.length-1-(i+1)] > ema20[ema20.length-1-(i+1)]))
        {
            lastestEMa1O_OverEma20 =i;
            break;
        }
    }


    var lastestCandleRedAfterBlue= 1000;
    for(var i =0; i < lastestEMa1O_OverEma20; i++){
        //
        // tu cay nen hien tai den cay nen ma ema10 cat ema20 tu duoi len
        // neu cay nen trc do la cay nen đỏ, cây hiện tại là xanh thì vào lệnh
        var hightLastCandle = Math.abs(priceDatas[priceDatas.length-1-(i+1)].close-priceDatas[priceDatas.length-1-(i+1)].open)
        
        if((priceDatas[priceDatas.length-1-(i+1)].close < priceDatas[priceDatas.length-1-(i+1)].open)// cay nen trc do la do
        && (priceDatas[priceDatas.length-1-(i+2)].close > priceDatas[priceDatas.length-1-(i+2)].open) // cay nen trc 2 cay la nen xanh
        && (priceDatas[priceDatas.length-1-i].close < (priceDatas[priceDatas.length-1-(i+1)].open-0.5*hightLastCandle)
        && (i+2 < lastestEMa1O_OverEma20)
        ) // cay hien tai thap hon cay trc do
        )
        {
            lastestCandleRedAfterBlue = i;
        }
    }

     console.log(coinName2 +  "    timeStamp "+ timeRequest
     +"  lastestCandleRedAfterBlue  "+ lastestCandleRedAfterBlue
     + " close "+ priceDatas[priceDatas.length-1].close
     + "  open "+ priceDatas[priceDatas.length-1].open
     )

    if(lastestEMa89OverBBUpper < lastestEMa10UnderEma20){
       console.log("coinName2  "+ coinName2 + "    timeStamp "+ timeRequest+"  lastestEMa89OverBBUpper  "+lastestEMa89OverBBUpper+ "   "+ ema10[ema10.length-1] + "  "+ ema89[ema89.length-1]+ "  "+ ema50[ema50.length-1] + "  "+ bbResult[bbResult.length-1].middle+ "  "+ bbResult[bbResult.length-1].upper);
  //  console.log("coinName2  "+ coinName2 + "   " + ema10[ema10.length-1] + "  "+ ema89[ema89.length-1]+ "  "+ ema50[ema50.length-1] + "  "+ bbResult[bbResult.length-1].middle+ "  "+ bbResult[bbResult.length-1].lower);
        if( (ema10[ema10.length-1] < ema89[ema89.length-1])&& (ema50[ema50.length-1] < ema89[ema89.length-1]))
        {
            //if( (ema10[ema10.length-1] < ema20[ema20.length-1])  && (ema10[ema10.length-2] > ema20[ema20.length-2]))
            if((lastestCandleRedAfterBlue == 0)&&(ema10[ema10.length-1] < ema20[ema20.length-1]))
            {
                
                if((ema89[ema89.length-1]>bbResult[bbResult.length-1].middle) &&  (ema89[ema89.length-1]<bbResult[bbResult.length-1].upper))
                {

                    var hasEMa10OverEma89 = false;
                    for(var i =0; i < lastestEMa89OverBBUpper; i++)
                    {
                        // neu co truong hop tu luc cat den luc hien tai ma ema10 co duoi ema89 thi loai
                        if(ema10[ema10.length-1-i]> ema89[ema89.length-1-i])
                        {
                            hasEMa10OverEma89 = true;
                            break;
                        }
                    }
                    if((hasEMa10OverEma89 == false)&& (priceDatas[priceDatas.length-1-lastestEMa89OverBBUpper].close >bbResult[bbResult.length-1-lastestEMa89OverBBUpper].middle) ){
                      
                        var higherTimeReques = "4h"
                       if(timeRequest == "15m")
                       {
                        higherTimeReques = "30m"
                       }else if(timeRequest == "30m")
                       {
                        higherTimeReques = "1h"
                       }else if(timeRequest == "1h")
                       {
                        higherTimeReques = "2h"
                       }else if(timeRequest == "2h")
                       {
                        higherTimeReques = "4h"
                       }
                       else if(timeRequest == "4h")
                       {
                        higherTimeReques = "8h"
                       }
                       
                       var bbLowerOfHigherTime = await getBBLower(coinName2, higherTimeReques)
                       var profitPercen =((priceDatas[priceDatas.length-1].close/bbLowerOfHigherTime)-1)*100

                      //  var profit = priceDatas[priceDatas.length-1].close* 0.98
                        var stoplossPersion  = 100*(1- (priceDatas[priceDatas.length-1].close/priceDatas[priceDatas.length-1-lastestEMa1O_OverEma20].close))
                        bot.sendMessage(chatId,timeRequest+"   sell " + coinName2 +" \n profit : "+ bbLowerOfHigherTime+"\n % profit  "+profitPercen + " \nstoploss "+  priceDatas[priceDatas.length-1-lastestEMa1O_OverEma20].close + "\n %stoploss : "+ stoplossPersion);
                    }
                }
            }
        }
    }
}


const updatePrice = async(timeRequest )=>{

    try {

		let accountInfo = await client.accountInfo();

        currentSymbols = await client.futuresOpenOrders()
		//  currentSymbols = []
		//  currentSymbols = await client.futuresOpenOrders()
		// console.log(currentSymbols);
        //  for(var i = 0; i < currentSymbols.length ;i++)
        //  {
        //     checkStopLoss(currentSymbols[i].symbol, "15m",currentSymbols[i].positionSide)
        //  }

    //    var top20 = []
    //     await client.futuresDailyStats().then(tickers => {
    //           top20 = tickers.sort((a, b) => b.volume - a.volume).slice(0, 30);
    //     }).catch(error => {
    //       console.error(error);
    //     });
        // console.log(top20)
        //  for(var i =0; i < top20.length; i ++){
        //         console.log("symbol   "+ top20[i].symbol)
        //     }
       // console.log("Top 20  " + JSON.stringify(top20))
       

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
         var test30m =  await  checkBUSDUSDTForBuy("BUSDUSDT", "30m")
         await wait(200);
      var test1h =  await  checkBUSDUSDTForBuy("BUSDUSDT", "1h")
      await wait(200);
      var test2h =  await  checkBUSDUSDTForBuy("BUSDUSDT", "2h")
      await wait(200);
      var test4h =  await  checkBUSDUSDTForBuy("BUSDUSDT", "4h")
      await wait(200);

      var test30m =  await  checkBUSDUSDTForBuy("USDCUSDT", "30m")
      await wait(200);
   var test1h =  await  checkBUSDUSDTForBuy("USDCUSDT", "1h")
   await wait(200);
   var test2h =  await  checkBUSDUSDTForBuy("USDCUSDT", "2h")
   await wait(200);
   var test4h =  await  checkBUSDUSDTForBuy("USDCUSDT", "4h")
   await wait(200);

   //       var test30m =  await  updatePriceForBuy(coinName2, "15m")
   var test30m =  await  findEmaOverForUSDTBuy("USDCUSDT", "30m")
   await wait(200);
var test1h =  await  findEmaOverForUSDTBuy("USDCUSDT", "1h")
await wait(200);
var test2h =  await  findEmaOverForUSDTBuy("USDCUSDT", "2h")
await wait(200);
var test4h =  await  findEmaOverForUSDTBuy("USDCUSDT", "4h")
await wait(200);

//       var test30m =  await  updatePriceForBuy(coinName2, "15m")
var test30m =  await  findEmaOverForUSDTBuy("BUSDUSDT", "30m")
await wait(200);
var test1h =  await  findEmaOverForUSDTBuy("BUSDUSDT", "1h")
await wait(200);
var test2h =  await  findEmaOverForUSDTBuy("BUSDUSDT", "2h")
await wait(200);
var test4h =  await  findEmaOverForUSDTBuy("BUSDUSDT", "4h")
await wait(200);

     for(var coinIndex = 0; coinIndex < pricesArr.length; coinIndex++)
      // for(var coinIndex = 0; coinIndex < top20.length; coinIndex++)
         {
           var coinName2 = pricesArr[coinIndex].toString() ;
              // var coinName2 = top20[coinIndex].symbol ;
          //    console.log("coinName  " + coinName2)
          //	var coinName2= "RADUSDT"
               if(coinName2.includes("USDT"))
                {
                    try{
                        
                       var test15m =  await  findEmaOverForBuy(coinName2, "15m")
                       var test30m =  await  findEmaOverForBuy(coinName2, "30m")
                       await wait(200);
                    var test1h =  await  findEmaOverForBuy(coinName2, "1h")
                    await wait(200);
                    var test2h =  await  findEmaOverForBuy(coinName2, "2h")
                    await wait(200);
                    var test4h =  await  findEmaOverForBuy(coinName2, "4h")
                    await wait(200);

                    var test15m =  await  findEmaOverForSell(coinName2, "15m")
                    await wait(200);
                    var test30m =  await  findEmaOverForSell(coinName2, "30m")
                    await wait(200);
                 var test1h =  await  findEmaOverForSell(coinName2, "1h")
                 await wait(200);
                 var test2h =  await  findEmaOverForSell(coinName2, "2h")
                 await wait(200);
                 var test4h =  await  findEmaOverForSell(coinName2, "4h")
                 await wait(200);
                 //   var test8h =  await  findEmaOverForBuy(coinName2, "8h")
               //     await wait(100);
                //    var test12h =  await  findEmaOverForBuy(coinName2, "12h")
                     
                    }catch(err){
                        console.log(coinName2+"  "+ err + "\n");
                        continue;
                       
                    }
                //	coinNameChars = coinName.split("USDT");
                //	coinName= coinNameChars[0]+ "/"+ "USDT"

                }
                await wait(200);
        }


    } catch (err) {
    //	 log_str += err + "  " + coinName + "\n";
       console.log(err + "\n");
    }
}


const makeSellOrder = async(currentPrice, btcQuantity)=>{
	console.log("Making sell order with price " + currentPrice);
	
		console.log("sell quantity " + btcQuantity);

	sellOrderInfo = await client.order({
		symbol: coin_name,
		side: 'SELL',
		quantity: btcQuantity,
		price: currentPrice,
	});
	console.log('sellOrderInfo: ', sellOrderInfo, '\n');
}

const waitSellOrderCompletion = async()=>{
	console.log('Waiting sell order completion');
	for(let i = 0; i < 5; i++)
		{
			sellOrderInfo = await client.getOrder({

				symbol:coin_name,
				orderId: sellOrderInfo.orderId,
			});

			if(sellOrderInfo.status === 'FILLED')
				{
					console.log('SALE COMPLETE! \n');
					return 'success';
				}
				await wait(ORDER_UPDATE_PERIOD);
		}
	if(sellOrderInfo.status === 'PARTIALLY_FILLED'){
		console.log('SALE PARTIALLY FILLED, CONTINUING');
		
		while(true){
			sellOrderInfo = await client.getOrder({
				symbol: coin_name,
				orderId: sellOrderInfo.orderId,
			});
			// console.log('sellOrderInfo: ', sellOrderInfo);
			if(sellOrderInfo.status === 'FILLED'){
				console.log('SALE COMPLETE! \n');
				return 'success';
			}
			await wait(ORDER_UPDATE_PERIOD);
		}
	}
	console.log('SALE TIMED OUT, CANCELLING \n');
	await client.cancelOrder({
		symbol: coin_name,
  		orderId: sellOrderInfo.orderId,
	});
	return 'failure';
}



(async function main(){

	let buySuccess = null;

	//	await updateEMA();
	//bot.sendMessage(chatId," =============Start 1 vong requets ======" );
	while(true)
	{
			log_str = "";
		//	bot.sendMessage(chatId," =============Start 1 vong requets ======" );
			 try{
				
			//	await sell();
				
			 }catch(e){
				console.log("Error for sell", e);
				process.exit(-1);
			 }
			 
			try{

			    await updatePrice("4h");
//			     await updateEMA("15m");
//				await updateEMA("30m");
//				await updateEMA("1h");
				await sync();
			}catch(e){
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
		await wait(10000);
	}

})();





































