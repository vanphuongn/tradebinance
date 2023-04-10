var Binance = require('binance-api-node').default;
//const ema = require('trading-indicator').ema;
const kdj = require('kdj').kdj;
const macd = require('trading-indicator').macd;
const TelegramBot = require('node-telegram-bot-api');
var MACD = require('technicalindicators').MACD;
var EMA = require('technicalindicators').EMA
var express = require('express');
var app     = express();
const WebSocketClient = require('ws')
app.set('port', (process.env.PORT || 5000));
const kc = require('keltnerchannel').kc;
const kc_ema = require('keltnerchannel').ema;

var bearishengulfingpattern = require('technicalindicators').bearishengulfingpattern;
var bearishharamicross =require('technicalindicators').bearishharamicross;
var bearishmarubozu =require('technicalindicators').bearishmarubozu;
var bearishharami =require('technicalindicators').bearishharami;

var threeblackcrows =require('technicalindicators').threeblackcrows;

const hammer = require('technicalindicators').bearishhammer;
const tweezertop = require('technicalindicators').tweezertop;


//For avoidong Heroku $PORT error
//const token = '1677444880:AAHC0UgHkuf0Y7NqsubVJSN4Q0WpPfFOYb8';
const token = '5967294536:AAHR4YyRbr5OdMMfVn7xvc3xFLAITBQGw4I';

const chatId = "662991734";


const token_warning = "6037137720:AAFBEfCG9xWY4K_3tx7VSZzMXGgmt9-Zdog"
//const bot_warning = new TelegramBot(token_warning,{polling:true});
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
   apiKey: '6oHHrDBqe5pra9PhYEoafxbNMANrLW1XNR75B1Lqe3sFAetMapH5P18SmCRGYvPx',
	apiSecret:'8bvKE2GciMLJHNTPpLIDOwGDG8sCOUs7dUTUQFnad3RbuulIjXYwyC4CzhYVII4H',
	useServerTime:true,
    recvWindow: 1000, // Set a higher recvWindow to increase response timeout


});

//client.websockets.chart("BNBBTC", "1m", async (symbol, interval, chart) => {
//    let tick = await client.last(chart);
//    const last = chart[tick].close;
//
//    // Optionally convert 'chart' object to array:
//    const ohlc = binance.ohlc(chart);
//    console.log(ohlc);
//});


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
// 
function phuong_kc(priceDatas, m_period=42, multiplier =1, timeRequest = "15m", coinName = "LINKUSDT"){
    let tp = [];
    let range = [];
    var closed_prices = []
    for(var i =0; i < priceDatas.length; i++){
        var avg =(Number(priceDatas[i].high) + Number(priceDatas[i].low) +Number( priceDatas[i].close))/3;
        tp.push(avg)
        range.push(Number(priceDatas[i].high) - Number(priceDatas[i].low))
    }
  

    
    for(var i =0; i < priceDatas.length; i++)
    {
   // console.log(coinName2 +"    "+i + "    priceDatas " + priceDatas[i].close)
        closed_prices.push(Number(priceDatas[i].close))
    }
 
    let mid =  EMA.calculate({period : m_period, values : closed_prices})
    let width = EMA.calculate({period : m_period, values : range})

    
    let upper = [];
    let lower = [];
    for(let i = 0; i < width.length; i++)
    {
        let w = width[i] * multiplier;
       
        upper.push(mid[i] + w);
        lower.push(mid[i]- w);
    }
  
    return {
        upper,
        mid, 
        lower,
    };
}


const checkStoplossForBuy = async(priceDatas, coinName)=>{

    var fivelastCandleInput = {
        open: [priceDatas[priceDatas.length-6].open,priceDatas[priceDatas.length-5].open,priceDatas[priceDatas.length-4].open,priceDatas[priceDatas.length-3].open, priceDatas[priceDatas.length-2].open],
        high: [priceDatas[priceDatas.length-6].high,priceDatas[priceDatas.length-5].high,priceDatas[priceDatas.length-4].high,priceDatas[priceDatas.length-3].high, priceDatas[priceDatas.length-2].high],
        close: [priceDatas[priceDatas.length-6].close,priceDatas[priceDatas.length-5].close,priceDatas[priceDatas.length-4].close,priceDatas[priceDatas.length-3].close, priceDatas[priceDatas.length-2].close],
        low: [priceDatas[priceDatas.length-6].low,priceDatas[priceDatas.length-5].low,priceDatas[priceDatas.length-4].low,priceDatas[priceDatas.length-3].low, priceDatas[priceDatas.length-2].low],
    }

  //  console.log(fivelastCandleInput)
    var twolastCandleInput = {
        open: [priceDatas[priceDatas.length-3].open, priceDatas[priceDatas.length-2].open],
        high: [priceDatas[priceDatas.length-3].high, priceDatas[priceDatas.length-2].high],
        close: [priceDatas[priceDatas.length-3].close, priceDatas[priceDatas.length-2].close],
        low: [priceDatas[priceDatas.length-3].low, priceDatas[priceDatas.length-2].low],
    }

    var threelastCandleInput = {
        open: [priceDatas[priceDatas.length-4].open,priceDatas[priceDatas.length-3].open, priceDatas[priceDatas.length-2].open],
        high: [priceDatas[priceDatas.length-4].high,priceDatas[priceDatas.length-3].high, priceDatas[priceDatas.length-2].high],
        close: [priceDatas[priceDatas.length-4].close,priceDatas[priceDatas.length-3].close, priceDatas[priceDatas.length-2].close],
        low: [priceDatas[priceDatas.length-4].low,priceDatas[priceDatas.length-3].low, priceDatas[priceDatas.length-2].low],
    }

    var lastestCandleInput = {
        open: [priceDatas[priceDatas.length-2].open],
        high: [ priceDatas[priceDatas.length-2].high],
        close: [ priceDatas[priceDatas.length-2].close],
        low: [ priceDatas[priceDatas.length-2].low],
    }

    if(bearishengulfingpattern(twolastCandleInput) == true)
    {
        console.log(coinName +" hit bearishengulfingpattern")
        return true;
    }
    if(bearishharamicross(twolastCandleInput)== true)
    {
        console.log(coinName +" hit bearishharamicross")
        return true;
    }

    if(bearishmarubozu(twolastCandleInput)== true)
    {
        console.log(coinName +" hit bearishmarubozu   " + twolastCandleInput.close[twolastCandleInput.close.length-1] + "  open   " +  twolastCandleInput.open[twolastCandleInput.open.length-1])
        return true;
    }
    
    if(bearishharami(twolastCandleInput)== true)
    {
        console.log(coinName +" hit bearishharami ")
        return true;
    }

    if(threeblackcrows(threelastCandleInput)== true){
        console.log(coinName + " hit threeblackcrows ")
        return true;
    }

    // if( hammer(lastestCandleInput))
    // {
    //     console.log(" hit bear hammer ")
    //     return true;
    // }

    if( tweezertop(fivelastCandleInput)== true)
    {
        console.log(coinName +" hit bear tweezertop ")
        return true;
    }
    return false;
}

const updatePriceForBuy =async (coinName2,timeRequest)=>{
        try{
					
        //         bot.sendMessage(chatId,"timeRequest  " + timeRequest + "  , coinName :  " +coinName2 )
                //	let macdData  = await macd(12,26,9,"close", "binance", "BNB/USDT",timeRequest,true);
		
                prices = []
				coinName2 = "JOEUSDT"
                let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })

                for(var i =0; i < priceDatas.length; i++)
                    {
                	   //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
                        prices.push(Number(priceDatas[i].close))
                    }
                   // console.log(  prices )
                // live candles
                let kc_out = phuong_kc(priceDatas, 45, 1,"15m",coinName2);
           
                var ema10 = EMA.calculate({period : 10, values : prices})
          //      var ema10 = EMA.calculate({period : 10, values : prices})
          //      var ema20 = EMA.calculate({period : 20, values : prices})
                var ema34 = EMA.calculate({period : 34, values : prices})
          //       var ema50 = EMA.calculate({period : 50, values : prices})
                 var ema89 = EMA.calculate({period : 89, values : prices})
          //      var ema100 = EMA.calculate({period : 200, values : prices})

                var intersect_macd_index_array = []
                var has_ema10_cut_kc_up = false;
                var has_macd_lon_hon_0_35 = false
                var has_macd_phan_ki_lon_hon_15 = false
                var macd_max_range_allow = 0.35

                var macdInput = {
                        values            : prices,
                        fastPeriod        : 12,
                        slowPeriod        : 26,
                        signalPeriod      : 9 ,
                        SimpleMAOscillator: false,
                        SimpleMASignal    : false
                    }
                    
                var macdData2 = MACD.calculate(macdInput)
                    
                // var result = await checkStoplossForBuy(priceDatas, coinName2)
                // if( result == true){
                //     bot.sendMessage(chatId, coinName2+ " hit Stop loss pattern " + timeRequest)
                // }

            //    console.log(coinName2+ "ema10[ema10.length-1] "+ ema10[ema10.length-1] + "  ema10[ema10.length-2]  "+ ema10[ema10.length-2] +" kc_out.upper[kc_out.upper.length-2] " +  kc_out.upper[kc_out.upper.length-2] + " kc_out.upper[kc_out.upper.length-1] "+  kc_out.upper[kc_out.upper.length-1] )
               if( (ema10[ema10.length-2] > kc_out.upper[kc_out.upper.length-2])
               && (ema10[ema10.length-1] < kc_out.upper[kc_out.upper.length-1])
             
            //   && (Math.abs(macdData2[macdData2.length -1].MACD) < Math.abs(priceDatas[priceDatas.length-1].close*0.006))
               )
               {
                
                    bot.sendMessage(chatId, coinName2+ " EMA 10 cat KC up tu tren xuong duoi")
                    bot.sendMessage(chatId, coinName2+ " EMA 10 cat KC up tu tren xuong duoi")
                    bot.sendMessage(chatId, coinName2+ " EMA 10 cat KC up tu tren xuong duoi")
                    bot.sendMessage(chatId, coinName2+ " EMA 10 cat KC up tu tren xuong duoi")
                    bot.sendMessage(chatId, coinName2+ " EMA 10 cat KC up tu tren xuong duoi")
                    console.log(coinName2+ " EMA 10 cat KC up tu tren xuong duoi "  + timeRequest)
               }

            }

        catch (err)
        {
    //	 console.log(err + "  " + coinName2  );
    //	 log_str += err + "  " + coinName2 + "\n";
        // continue;
        }
}

const updatePrice = async(timeRequest )=>{
    try {

		let accountInfo = await client.accountInfo();

	//	prices = await client.prices();
		prices = await client.futuresPrices();
		let pricesArr = Object.keys(prices);
         total_coin_phanky = 0
	     coinDivergenceList = []


		currentSymbols = await client.futuresOpenOrders()
		//  currentSymbols = []
		//  currentSymbols = await client.futuresOpenOrders()
		 console.log(currentSymbols);

       for(var coinIndex = 0; coinIndex < pricesArr.length; coinIndex++)
         {
               var coinName2 = pricesArr[coinIndex].toString() ;
            //	var coinName2= "BNBUSDT"
               if(coinName2.includes("USDT"))
                {
                    try{
                        var test30m =  await  updatePriceForBuy(coinName2, "30m")
                      var test30m =  await  updatePriceForBuy(coinName2, "15m")
                      var test30m =  await  updatePriceForBuy(coinName2, "5m")
                     // var test30m2 =  await  updatePriceForSell(coinName2, "30m")

                    }catch(err){
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




































