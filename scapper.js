const puppteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs/promises');
const path = require('path');
const { NODE_ENV } = process.env
const checkClassAttr = require('./utils/checkAttributeClass-util');

// check Mode ENV ( Dev | Prod )
const headless = NODE_ENV === "development" ? false : true


module.exports = async () => {
    // configure browser
    const browser = await puppteer.launch({
        headless,
        ignoreHTTPSErrors : true,
        defaultViewport : {
            width : 1440,
            height : 768
        }
    })

    // create a new page
    const page = await browser.newPage()

    // configure default Navigation timeout
    page.setDefaultNavigationTimeout(0)

    // navigate to a website (target)
    await page.goto("https://coinmarketcap.com/coins")

    // configure scroll-bor to bottom of the page
    await page.evaluate(() => {
        return new Promise((resolve, reject) => {
            const scrollInterval = setInterval(() => {
                let scroll_height = document.body.scrollHeight
                let scroll_y = window.scrollY
                scroll_y += 800;

                window.scroll({ left : 0, top : scroll_y, behavior : "auto" });
    
                if (scroll_y > scroll_height) {
                    clearInterval(scrollInterval);
                    resolve()
                }
            }, 500);
        })
    })


    setInterval(async () => {
        // get HTML content
        const template = await page.content()

        // scroll to top of the page
        await page.evaluate(() => window.scrollTo({ top : 0 }))
        
        // parse the HTML content
        const $ = cheerio.load(template)

        // declare a new Array for saving new data to this Array
        const coinsList = []

        // get element values from the DOM like these data :
        /**
         * ID 
         * Url
         * Logo
         * Chart
         * Symbol
         * Name
         * Price
         * Growth-status at 1 hour
         * Growth-status at 24 hours
         * Growth-status at 7 days
         */
        $("table > tbody > tr").each((index, coins) => {
            $(coins).map((index, coin) => {
                coinsList.push({
                    id : +$(coin).find("td:nth-child(2) > p").text(),
                    url : "https://coinmarketcap.com" + $(coin).find("td:nth-child(3) div > a").attr("href"),
                    logo : $(coin).find("td:nth-child(3) div > a > div > img").attr("src"),
                    chart : $(coin).find("td:nth-last-child(2) a > img").attr("src"),
                    symbol : $(coin).find("td:nth-child(3) a img + div > div > p").text(),
                    name : $(coin).find("td:nth-child(3) a img + div > p").text(),
                    price : $(coin).find("td:nth-child(4) span").text(),
                    growthStatus : {
                        at_1h : {
                            type : checkClassAttr({ 
                                $, 
                                element : coin, 
                                selector : "td:nth-child(5) span > span", 
                                className : "icon-Caret-down"
                            }),
                            value : $(coin).find("td:nth-child(5) span").text()
                        },
                        at_24h : {
                            type : checkClassAttr({ 
                                $, 
                                element : coin, 
                                selector : "td:nth-child(6) span > span", 
                                className : "icon-Caret-down"
                            }),
                            value : $(coin).find("td:nth-child(6) span").text()
                        },
                        at_7d : {
                            type : checkClassAttr({ 
                                $, 
                                element : coin, 
                                selector : "td:nth-child(7) span > span", 
                                className : "icon-Caret-down"
                            }),
                            value : $(coin).find("td:nth-child(7) span").text()
                        },
                    } 
                })
            })
        })

        // create JSON file and saving coinsList data to this file
        await fs.writeFile(path.join(__dirname, "./coinsList.json"), JSON.stringify(coinsList), "utf-8")
    }, 2000)
}