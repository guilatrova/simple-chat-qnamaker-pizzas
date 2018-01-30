var builder = require('botbuilder');
var restify = require('restify');
var request = require('request');

const LuisModelUrl = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/3d447561-0a42-42ae-8858-e6756fbb2476?subscription-key=376fc739a9034815b3d30eaef6add40f&verbose=true&timezoneOffset=0&q=";
const MoedaURL = "http://api-cotacoes-maratona-bots.azurewebsites.net/api/Cotacoes/";

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage());         // Register in-memory state storage

var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Cumprimento', [
        function(session) {
            session.send('Eae, tranquilo? :)');
        }
    ])
    .matches('Sobre', [
        function(session) {
            session.send('Eu sou apenas um BOT de um estudante :/');
        }
    ])
    .matches('Cotacao', [
        function(session, args, next) {
            const moedas = args.entities.map(e => e.entity).join(',');
            session.send("Vou fazer a cotação das seguintes moedas: %s", moedas);
            request.get(MoedaURL + moedas, (error, response) => {
                if (error) {
                    session.send('Deu ruim :(');
                }
                else {
                    const json = JSON.parse(response.body);
                    const result = json.map(c => `- **${c.nome}** → ${c.valor}`).join('\n');
                    session.send(result);
                }
            });
        }
    ])
    .onDefault((session) => {
        session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
    });

bot.dialog('/', intents);