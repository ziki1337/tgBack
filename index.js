const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors')
const token = '7226543955:AAFa4xL7AbMNz4DBWVBUaH9S6b4lhJBuCLg';
const webAppUrl = 'https://testgbot.netlify.app'

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json())
app.use(cors())

bot.onText(/\/echo (.+)/, (msg, match) => {
  
  const chatId = msg.chat.id;
  const resp = match[1]; 

  bot.sendMessage(chatId, resp);
});

bot.on('message', async(msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === "/start"){
    await bot.sendMessage(chatId, 'Ниже появится форма, заполни её', {
        reply_markup: {
            keyboard: [
                [{text: 'Сделать заказ', web_app: {url: webAppUrl + '/form'}}] //создаем кнопку, с текстом из параметра text
            ]
        }
    })
  
    await bot.sendMessage(chatId, 'Вот и ссылка', {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Сделать заказ', web_app: {url: webAppUrl}}] //создаем кнопку, с текстом из параметра text
            ]
        }
    })
  }

 if(msg?.web_app_data?.data)
 {
  try 
  {
    const data = JSON.parse(msg?.web_app_data?.data)

    await bot.sendMessage(chatId, "Спасибо за обратную связь!");
    await bot.sendMessage(chatId, "Ваша страна: " + data?.country);
    await bot.sendMessage(chatId, "Ваша улица: " + data?.street);

    setTimeout(async() => {
      await bot.sendMessage(chatId, "Всю информацию вы получите в чате!");
    }, 3000)
  }
  catch(e)
  {
    console.log(e);
  }
 }

});

app.post('/web-data', async (req, res) => {
  const{queryId, products, totalPrice} = req.body;

  try{
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка!',
      input_message_content: {message_text: 'Поздравляю с покупкой, вы приобрели товар на сумму: ' + totalPrice}
    });
    return res.status(200).json({});
  }
  catch(e) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Не удалось приобрести товар!',
      input_message_content: {message_text: 'Не удалось приобрести товар: ' + e}
    });
    return res.status(500).json({});
  }
})

const PORT = 8000;
app.listen(PORT, () => console.log("Сервер запустился на порте: " + PORT))
