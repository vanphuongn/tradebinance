var Binance = require('binance-api-node').default;
//const ema = require('trading-indicator').ema;
const kdj = require('kdj').kdj;
const macd = require('trading-indicator').macd;
const TelegramBot = require('node-telegram-bot-api');
var MACD = require('technicalindicators').MACD;
var EMA = require('technicalindicators').EMA


var bearishengulfingpattern = require('technicalindicators').bearishengulfingpattern;
var bearishharamicross =require('technicalindicators').bearishharamicross;
var bearishmarubozu =require('technicalindicators').bearishmarubozu;
var bearishharami =require('technicalindicators').bearishharami;

var threeblackcrows =require('technicalindicators').threeblackcrows;

const hammer = require('technicalindicators').bearishhammer;
const tweezertop = require('technicalindicators').tweezertop;



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


const checkStoplossForBuy = async(priceDatas, coinName)=>{

    var fivelastCandleInput = {
        open: [priceDatas[priceDatas.length-5].open,priceDatas[priceDatas.length-4].open,priceDatas[priceDatas.length-3].open,priceDatas[priceDatas.length-2].open, priceDatas[priceDatas.length-1].open],
        high: [priceDatas[priceDatas.length-5].high,priceDatas[priceDatas.length-4].high,priceDatas[priceDatas.length-3].high,priceDatas[priceDatas.length-2].high, priceDatas[priceDatas.length-1].high],
        close: [priceDatas[priceDatas.length-5].close,priceDatas[priceDatas.length-4].close,priceDatas[priceDatas.length-3].close,priceDatas[priceDatas.length-2].close, priceDatas[priceDatas.length-1].close],
        low: [priceDatas[priceDatas.length-5].low,priceDatas[priceDatas.length-4].low,priceDatas[priceDatas.length-3].low,priceDatas[priceDatas.length-2].low, priceDatas[priceDatas.length-1].low],
    }

  //  console.log(fivelastCandleInput)
    var twolastCandleInput = {
        open: [priceDatas[priceDatas.length-2].open, priceDatas[priceDatas.length-1].open],
        high: [priceDatas[priceDatas.length-2].high, priceDatas[priceDatas.length-1].high],
        close: [priceDatas[priceDatas.length-2].close, priceDatas[priceDatas.length-1].close],
        low: [priceDatas[priceDatas.length-2].low, priceDatas[priceDatas.length-1].low],
    }

    var threelastCandleInput = {
        open: [priceDatas[priceDatas.length-3].open,priceDatas[priceDatas.length-2].open, priceDatas[priceDatas.length-1].open],
        high: [priceDatas[priceDatas.length-3].high,priceDatas[priceDatas.length-2].high, priceDatas[priceDatas.length-1].high],
        close: [priceDatas[priceDatas.length-3].close,priceDatas[priceDatas.length-2].close, priceDatas[priceDatas.length-1].close],
        low: [priceDatas[priceDatas.length-3].low,priceDatas[priceDatas.length-2].low, priceDatas[priceDatas.length-1].low],
    }

    var lastestCandleInput = {
        open: [priceDatas[priceDatas.length-1].open],
        high: [ priceDatas[priceDatas.length-1].high],
        close: [ priceDatas[priceDatas.length-1].close],
        low: [ priceDatas[priceDatas.length-1].low],
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
					
    //       console.log("timeRequest  " + timeRequest + "  , coinName :  " +coinName2 )
                //	let macdData  = await macd(12,26,9,"close", "binance", "BNB/USDT",timeRequest,true);

                   let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
                     // live candles
//               let priceDatas =     client.ws.candles(tickers => {
//                      console.log(tickers)
//                    })
//                     client.ws.candles('ETHBTC', '1s', candle => {
//                      console.log(candle)
//                    })

                    var intersect_macd_index_array = []
                    var prices = []
                 
                    var last50Prices = []
					var last10Prices = []
                    var last5Prices = []

                    for(var i =0; i < priceDatas.length; i++)
                    {
                	   //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
                        prices.push(Number(priceDatas[i].close))
                    }
             //       console.log(prices)
             var result = await checkStoplossForBuy(priceDatas, coinName2)
                   if( result == true){
                     console.log("Coin Name giam " + coinName2 + "  time "+ timeRequest)
                   }
					
                    for(var i = 30; i > 0; i--)
                    {
                //	    console.log(i + "    priceDatas " + priceDatas[i].close)
                        last50Prices.push(Number(priceDatas[priceDatas.length-i].low))
                    }

					for(var i = 16; i >0; i--)
					{
					//    console.log(i + "    priceDatas " + priceDatas[i].close)
						last10Prices.push(Number(priceDatas[priceDatas.length-i].low))
		
					}

                    var min = Math.min( ...last50Prices )
					var max = Math.max( ...last50Prices )


					var min10 = Math.min( ...last10Prices )
                    //var min5 = Math.min( ...last5Prices )
					var max10 = Math.max( ...last10Prices )
    //                     console.log("last50Prices     " + last50Prices
    //                      + "  min  " + min
    //                      )
    //                     for(var i =0; i < prices.length; i++)
    //                        {
    //                            console.log(i + "    priceDatas " + prices[i])
    //
    //                        }


                       var macdInput = {
                          values            : prices,
                          fastPeriod        : 12,
                          slowPeriod        : 26,
                          signalPeriod      : 9 ,
                          SimpleMAOscillator: false,
                          SimpleMASignal    : false
                        }

    //                   var result =  MACD.calculate(macdInput);
               //   console.log("macdInput :"+JSON.stringify(macdInput))
                   var macdData2 = MACD.calculate(macdInput)
                   var ema10 = EMA.calculate({period : 10, values : prices})
                   var ema20 = EMA.calculate({period : 20, values : prices})
                   var ema34 = EMA.calculate({period : 34, values : prices})
                    var ema50 = EMA.calculate({period : 50, values : prices})
                    var ema89 = EMA.calculate({period : 80, values : prices})
                   var ema100 = EMA.calculate({period : 200, values : prices})

                   if( (ema10[ema10.length-1] > ema100[ema100.length-1]) 
                   && (ema20[ema20.length-1] > ema100[ema100.length-1]) 
                   && (ema34[ema34.length-1] > ema100[ema100.length-1]) 
                   && (ema50[ema50.length-1] > ema100[ema100.length-1]) 
                   && (ema89[ema89.length-1] > ema100[ema100.length-1]) )
                   {
                 //   console.log( coinName2 + " pass long " )
                        if(
                        ( ((ema10[ema10.length-1] > ema20[ema20.length-1]) &&((ema10[ema10.length-2] < ema50[ema20.length-2])||(ema10[ema10.length-3] < ema50[ema20.length-3])))
                        ||  ((ema10[ema10.length-1] > ema34[ema34.length-1]) &&((ema34[ema34.length-2] < ema34[ema34.length-2])||(ema34[ema34.length-3] < ema34[ema34.length-3]))))
                        && (    min10 < ema89[ema89.length-1]) 
                        && ( priceDatas[priceDatas.length-1 ]/ min10 < 1.035) // tranh cay dung cot
                        )
                            {
                                
                                console.log( coinName2 + " Cat tu duoi len ema10 " +ema10[ema10.length-1]  + "  ema20 " + ema20[ema20.length-1]
                                    + "  ema 34  " + ema34[ema34.length-1] 
                                    + "  min " + min10
                                )

                                bot.sendMessage(chatId, coinName2 + " Cat tu duoi len ")
                        
                            }
             
                } 
                    var hasPhanKy = false;
                    var logStr = "";

               

                //   console.log("hasPhanKy phan ky  " + hasPhanKy + "   " + logStr)
                   return {hasPhanKy,logStr}

    //               for (var i = 0; i <ergenceList.length; i++){
    //                    var coinName = coinDivergenceList[i]
    //                    console.log("Con phan ky  " + coinName)
    //
    //               }

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

                      var test30m =  await  updatePriceForBuy(coinName2, "15m")
                 //     var test30m =  await  updatePriceForBuy(coinName2, "5m")
                  //    var test30m =  await  updatePriceForSell(coinName2, "15m")
  
                //      var test30mShell = await   updatePriceForSell(coinName2, "30m",30)
                    
                      //  console.log("value  " + value)
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





































