import { Telegraf } from 'telegraf';
import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('Welcome! Please share your location to get the weather information.', {
    reply_markup: {
      keyboard: [
        [
          {
            text: 'Send location',
            request_location: true
          }
        ],
        ['Cancel']
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

bot.on('location', async (ctx) => {
  const { latitude, longitude } = ctx.message.location;

  try {
    const response = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${latitude},${longitude}`);

    const locationName = response.data.location.name;
    const tempC = response.data.current.temp_c;
    const conditionText = response.data.current.condition.text;
    let conditionIcon = response.data.current.condition.icon;

    // Checks if the icon URL is complete and secure.
    if (conditionIcon.startsWith('//')) {
      conditionIcon = 'https:' + conditionIcon;
    }

    const caption = `${locationName}, temperature: ${tempC}°C, ${conditionText}`;
    ctx.telegram.sendPhoto(ctx.chat.id, conditionIcon, { caption });

    ctx.reply('Thank you! Here is the weather information.', {
      reply_markup: {
        remove_keyboard: true
      }
    });
  } catch (error) {
    console.log(error);
    ctx.reply("Sorry, I couldn't fetch the weather information.");
  }
})

bot.hears('Cancel', (ctx) => {
  ctx.reply('Operation cancelled.', {
    reply_markup: {
      remove_keyboard: true
    }
  });
});

bot.launch();