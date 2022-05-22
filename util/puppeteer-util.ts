import puppeteer from 'puppeteer'

export async function getOverviewScreenshot(ticker: string, talkerId: string) {
  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.goto('http://' + 'localhost:9527' + '/overview' + `?ticker=${ticker}`)
  //await page.waitForSelector('.option-39ZFf678', { timeout: 300000 })
  await sleep(6000)

  await page.screenshot({path: './files/pic/Overview_' + talkerId + '.png'})
  await browser.close()
}

function getBrowser() {
  return puppeteer.launch({
    // slowMo: 100,    //放慢速度
    headless: true,
    // defaultViewport: {width: 1440, height: 780},
    ignoreHTTPSErrors: false, //忽略 https 报错
    args: ['--no-sandbox', '--lang=zh_CN.UTF-8', '--disable-gpu'] // linux root 必填
  });
}

//延时函数
function sleep(delay: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(1)
      } catch (e) {
        reject(0)
      }
    }, delay)
  })
}

