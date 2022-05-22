import Segment from 'segment'
import got from 'got'
import timersPromise from 'timers/promises'
import { FileBox } from 'file-box'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import * as PuppeteerUtil from "../util/puppeteer-util.ts"
import type {Message} from "wechaty"
import { bot } from '../demo.ts'

let friendBelong = new Map()
friendBelong.set('wxid_l9r1oigjgr2l41', '长沙')
friendBelong.set('songliting920115', '大连')
friendBelong.set('xihuanzuoaime', '大连')
// 创建实例
const segment = new Segment();
// 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
segment.useDefault();
let word_cloud_map = new Map()

setInterval(async function(){
  let me = bot.Contact.load('xihuanzuoaime')
  console.log('分析词云存储map...')
  await word_cloud_map.forEach(function(value,key){
    // [ 'undefined', '刚', '回来', '我', '错', '了' ]
    let segArr = segment.doSegment(value, {
      simple: true
    })
    let countResultJsonArr = countArr(segArr)
    let v: string = ''
    console.log(countResultJsonArr)
    for (let i = 0; i < countResultJsonArr.length; i++) {
      let name: string | undefined = countResultJsonArr[i]?.name
      let count: number | undefined = countResultJsonArr[i]?.count
      v = v + name + ',' + count + '\\n'
    }
    word_cloud_map.set(key,v)
    if (countResultJsonArr.length > 2) {
      PuppeteerUtil.getOverviewScreenshot(word_cloud_map.get(key), key).then(() => {
        console.log(key + ' 分析完成,生成词云.')
        if (key.indexOf('@chatroom') > 0) {
          me.say("room=" + key)
          let pic_file = FileBox.fromFile(path.join(dirname(fileURLToPath(import.meta.url)), '`./../../files/pic/Overview_'+ key +'.png'))
          me.say(pic_file)
        } else {
          me.say("friend=" + key)
          let pic_file = FileBox.fromFile(path.join(dirname(fileURLToPath(import.meta.url)), '`./../../files/pic/Overview_'+ key +'.png'))
          me.say(pic_file)
        }
      })
    }
  })
  await timersPromise.setTimeout(1500)
  console.log('本次分析完毕,重置计时器,重置词云存储map.')
  await word_cloud_map.clear()

  /**
   * [
   { name: '辛苦', count: 3 },
   { name: '谢咯', count: 1 }
   ]
   * @param arr
   * @returns {[]}
   */
  function countArr(arr: string[]) {
    //数组去重
    let hashArr = [...new Set(arr)];
    let list: string[]=[];
    hashArr.forEach((element: string) => {
      let temp: string[] = arr.filter((i: string) => i==element)
      // @ts-ignore
      list.push(temp);
    });
    let newArr: {name: string,count: number}[]=[]
    hashArr.forEach((item: string,index: number) => {
      newArr.push({
        name:item,
        // @ts-ignore
        count:list[index].length
      })
    })
    return newArr;
  }
},1000 * 60 * 20)

export async function onMessage(msg: Message) {
  let isRoom = (msg.payload?.roomId?.length ?? 0) > 0

  if (msg.type() === bot.Message.Type.Recalled) { // 暂时无效
    const recalledMessage = await msg.toRecalled()
    console.log('撤回事件激活：\r\n' + recalledMessage)
    return
  }
  /*if (isRoom === false && msg.type() === bot.Message.Type.Image) {
      const img = await msg.toImage()
      const thumbFile = await img.thumbnail()
      await thumbFile.toFile(`${process.cwd()}/cache/${thumbFile.name}`, true)
      await timersPromise.setTimeout(1000)

      // console.info(img)
      const hdFile = await img.hd()
      await hdFile.toFile(`${process.cwd()}/cache/${hdFile.name}`, true)
      setTimeout(msg.wechaty.wrapAsync(
          async function () {
              const imginfo = await msg.toFileBox()
              console.info(imginfo)
          },
      ), 500)
  }*/
  if (isRoom && msg.type() === bot.Message.Type.Text) {
    let talker = bot.Contact.load(msg?.payload?.talkerId)
    let room = bot.Room.load(msg?.payload?.roomId)
    if (word_cloud_map.get(room.id) === undefined) {
      word_cloud_map.set(room.id, msg.text())
    } else {
      word_cloud_map.set(room.id, word_cloud_map.get(room.id) + msg.text())
    }
    // if (msg.text() === 'ding') {
    //     let pic_file = FileBox.fromFile(require('path').join(__dirname, '`./../../files/pic/Overview_'+ talker._payload.roomId +'.png'))
    //     await delay.execute(() => talker.say(pic_file))
    //     return
    // }
    //console.log(room.id + ": " + msg.text() + ' || Talker: ', talker.payload.name)
  }
  if (!isRoom && msg.type() === bot.Message.Type.Text) {
    let talker = bot.Contact.load(msg?.payload?.talkerId)
    // let listener = bot.Contact.load(msg?.payload?.toId)
    // 聊天记录存储map
    if (word_cloud_map.get(msg?.payload?.talkerId) === undefined) {
      word_cloud_map.set(talker.id, msg.text())
    } else {
      word_cloud_map.set(talker.id, word_cloud_map.get(talker.id) + msg.text())
    }

    if (msg.text() === 'ding') {
      let pic_file = FileBox.fromFile(path.join(dirname(fileURLToPath(import.meta.url)), '`./../../files/pic/Overview_'+ talker.id +'.png'))
      //await delay.execute(() => talker.say(pic_file))
      const contact = await bot.Contact.find({id: msg?.payload?.talkerId})
      await contact.say(pic_file)
      return
    }

    if (msg.text() === '天气' && friendBelong.get(talker.id) !== undefined) {
      got('https://api.seniverse.com/v3/weather/now.json' +
        '?key=S0UPAJDxDQo9P2Hf_&location=' + friendBelong.get(talker.id) + '&language=zh-Hans&unit=c').json().then((v: any) => {
        const result: {now: any, location: any, last_update: any} = v.results[0]
        let weather_emoji = ''
        if (result.now.text.indexOf('阴') >= 0) {
          weather_emoji = '☁️☁️☁️☁️☁️'
        } else if (result.now.text === '晴') {
          weather_emoji = '🌞🌞🌞🌞🌞'
        } else if (result.now.text.indexOf('晴转多云') >= 0) {
          weather_emoji = '⛅️⛅️⛅️⛅️⛅️'
        } else if (result.now.text.indexOf('雨') >= 0) {
          weather_emoji = '🌧🌧🌧🌧🌧'
        }
        let weather_city = result.location.name
        let weather_text = result.now.text
        let weather_temperature = result.now.temperature
        let weather_last_update = result.last_update
        let str = '城市：' + weather_city + '\n' + weather_emoji + '\n' +
          '实时天气：' + weather_text + ' ' + weather_temperature + '℃' + '\r\n' +
          '测量时间：' + weather_last_update
        talker.say(str)
        console.log(str)
      })
      return
    }
    console.log(`Message: `, msg.text(), 'Talker: ', talker.id)
  }
}
