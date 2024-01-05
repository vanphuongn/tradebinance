const axios = require('axios');
const cheerio = require('cheerio');
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


const getBybitData = async () => {
    const apiUrl = 'https://api2-1.bybit.com/contract/v5/product/dynamic-symbol-list';
    const symbolTags = 'NEW';
    // Set your headers
    const headers = {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
        'Content-Type': 'application/json',
        'Cookie': "deviceId=738e196b-2699-456f-703e-2419b1c7cc7a; _by_l_g_d=273a1c16-880a-789e-fa58-87d9c165aec2; _gcl_aw=GCL.1698856232.CjwKCAjw7oeqBhBwEiwALyHLM_MHs5a_v28KXIXpBq8UzTU4T-N3pLku8u41k0lYKC2Je_WEsd89uBoCZY0QAvD_BwE; _gcl_au=1.1.473491072.1698856232; _ga=GA1.1.1762246349.1698856233; _ym_uid=1698856235886883743; _ym_d=1698856235; _fwb=172rrhjtyYLy8KqJViaGwYe.1701952639845; BYBIT_REG_REF_prod={'lang':'vi-VN','g':'273a1c16-880a-789e-fa58-87d9c165aec2','referrer':'www.google.com/','source':'google.com','medium':'other','url':'https://www.bybit.com/vi-VN/trade/spot/BONK/USDT'}; b_t_c_k=; _abck=36AA1FEB531E13584A38A8C34C3D8F2F~0~YAAQqhBFdiT9bWyMAQAAsfTxcAuFffhok3YqTI8DaMATHEyHBcqwM2M04MIbxn+4oMinLnpsgVQ9/+ieFyw3QPIMuRTSuxEyzDFcKD6OST9y8rGn0MnH+CDusQw+8msA771FSX8PVJVxUhZZN89bAEG87wdsFsD2Qgk2kBBBEevj9yGXeYatGsZhs1cLjZ7iKf/tty93212leW4brW7A92FzjdNh3BN9yAthcqsiBCtM1V9WVeqBLPU4D3Km8a8ZD6WXIDyx5nTYnH3YZ3fiqMIanVHdOQyyCc+kWal8AK4gqzJC/qZHdNkyHwiVPuZ2GvbpaRqIwpFypeOfKgv1Xy/HuGZG+5TU0opXXliN17agoXUkpAZ2bOgOF3kfV+i6CxdMM5Bcuby1qGunlbFtRfZ4Et5+c+Y=~-1~-1~-1; bm_sz=EB476674C91E6A5FF2C0970E6BABFA3B~YAAQqhBFdib9bWyMAQAAsfTxcBbVRUXDDG6TubPahaYrjSaTNajUE7eEg1yVxN2ioNVX4uRfi4MiYNHYuTgSK+vqF0klwV0hD8wq5g0aKoqI4LNpLWNEycydj5N1+jqKMCznMDeOJGHVIBo+eSl72HMndyW//WOzPtmRVP3v+tXtRZjCD0SYQvTFeJZIs9tJL++DO9DOFxn99Wms2DYkHBgDGNncFEkbNwbPmKPffnLoajjyt3P+sBs+V7zf6I4fYfnRuaIeetM1f3ynh30Zfm4baesPGwM64MjIRh5AoYn5fQ==~4604976~4276803; BYBIT_REG_REF_local={'lang':'vi-VN','g':'273a1c16-880a-789e-fa58-87d9c165aec2','referrer':'www.google.com/','source':'google.com','medium':'other','url':'https://www.bybit.com/future-activity/vi-VN/developer'}; _ym_isad=1; _ga_SPS4ND2MGC=GS1.1.1702704732.13.0.1702704732.60.0.0; ak_bmsc=BF720323AE8F3766E91CA10744692C4D~000000000000000000000000000000~YAAQ9BBFdlRJiGSMAQAAcHOKcRbveYontrkzhCqoFg5Z1Kzmx2gDon8XGNRUsF4FTu+r64VELDV3UyyjxZFlRH9vqahx+CNlyIf8vPmiTQIe/DRLu1gJY9cwWpiZhD6PuE/aXV3PRVp8W5xrPCDx/Y9dztjDVPh37gBa8UyRm3BryctSuNk/0akMx2ol02TlwFkjjbwYpYSGUrNE0l0yrMgmGtoaQIwsfispaZK/0tR5nlphVmoJeXiZyoEuTAOLyZgGFUDxJcj8Pb9M5olz5DGeVYeXhmXOc4E4nD0jckT01omoA8DGJ4fW1PYYqUZ+SNPqEepY3VaI6fRXwHnt8Kt3LVBUd9ROWVsK1w6pNd6iEMrsKWb9QiT4sezfP3NBzHSGm1jvM6m2; EO-Bot-Session=ua-ZsK4bKjcWlRk7pQWFLR1P11_ngOCPOrswO_7r4KSNQEUEmUkxfVcQoapOeUaE; EO-Bot-SessionId=6901878017968215306; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%220%22%2C%22first_id%22%3A%2218b8bb8c8be8ef-0d67aa08d971258-17525634-1024000-18b8bb8c8bf906%22%2C%22props%22%3A%7B%22_a_u_v%22%3A%220.0.6%22%2C%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMThiOGJiOGM4YmU4ZWYtMGQ2N2FhMDhkOTcxMjU4LTE3NTI1NjM0LTEwMjQwMDAtMThiOGJiOGM4YmY5MDYiLCIkaWRlbnRpdHlfbG9naW5faWQiOiIwIn0%3D%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%220%22%7D%2C%22%24device_id%22%3A%2218b8bb8c8be8ef-0d67aa08d971258-17525634-1024000-18b8bb8c8bf906%22%7D; EO-Bot-Token=t040eU75jqSkgPqOIQc6nFG_LpEeOAAoNACtIZUDGpYMBQG2ePitXF2cDdiGQTMJqPmq3Mxazah8UPBg8pvwVYcvUc_yO1XlKGtvt0jEDe6YPwc7yfgfOQ_XQcSeoo-DufqiBgiM4FnMfgUKla4mD7UFoxZMNF7qIXHewktde-9UUPvxmzV1QSQ23EJFVJaAXbN8LG9CWDsuPFj-ZmfidWwh2xeCEJK6YtgAzqsM6-MvS1Jxqci1fVr0kk7Tad141crrvwYdgcny2Ix0VSU96av6ECGQfe3EPsWdMuIxPSzA4yx79OpzDU7szQw4DD69DP9jrDBAih3DPpodkR5XVom_JWmXTFuE2st4YyUSNcJz-fsy0yoFdC0-NIazxe88KP2x3E0_GYxUOs*; bm_sv=4D6A8C2EBD2F705AEEF3F23EFB53D8EB~YAAQ9BBFdkNliGSMAQAAMR6jcRaaxEI7pfXvJvOrlLXw2q0JBSGpfjpPpZknzasdnX+VtDlUptpS171RW113tUKvDCBreA2pq5kRvgp2+L+e/mDGlwl/E4rJC09eArh/gadpFzUYLRDCm2FwrPT0/17Kt8clAZou+U84CeyzQ3dwf9ulxfmM5DqbYDJqH6GhTbGze3GVLjZUNosepiR6ooO+LPG2GUF4avW7L5v3/NDL50VshxMShiwPjoFO9uiQ~1"
   
    };


    try {
        const response = await axios.get(apiUrl, {
            headers: headers,
            params: {
                symbolTags: "NEW",
            },

        });

        // Process the response data
        const data = response.data;
        //  console.log('Dynamic symbol list with filter=all:', data.result.LinearPerpetual);

        var newSymbols = []

        for (var i = 0; i < data.result.LinearPerpetual.length; i++) {
            //if (data.result.LinearPerpetual[i].symbolTags == "NEW")
             {
                console.log('coinName', data.result.LinearPerpetual[i].symbolName);

                newSymbols.push(data.result.LinearPerpetual[i].symbolName)
            }
        }

        console.log(newSymbols)

    } catch (error) {
        console.error('An error occurred:', error.message);
    }
};

// Call the function to make the HTTP request and scrape data

getBybitData();



const Ticket = class {
    constructor(open, high, low, close) {
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
    }
}


const find3TimeRedFutureForBuy = async () => {

    var coinNames = [
        'AERGOUSDT', 'AGIUSDT',
        'PYTHUSDT', 'GODSUSDT',
        'MOVRUSDT', 'SUPERUSDT',
        'USTCUSDT', 'RAREUSDT',
        'ONGUSDT', 'IGUUSDT',
        'AXLUSDT', 'JTOUSDT',
        'XRDUSDT', 'QIUSDT',
        'FUNUSDT', 'MYRIAUSDT']
        var timeArr = [5,15,30]

    const apiUrl = 'https://api2-1.bybit.com/contract/v5/public/instrument/kline/market';

    for(var tIdx = 0; tIdx < timeArr.length;tIdx++)
    {
        for (const coinName of coinNames) 
        {
        //   var coinName = "AERGOUSDT"
          console.log("coinName " + coinName + " timeArr[tIdx] "+ timeArr[tIdx])
            const currentTime = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds

            const params = {
                contract_type: 2,
                symbol: coinName,
                resolution: timeArr[tIdx],
                from: 1701998700,
                to: currentTime, // Set 'to' to the current timestamp
                _sp_category: 'fbu',
                _sp_response_format: 'portugal',
                showOrigin: true,
                limit: 1000,
            };


            var priceData = await axios.get(apiUrl, { params })
                .then(response => {
                    // Process the response data
                    const data = response.data;
                    // console.log('Response Data:', JSON.stringify(data));

                    var prices = []
                    var closePrices = []
                    var priceDatas = []

                    for (var i = 0; i < data.result.list.length; i++) {
                        priceDatas.push(new Ticket(Number(data.result.list[i][1]), Number(data.result.list[i][2]), Number(data.result.list[i][3]), Number(data.result.list[i][4])))
                        closePrices.push(Number(data.result.list[i][4]))
                    }
                    //   console.log(closePrices)
                    var ema10 = EMA.calculate({ period: 10, values: closePrices })
                    var ema20 = EMA.calculate({ period: 20, values: closePrices })
                    var ema34 = EMA.calculate({ period: 34, values: closePrices })
                    var ema50 = EMA.calculate({ period: 50, values: closePrices })
                    var ema89 = EMA.calculate({ period: 89, values: closePrices })
                    var ema200 = EMA.calculate({ period: 200, values: closePrices })

                    //  console.log("ema10_0 "+ JSON.stringify(ema10))

                    var lastestEma50UnderEma89 = -1
                    var lastestEma20UnderEma50 = -1
                    if ((ema10[ema10.length - 1] > ema20[ema20.length - 1])
                        && (ema20[ema20.length - 1] > ema50[ema50.length - 1])
                        && (ema50[ema50.length - 1] > ema89[ema89.length - 1])
                    ) {


                        for (var i = 0; i < ema10.length; i++) {

                            if ((ema10[ema10.length - 1 - i] > ema20[ema20.length - 1 - i])
                                && (ema20[ema20.length - 1 - i] > ema89[ema89.length - 1 - i])
                                && (ema50[ema50.length - 1 - i] > ema89[ema89.length - 1 - i])
                                && (ema50[ema50.length - 1 - (i + 1)] < ema89[ema89.length - 1 - (i + 1)])
                            ) {
                 //               console.log("coinName xx " + coinName + " " + i)
                                lastestEma50UnderEma89 = i
                                break;

                            }
                        }

                        for (var i = 0; i < ema10.length; i++) {
                            if ((ema10[ema10.length - 1 - i] > ema20[ema20.length - 1 - i])
                                && (ema20[ema20.length - 1 - i] > ema89[ema89.length - 1 - i])
                                && (ema50[ema50.length - 1 - i] > ema89[ema89.length - 1 - i])
                                && (ema20[ema20.length - 1 - (i + 1)] < ema50[ema50.length - 1 - (i + 1)])
                            ) {
             //                   console.log("coinName2  " + coinName + " lastestEma20UnderEma50 " + i)
                                lastestEma20UnderEma50 = i
                                break;
                            }
                        }
                    }



                    if (lastestEma50UnderEma89 > 0) {
                        var totalTimeHas3ContinousRedCandle = 0;
                        var beginIndexArr = []
                     //   console.log("lastestEma50UnderEma89 " + lastestEma50UnderEma89)
                        //     console.log(priceDatas[priceDatas.length - 2].open+ " priceDatas[priceDatas.length - 1 - i].close "+ priceDatas[priceDatas.length - 2].close)
                        for (var i = 0; i < lastestEma50UnderEma89; i++) {
                            try {
                                var hasCanleBlue = false;
                                // tim cac lan co 3 cay nen do lien tiep
                                // nen gap cay nen xanh thi bo qua

                                if ((priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open)) {
                                    // console.log("passs 0 "+ i)
                                    var begin_index = i;
                                    var hasCandleBlue = false;

                                    while (hasCandleBlue == false) {
                                        if ((priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open)) {
                                            i = i + 1;
                                        } else {
                                            hasCandleBlue = true;
                                            break;
                                        }
                                    }

                                    var end_index = i;
                                    hasCanleBlue = false;

                                    //   console.log("end_index "+ end_index + " begin_index  "+ begin_index)
                                    // neu so cay nen do lien tiep > 2 thi add vao mang 
                                    // them 1 dieu kien nua la cay nen ket thuc cua 3 cay nen do la cay nen xanh co gia dong cua > ema10
                                    if ((end_index - begin_index >= 3)

                                        && (priceDatas[priceDatas.length - 1 - end_index].close > ema10[ema10.length - 1 - end_index])
                                    ) {
                                        totalTimeHas3ContinousRedCandle += 1
                                        beginIndexArr.push(begin_index)
                                        //   console.log( coinName+ " i " + i + " begin " + begin_index + " end " + end_index)
                                    }
                                }





                            } catch (error) {
                                console.log("error 3" + error)
                            }
                        }

                        if (totalTimeHas3ContinousRedCandle == 1) {

                         //   console.log("coinName2  " + coinName + " " + beginIndexArr[0]+ "  "+ priceDatas.length)
                            try {
                                if (priceDatas[priceDatas.length - 1 - beginIndexArr[0]].low < ema50[ema50.length - 1 - beginIndexArr[0]])
                                {
                                    console.log("coinName2 ======== buy ========" + coinName + " time  " + timeArr[tIdx]+ " idx  " + beginIndexArr[0])
                                }
                            } catch (error) {
                                console.log("error 5 " + error)
                            }
                        }
                    }

                    if (lastestEma20UnderEma50 > 0) {
                        var totalTimeHas3ContinousRedCandle = 0;
                        var beginIndexArr = []
                        //   console.log("lastestEma20UnderEma50 " + lastestEma20UnderEma50)
                        //     console.log(priceDatas[priceDatas.length - 2].open+ " priceDatas[priceDatas.length - 1 - i].close "+ priceDatas[priceDatas.length - 2].close)
                        for (var i = 0; i < lastestEma20UnderEma50; i++) {
                            try {
                                var hasCanleBlue = false;
                                // tim cac lan co 3 cay nen do lien tiep
                                // nen gap cay nen xanh thi bo qua

                                if ((priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open)) {
                                    // console.log("passs 0 "+ i)
                                    var begin_index = i;
                                    var hasCandleBlue = false;

                                    while (hasCandleBlue == false) {
                                        if ((priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open)) {
                                            i = i + 1;
                                        } else {
                                            hasCandleBlue = true;
                                            break;
                                        }
                                    }

                                    var end_index = i;
                                    hasCanleBlue = false;

                                    //   console.log("end_index "+ end_index + " begin_index  "+ begin_index)
                                    // neu so cay nen do lien tiep > 2 thi add vao mang 
                                    // them 1 dieu kien nua la cay nen ket thuc cua 3 cay nen do la cay nen xanh co gia dong cua > ema10
                                    if ((end_index - begin_index >= 3)

                                        && (priceDatas[priceDatas.length - 1 - end_index].close > ema10[ema10.length - 1 - end_index])
                                    ) {
                                        totalTimeHas3ContinousRedCandle += 1
                                        beginIndexArr.push(begin_index)
                                        //   console.log( coinName+ " i " + i + " begin " + begin_index + " end " + end_index)
                                    }
                                }





                            } catch (error) {
                                console.log("error 3" + error)
                            }
                        }

                        if (totalTimeHas3ContinousRedCandle == 1) {

                           // console.log("coinName2  " + coinName + " beginIdx " + beginIndexArr[0])
                            if (priceData[priceData.length - 1 - beginIndexArr[0]].low < ema50[ema50.length - 1 - beginIndexArr[0]]) {
                                console.log("coinName2  =====buy======= " + coinName+ " time  " + timeArr[tIdx]+ + " idx  " + beginIndexArr[0])
                            }
                        }
                    }
                })
                .catch(error => {
                    // Handle errors
                    console.error('Error:', error.message);
                });
            //
        }
    }
}

//find3TimeRedFutureForBuy()