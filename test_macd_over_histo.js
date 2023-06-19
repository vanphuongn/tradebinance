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




const findEmaOverForBuy = async(coinName2, timeRequest)=>{
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

    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})
	
    // kiem tra 100 nen gan nhat
    var lastestOverForBuyIndex = 1000
    var lastedEma15OverEma50 = 1000
    var tyle2 = 0

    for(var i = 0; i < 100; i++){
        if( (ema10[ema10.length-1 -i] < ema50[ema50.length-1-i]) 
        // && (ema20[ema20.length-1-i] < ema34[ema34.length-1-i]) 
        && (ema10[ema10.length-1-(i+1)] > ema50[ema50.length-1-(i+1)]) 
        )
        {
            lastedEma15OverEma50 = i; 
            break;
        }
    }
    for(var i = 0; i < 100; i++){
        if( (ema10[ema10.length-1 -i] < ema20[ema20.length-1-i]) 
        // && (ema20[ema20.length-1-i] < ema34[ema34.length-1-i]) 
        && (ema20[ema20.length-1-i] < ema50[ema50.length-1-i]) 
        && (ema50[ema50.length-1-i] < ema89[ema89.length-1-i]) 
        && (ema10[ema10.length-1 ] < ema20[ema20.length-1]) 
        //   && (ema50[ema50.length-1] > ema200[ema200.length-1])
            )
        {

                tyle2 = (((ema10[ema10.length-1-i] - priceDatas[priceDatas.length-1-i].high)) / (( ema89[ema89.length-1-i] -ema10[ema10.length-1-i] ))) 
                if( tyle2> 0.6)
                {
                    lastestOverForBuyIndex = i;
                    break;
                        //    console.log( coinName2 + " chuan bij buy  "  + timeRequest )
                    //      bot.sendMessage(chatId,coinName2 + " chuan bi buy do ( ema10-price)> (ema89-ema10) > 1.5  "  + "  tyle: "+ tyle + "  "  + timeRequest)
                    
                }
                
            
        } 

    }
   

    if((lastestOverForBuyIndex < 15) && (lastedEma15OverEma50 >=4) && (lastedEma15OverEma50 < 100) ){
      
        var timeRequest2 = "15m"
       
     
      //  var check15m = checkEMA15mForBuy(coinName2,timeRequest2)
        var score = 0

        var checkEma10_4hUnderForBuy =  await checkEma10IsUnderForBuy(coinName2,"4h")
        if(checkEma10_4hUnderForBuy == true){
            var check15m = await checkMACD15mForBuy(coinName2,"15m")

            var check5m = await checkMACD15mForBuy(coinName2,"5m")
            var check3m = await checkMACD15mForBuy(coinName2,"3m")

        
            //console.log("checkEma10_4hUnderForBuy  " +checkEma10_4hUnderForBuy)
            var timeCheck = ""
            if(check15m == true){
                score +=1;
                timeCheck += " 15m "
            }
            if(check5m == true){
                score +=1;
                timeCheck += " 5m "
            }
            if(check3m == true){
                score +=1;
                timeCheck += " 3m "

            }

            if((check15m == true) ||(check5m == true) || (check3m == true))
        // if(score > 1)
            {
            
                    bot.sendMessage(chatId," buy "+ coinName2 + " timerequest "+ timeRequest + "  timecheck: "+ timeCheck);
                    console.log(coinName2+"   lastest over for buy :index "+ lastestOverForBuyIndex + "  lastedEma15OverEma50 "+ lastedEma15OverEma50  + " timerequest  "+ timeRequest)
                    return true;
                
            }
         }
        return false;
    }

    return false;
    
}

const checkMACD15mForBuy= async (coinName2, timeRequest)=>{
    try{
  //  console.log("check macd  15m buy "+ coinName2 + " timeRequest "+ timeRequest)
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
       //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
        prices.push(Number(priceDatas[i].close))
    }

    var macdInput = {
        values            : prices,
        fastPeriod        : 12,
        slowPeriod        : 26,
        signalPeriod      : 9 ,
        SimpleMAOscillator: false,
        SimpleMASignal    : false
    }

    var macdData2 = MACD.calculate(macdInput)
    const macdCrossUnderToOver = [];
    const macdCrossOverToUnder = [];

    for(var i = 0; i < 200; i++){
        if( (macdData2[(macdData2.length -1)-i].MACD < macdData2[(macdData2.length -1)-i].signal)
        && (macdData2[(macdData2.length -1)-(i+1)].MACD > macdData2[(macdData2.length -1)-(i+1)].signal)
        )
        {
            macdCrossOverToUnder.push(i)
        }

        if( (macdData2[(macdData2.length -1)-i].MACD > macdData2[(macdData2.length -1)-i].signal)
        && (macdData2[(macdData2.length -1)-(i+1)].MACD < macdData2[(macdData2.length -1)-(i+1)].signal)
        )
        {
             //  console.log(timeRequest + "  "+i  +"  macdData  " + macdData2[i].MACD)
            macdCrossUnderToOver.push(i)
        }
    }

    var min0 =0
    var min1 = 0
    var checkPhanky = false;
    console.log(timeRequest+ "  check buy coinName  "+ coinName2+ "  macdCrossUnderToOver  " + macdCrossUnderToOver + " crossOverToUnder[0]  "+macdCrossOverToUnder  )
  
   // console.log("coinName  "+ coinName2+ "  crossUnderToOver  " + crossUnderToOver  )
    if(macdCrossUnderToOver[0] == 0){
        var lasPrices0=[]
        var macdValues0 =[]
        for(var i = 0; i <  macdCrossOverToUnder[0]; i++)
        {
    //	    console.log(i + "    priceDatas " + priceDatas[i].close)
            lasPrices0.push(parseFloat(priceDatas[priceDatas.length-1-i].close))
            macdValues0.push(parseFloat(macdData2[macdData2.length-1-i].MACD))
        }

        min0 = Math.min( ...lasPrices0 )
        var macdMin0 = Math.min( ...macdValues0 )

       // console.log("macdValues0   "+macdValues0)
        var indexOfMin0 = lasPrices0.indexOf(min0)
       
        
        var lasPrices1=[]
        var macdValues1 =[]
        for(var i = macdCrossUnderToOver[1]; i <  macdCrossOverToUnder[1]; i++)
        {
    	  //  console.log(i + "    priceDatas " + priceDatas[i].close)
            lasPrices1.push(parseFloat(priceDatas[priceDatas.length-1-i].close))
            macdValues1.push(parseFloat(macdData2[macdData2.length-1-i].MACD))
        }

        min1 = Math.min( ...lasPrices1 )
        var macdMin1 = Math.min( ...macdValues1 )
        var indexOfMin1= lasPrices1.indexOf(min1)

  
        // console.log(timeRequest+" check buy coinName  "+ coinName2 + "indexOfMin "+ indexOfMin0 + "  min "+min0 
        // + "  macdAtMin0 "+ macdMin0 + " macdAtMin1  "+ macdMin1
        // )

        if((min0<min1) && (macdMin0 > macdMin1)){
          //  bot.sendMessage(chatId,timeRequest+"   buy " + coinName2 + " stoploss "+ min0);
            console.log(timeRequest+"MACD phan ky for buy "+ coinName2 + "  min0 "+min0 + "  min1 "+ min1)
            checkPhanky = true;
            return true;
        }
    }
    }catch(err){
        console.log(err + "\n");
       // return checkPhanky;
       return false;
    
    }
    return false;
   // return checkPhanky;
}
const checkEMA15mForBuy= async (coinName2, timeRequest)=>{
  
    console.log("check 15m buy "+ coinName2 + " timeRequest "+ timeRequest)
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest})
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
        //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
        prices.push(Number(priceDatas[i].close))
    }

    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})

    //tim cac thoi diem ema10 cat ema20 tu duoi len
    var lastedEma15OverEma20 =1000;

    const crossUnderToOver = [];
    const crossOverToUnder = [];



    for(var i = 0; i < 200; i++){
        if( (ema10[ema10.length-1 -i] < ema20[ema20.length-1-i]) 
        // && (ema20[ema20.length-1-i] < ema34[ema34.length-1-i]) 
        && (ema10[ema10.length-1-(i+1)] > ema20[ema20.length-1- (i+1)]) 
        )
        {
            crossOverToUnder.push(i)
        }
    }

    for(var i = 0; i < 200; i++){
        if( (ema10[ema10.length-1 -i] > ema20[ema20.length-1-i]) 
        // && (ema20[ema20.length-1-i] < ema34[ema34.length-1-i]) 
        && (ema10[ema10.length-1-(i+1)] < ema20[ema20.length-1- (i+1)]) 
        )
        {
            crossUnderToOver.push(i)
        }
    }
    var min0 =0
    var min1 = 0
    
   // console.log("coinName  "+ coinName2+ "  crossUnderToOver  " + crossUnderToOver  )
    if(crossUnderToOver[0] == 0){
        var lasPrices0=[]
        for(var i = 0; i <  crossOverToUnder[0]; i++)
        {
    //	    console.log(i + "    priceDatas " + priceDatas[i].close)
            lasPrices0.push(priceDatas[priceDatas.length-1-i].close)
        }

        
        min0 = Math.min( ...lasPrices0 )
   

        
        var lasPrices1=[]
        for(var i = crossUnderToOver[1]; i <  crossOverToUnder[1]; i++)
        {
    	  //  console.log(i + "    priceDatas " + priceDatas[i].close)
            lasPrices1.push(priceDatas[priceDatas.length-1-i].close)
        }

        min1 = Math.min( ...lasPrices1 )
        if(min0<min1){
            bot.sendMessage(chatId,"   buy" + coinName2 + " stoploss "+ min0);
            console.log("Ema10 cat ema20 tu duoi len va xac nhan tang gia "+ coinName2 + "  min0 "+min0 + "  min1 "+ min1)
            return true;
        }
    }
    return false;
    
}

const checkEma10IsOverForSell = async(coinName2, timeRequest)=>{
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

    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})

    if( (ema10[ema10.length-1] > ema20[ema20.length-1]) 
    && (ema20[ema20.length-1] > ema50[ema50.length-1]) 
   // && (ema50[ema50.length-1] > ema89[ema89.length-1]) 
    )
    {
        return true;
    }
    return false;
}
const checkEma10IsUnderForBuy = async(coinName2, timeRequest)=>{
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

    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})

    if( (ema10[ema10.length-1] < ema20[ema20.length-1]) 
    && (ema20[ema20.length-1] < ema50[ema50.length-1]) 
  //  && (ema50[ema50.length-1] < ema89[ema89.length-1]) 
    )
    {
        return true;
        
    }
    return false;
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

    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})
	
    // kiem tra 100 nen gan nhat
    var lastestUnderForSellIndex = 1000;
    var lastedEma15OUnderEma50 = 1000
    var tyle2 = 0

    for(var i = 0; i < 100; i++){
        if( (ema10[ema10.length-1 -i] > ema50[ema50.length-1-i]) 
        // && (ema20[ema20.length-1-i] < ema34[ema34.length-1-i]) 
        && (ema10[ema10.length-1-(i+1)] < ema50[ema50.length-1-(i+1)]) 
        )
        {
            lastedEma15OUnderEma50 = i; 
            break;
        }
    }
    for(var i = 0; i < 100; i++){
        if( (ema10[ema10.length-1 -i] > ema20[ema20.length-1-i]) 
        // && (ema20[ema20.length-1-i] < ema34[ema34.length-1-i]) 
        && (ema20[ema20.length-1-i] > ema50[ema50.length-1-i]) 
        && (ema50[ema50.length-1-i] > ema89[ema89.length-1-i]) 
        && (ema10[ema10.length-1 ] > ema20[ema20.length-1])
          // && (ema50[ema50.length-1] > ema200[ema200.length-1])
            )
        {

               // tyle2 = (((ema10[ema10.length-1-i] - priceDatas[priceDatas.length-1-i].high)) / (( ema89[ema89.length-1-i] -ema10[ema10.length-1-i] ))) 
          //  if(((priceDatas[priceDatas.length-1 - i].low - ema10[ema10.length-1- i]) )> ((ema10[ema10.length-1- i] - ema89[ema89.length-1- i])))
            {
               // tim chi so gan nhat ma gia qua mua
               tyle2 = (((priceDatas[priceDatas.length-1- i].low - ema10[ema10.length-1- i]) )/ ((ema10[ema10.length-1- i] - ema89[ema89.length-1- i]))) 
               if( tyle2> 0.6)
                {
                    lastestUnderForSellIndex = i;
                    break;
                        //    console.log( coinName2 + " chuan bij buy  "  + timeRequest )
                    //      bot.sendMessage(chatId,coinName2 + " chuan bi buy do ( ema10-price)> (ema89-ema10) > 1.5  "  + "  tyle: "+ tyle + "  "  + timeRequest)
                    
                }
            }
        } 
    }


    if((lastestUnderForSellIndex < 15) && (lastedEma15OUnderEma50 >=4) && (lastedEma15OUnderEma50 < 100) ){
        var timeRequest2 = "15m"
        // if(timeRequest == "1h" ||timeRequest == "30m" )
        // {
        //     timeRequest2 ="5m"
        // }
      //  var check15m = checkEMA15mForSell(coinName2,timeRequest2)
      var checkEma10OverForSell =  await checkEma10IsOverForSell(coinName2,"4h")

      if(checkEma10OverForSell == true){
            var check15m = await checkMACD15mForSell(coinName2,"15m")
            var check5m = await checkMACD15mForSell(coinName2,"5m")
            var check3m = await checkMACD15mForSell(coinName2,"30m")
        

            var score = 0;
            var timeCheck = ""
            if(check15m == true){
                score +=1;
                timeCheck += " 15m "
            }
            if(check5m == true){
                score +=1;
                timeCheck += " 5m "
            }
            if(check3m == true){
                score +=1;
                timeCheck += " 3m "
            }

            if((check15m == true)||(check5m == true)|| (check3m == true))
        //  if(score > 1)
            {
             
                bot.sendMessage(chatId,"   sell   " + coinName2 + " timeRequest "+ timeRequest +" timeCheck "+ timeCheck);
                console.log("lastest over for sell :index "+ lastestUnderForSellIndex + "  lastedEma15OUnderEma50 "+ lastedEma15OUnderEma50  + " timerequest  "+ timeRequest)
                return true;
                
            }

            return false;
        }
    }
    return false;
}

const checkMACD15mForSell= async (coinName2,timeRequest)=>{
   // console.log("check macd 15m sell "+ coinName2 + " timeRequest "+ timeRequest)
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []

  //  console.log("priceData"+ priceDatas)
    for(var i =0; i < priceDatas.length; i++)
    {
 //         console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
        prices.push(Number(priceDatas[i].close))
    }

    var macdInput = {
        values            : prices,
        fastPeriod        : 12,
        slowPeriod        : 26,
        signalPeriod      : 9 ,
        SimpleMAOscillator: false,
        SimpleMASignal    : false
    }

    var macdData2 = MACD.calculate(macdInput)

    const macdCrossUnderToOver = [];
    const macdCrossOverToUnder = [];


    for(var i = 0; i < 200; i++){
        if( (macdData2[(macdData2.length -1)-i].MACD < macdData2[(macdData2.length -1)-i].signal)
        && (macdData2[(macdData2.length -1)-(i+1)].MACD > macdData2[(macdData2.length -1)-(i+1)].signal)
        )
        {
            macdCrossOverToUnder.push(i)
        }
        if( (macdData2[(macdData2.length -1)-i].MACD > macdData2[(macdData2.length -1)-i].signal)
        && (macdData2[(macdData2.length -1)-(i+1)].MACD < macdData2[(macdData2.length -1)-(i+1)].signal)
        )
        {
        //       console.log(i  +"  macdData  " + macdData2[i].MACD)
            macdCrossUnderToOver.push(i)
        }
    }

 

   // console.log("coinName  "+ coinName2+ "  crossOverToUnder  " + macdCrossUnderToOver + " crossOverToUnder[0]  "+macdCrossOverToUnder[0] )
    var max0 =0
    var max1 = 0
    var checkPhanky = false;
    if(macdCrossOverToUnder[0] == 0){
         
     
           var lasPrices0=[]
           var macdValues0 =[]
           for(var i = 0; i <  macdCrossUnderToOver[0]; i++)
           {
       //	    console.log(i + "    priceDatas " + priceDatas[i].close)
               lasPrices0.push(priceDatas[priceDatas.length-1-i].close)
               macdValues0.push(parseFloat(macdData2[macdData2.length-1-i].MACD))
           }
   
           max0 = Math.max( ...lasPrices0 )
           var macdMax0 = Math.max( ...macdValues0 )

        //   console.log("macdValues0   "+macdValues0)
           var indexOfMax0 = lasPrices0.indexOf(max0)
   
           
           var lasPrices1=[]
           var macdValues1 =[]
           for(var i = macdCrossOverToUnder[1]; i <  macdCrossUnderToOver[1]; i++)
           {
             //  console.log(i + "    priceDatas " + priceDatas[i].close)
               lasPrices1.push(priceDatas[priceDatas.length-1-i].close)
               macdValues1.push(parseFloat(macdData2[macdData2.length-1-i].MACD))
           }
   
           max1 = Math.max( ...lasPrices1 )
           var macdMax1 = Math.max( ...macdValues1 )

          // console.log("macdValues0   "+macdValues0)
           var indexOfMax1 = lasPrices1.indexOf(max1)
        //    console.log(timeRequest+" check sell coinName  "+ coinName2 + "indexOfMin "+ indexOfMax0 + "  max "+max0 
        // + "  macdAtMax0 "+ macdMax0 + " macdMax1  "+ macdMax1
        // )

           if((max0> max1)&& (macdMax0 < macdMax1)){
             //  bot.sendMessage(chatId,timeRequest+"   sell" + coinName2 + " stoploss "+ max0);
               console.log(timeRequest+"macd phan ki giam gia "+ coinName2 + "  max0 "+max1 + "  min1 "+ max1)
               checkPhanky = true;
           }
       }
      
       return checkPhanky;
}

const checkEMA15mForSell= async (coinName2,timeRequest)=>{
  
    console.log("check 15m sell "+ coinName2 + " timeRequest "+ timeRequest)
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


   

    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})

    //tim cac thoi diem ema10 cat ema20 tu duoi len
    var lastedEma15OverEma20 =1000;

    const crossUnderToOver = [];
    const crossOverToUnder = [];



    for(var i = 0; i < 200; i++){
        if( (ema10[ema10.length-1 -i] < ema20[ema20.length-1-i]) 
        // && (ema20[ema20.length-1-i] < ema34[ema34.length-1-i]) 
        && (ema10[ema10.length-1-(i+1)] > ema20[ema20.length-1- (i+1)]) 
        )
        {
            crossOverToUnder.push(i)
        }
    }

    for(var i = 0; i < 200; i++){
        if( (ema10[ema10.length-1 -i] > ema20[ema20.length-1-i]) 
        // && (ema20[ema20.length-1-i] < ema34[ema34.length-1-i]) 
        && (ema10[ema10.length-1-(i+1)] < ema20[ema20.length-1- (i+1)]) 
        )
        {
            crossUnderToOver.push(i)
        }
    }
    var max0 =0
    var max1 = 0
    
  // console.log("coinName  "+ coinName2+ "  crossOverToUnder  " + crossOverToUnder + " crossOverToUnder[0]  "+crossOverToUnder[0] )
    if(crossOverToUnder[0] == 0){
     //   console.log("coinName  "+ coinName2+ "  crossOverToUnder  " + crossOverToUnder + " crossOverToUnder[0]  "+crossOverToUnder[0] )
  
        var lasPrices0=[]
        for(var i = 0; i <  crossUnderToOver[0]; i++)
        {
    //	    console.log(i + "    priceDatas " + priceDatas[i].close)
            lasPrices0.push(priceDatas[priceDatas.length-1-i].close)
        }

        max0 = Math.max( ...lasPrices0 )

        
        var lasPrices1=[]
        for(var i = crossOverToUnder[1]; i <  crossUnderToOver[1]; i++)
        {
    	  //  console.log(i + "    priceDatas " + priceDatas[i].close)
            lasPrices1.push(priceDatas[priceDatas.length-1-i].close)
        }

        max1 = Math.max( ...lasPrices1 )
        
        if(max0< max1){
            bot.sendMessage(chatId,timeRequest+ "   sell " + coinName2 + " stoploss "+ max0);
            console.log("Ema10 cat ema20 tu duoi tren xuong va xac nhan giam gia "+ coinName2 + "  max0 "+max1 + "  min1 "+ max1)
            return true;
        }
    }
   
    return false;
    
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

     for(var coinIndex = 0; coinIndex < pricesArr.length; coinIndex++)
      // for(var coinIndex = 0; coinIndex < top20.length; coinIndex++)
         {
           var coinName2 = pricesArr[coinIndex].toString() ;
              // var coinName2 = top20[coinIndex].symbol ;
          //    console.log("coinName  " + coinName2)
          // 	var coinName2= "CTKUSDT"
               if(coinName2.includes("USDT"))
                {
                    try{
                        
                                              
                //       var test30m =  await  updatePriceForBuy(coinName2, "15m")
                   //    var test30m =  await  updatePriceForBuy(coinName2, "30m")

                   var score_buy = 0
                    var test30mbuy =  await  findEmaOverForBuy(coinName2, "30m")
                   
                       var test1hbuy =  await  findEmaOverForBuy(coinName2, "1h")
                       await wait(100);
                       var test2hbuy =  await  findEmaOverForBuy(coinName2, "2h")
                await wait(100);
                       var test4hbuy =  await  findEmaOverForBuy(coinName2, "4h")

                       if(test30mbuy == true){
                            score_buy +=1;
                       }

                       if(test1hbuy == true){
                        score_buy +=1;
                       }
                       if(test2hbuy == true){
                        score_buy +=1;
                       }
                       if(test4hbuy == true){
                        score_buy +=1;
                       }
                       if(score_buy > 0){
                        console.log("Coinname "+ coinName2 + " score buy : " + score_buy)
                       }
                       if(score_buy > 1){
                        bot.sendMessage(chatId," === buy ===  "+ coinName2 + " score_buy "+ score_buy);
                       }
                    //   var test30m =  await  findEmaOverForBuy(coinName2, "1d")

                    await wait(100);
                    var score_shell = 0
                       var test30mShell =  await  findEmaOverForSell(coinName2, "30m")
                     //  console.log(" test30mShell  "+ test30mShell)
                       var test1hShell =  await  findEmaOverForSell(coinName2, "1h")
                        await wait(100);
                        var test2hShell =  await  findEmaOverForSell(coinName2, "2h")
                        await wait(100);
                        var test34hShell =  await  findEmaOverForSell(coinName2, "4h")

                        if(test30mShell == true){
                            score_shell +=1;
                       }

                       if(test1hShell == true){
                        score_shell +=1;
                       }
                       if(test2hShell == true){
                        score_shell +=1;
                       }
                       if(test34hShell == true){
                        score_shell +=1;
                       }
                       if(score_shell > 0){
                        console.log("Coinname "+ coinName2 + " score shell : " + score_shell)
                       }
                       if(score_shell > 1){
                            bot.sendMessage(chatId," === shell ===  "+ coinName2 + " score_Shell "+ score_shell);
                       }
                     //   var test30m =  await  findEmaOverForSell(coinName2, "1d")
                   //   var test30m =  await  updatePriceForSell(coinName2, "15m")
  
                //      var test30mShell = await   updatePriceForSell(coinName2, "30m",30)
                    
                      //  console.log("value  " + value)
                    }catch(err){
                        console.log(err + "\n");
                        continue;
                       
                    }
                //	coinNameChars = coinName.split("USDT");
                //	coinName= coinNameChars[0]+ "/"+ "USDT"

                }
                await wait(1000);
        }


    } catch (err) {
    //	 log_str += err + "  " + coinName + "\n";
       console.log(err + "\n");
    }
}

// tinh so coin co the mua va gia
const calculateBuyQuantity = async()=>{
	console.log('CALCULATING BUY QUANTITY');
	let accountInfo = await client.accountInfo();
	//console.log(accountInfo);
	let USDTBalance = accountInfo.balances[INDEX_USDT].free;
	if(USDTBalance > 10){
		USDTBalance = 10;
	}
	console.log('USDT balance: ', USDTBalance);
	let prices = await client.prices({ symbol: coin_name });
	let currentPrice = prices.ETHUSDT;
	console.log('ETH Price: ', currentPrice);     

	var buyQuantity = (Math.floor(0.99*(USDTBalance / currentPrice)*10000))/10000.0;

	console.log('BuyQuantity: ', buyQuantity, '\n');
	return { 
		buyQuantity,
		currentPrice
	};
}

// create order
const makeBuyOrder = async(buyQuantity, currentPrice)=>{
	console.log("Make buy order " + buyQuantity + " price. " + currentPrice);

	if(buyQuantity > 0)
	{
		buyOrderInfo = await client.order({

			symbol: 'ETHUSDT',
			side: 'BUY',
			quantity: buyQuantity,
			price: currentPrice,
		});
		console.log('buyOrderInfo: ', buyOrderInfo, '\n');
	}
}
// wait buy order completely

const waitBuyOrderCompetion = async()=>{

	console.log('WAITING BUY ORDER COMPLETION');

	for(let i = 0; i < 5;i++){
		buyOrderInfo = await client.getOrder({
			symbol: coin_name,
  			orderId: buyOrderInfo.orderId,
		});
		// console.log('buyOrderInfo: ', buyOrderInfo);
		if(buyOrderInfo.status === 'FILLED'){
			console.log('PURCHASE COMPLETE! \n');
			return 'success';
		}
		await wait(ORDER_UPDATE_PERIOD);
	}
	if(buyOrderInfo.status === 'PARTIALLY_FILLED'){
		console.log('PURCHASE PARTIALLY FILLED, CONTINUING');
		while(true){
			buyOrderInfo = await client.getOrder({
				symbol: coin_name,
				orderId: buyOrderInfo.orderId,
			});
			if(buyOrderInfo.status === 'FILLED'){
				console.log('PURCHASE COMPLETE! \n');
				return 'success';
			}
			await wait(ORDER_UPDATE_PERIOD);
		}
	}
	console.log('PURCHASE TIMED OUT, CANCELLING \n');
	await client.cancelOrder({
		symbol: coin_name,
  	orderId: buyOrderInfo.orderId,
	});
	return 'failure';
}

const buy = async()=>{

	console.log('BUYING');
	let { buyQuantity, currentPrice} = await calculateBuyQuantity();

	if(buyQuantity > 0.001)
		{
		await makeBuyOrder(buyQuantity, currentPrice);
		let buySuccess =  await waitBuyOrderCompetion();
		return buySuccess;
	}else{
		return 'success';
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
	bot.sendMessage(chatId," =============Start 1 vong requets ======" );
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




































