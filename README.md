## Ticket Bot
Per avviare il file installate prima le librerie corrette.
npm install discord.js
npm install axios
npm install fs
npm install @discordjs/rest
npm install discord-api-types/v9

![](https://i.imgur.com/XecyLJN.gif)


## How to config ?

```json
//config.json
{
  "clientId": "id of the bot",


  "parentOpened": "id della categoria per i ticket aperti",
  "parentTransactions": "id della categoria per 'transactions'",
  "parentJeux": "id della categoria per 'jeux'",
  "parentAutres": "id della categoria per 'autres'",


  "roleSupport": "id dello staff",

  
  "logsTicket": "id del canale per i ticket logs",
  "ticketChannel": "id stanza dove verrà mandato l'embed per creare un ticket",
  
  "footerText": "il fondo dell'embed"
}
```

```json
//token.json
{
  "token": "token del tuo discord bot"
}
```


