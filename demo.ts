import {
  Contact,
  WechatyBuilder,
  log,
} from 'wechaty'

import { PuppetXp } from './src/puppet-xp.ts'
import * as onMessage from './listener/on-message.ts'


async function onLogin (user: Contact) {
  log.info('StarterBot', '%s login', user)
  const roomList = await bot.Room.findAll()
  console.info(roomList.length)
  const contactList = await bot.Contact.findAll()
  console.info(contactList.length)
}

function onLogout (user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

const puppet = new PuppetXp()
export const bot = WechatyBuilder.build({
  name: 'wx-bot',
  puppet
})

bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage.onMessage)

bot.start()
  .then(() => {
    return log.info('StarterBot', 'Starter Bot Started.')
  })
  .catch(console.error)

