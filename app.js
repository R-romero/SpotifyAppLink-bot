require('dotenv').config()

const Telegraf = require('telegraf')
const axios = require('axios')
const moment = require('moment')
const app = require('./server')


const bot = new Telegraf(process.env.TELEGRAM_API_KEY)
const spotifyRegex = /https\:\/\/open\.spotify\.com\/(playlist|track|album)\/(.+)/

// Hears for messages that pass the spotifyRegex
bot.hears(spotifyRegex, async (ctx) => {

    // Request Data from @LuisTessaro/webtoapp-spotify-api microservice
    try {
        // Set Authentication
        config = {
            headers: {
                user: process.env.USER,
                password: process.env.PASSWORD,
            }
        }
        // Data Request
        const {data} = await axios.post(
            `${process.env.BACKEND}/api/spotifytiny`, 
            {fullLink: ctx.message.text},
            config,
        );
        // Set redirect URL
        const finalLink = `${process.env.BACKEND}/${data._id}`
        // Set Image Properties
        const finalImage = {url: data.image, filename: data.title}
        // Format Date
        const formattedDate = moment(data.release_date).format('ll')
        
        // add extra params to send on Bot reply
        const extras =
            {
                caption: `Song: ${data.title}\nAuthor: ${data.author}\nRelease Date: ${formattedDate}\n\nSent by: @${ctx.message.from.username}`,
                reply_markup: {"inline_keyboard":[
                    [{"text": 'SpotifyApp',"url": finalLink,"hide":false}]
                ]},
            }
        
        // Send Reply
        ctx.replyWithPhoto(finalImage,  extras)
        // Delete the message which triggered this call
        ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id)
    } catch (error) {
        console.log(error)
    }

})

bot.launch()
console.log('SpotifyAppLink [BOT]')