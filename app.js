const cognitiveservices = require('botbuilder-cognitiveservices')
const builder = require('botbuilder');
const startServer = require('./server');

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage());         // Register in-memory state storage

const server = startServer();
server.post('/api/messages', connector.listen());

// Dialogs
const recognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: '9239cfd0-ec8e-42ee-9771-45178ba34279',
    subscriptionKey: '17cde51beb19482cb41a4d10761db4bc'
});
     
const qnaMakerDialog = new cognitiveservices.QnAMakerDialog({ 
    recognizers: [recognizer],
    defaultMessage: 'No good match in FAQ.',
    qnaThreshold: 0.5
});

const strToJson = (str) => {
    try {
        return JSON.parse(str);
    } catch (e) {        
        return false;
    }
}

const createPizzaCard = function(session, pizza) {
    return new builder.HeroCard(session)
        .title(pizza.pizza)
        .subtitle('Guilherme Latrova @ maratona bots 2018')
        .text("R$ 10,50 - Peça com coca-cola!")
        .images([
            builder.CardImage.create(session, pizza.url)
        ])
        .buttons([
            builder.CardAction.messageBack(session, `Eu quero uma ${pizza.pizza}`, "Eu quero!"),
            builder.CardAction.openUrl(session, 'https://stackoverflow.com/story/latrova', 'Who created this?')
        ]);
};

qnaMakerDialog.respondFromQnAMakerResult = function(session, result) {
    const response = result.answers[0].answer;
    const json = strToJson(response);
    if (json) {
        for (let pizza of json.pizzas) {
            const card = createPizzaCard(session, pizza);            
            const msg = new builder.Message(session).addAttachment(card);
            session.send(msg);
        }
    }
    else
    {
        session.send(response);
    }
}

bot.dialog('/', qnaMakerDialog);