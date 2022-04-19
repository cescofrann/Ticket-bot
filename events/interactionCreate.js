const axios = require('axios');
const config2 = require('C:\\Users\\ftan0\\Downloads\\VanityTicketBot\\config.json')

const startup = async () => {

	const url = config2.url;
	const licensekey = config2.licensekey;
	const product = config2.product;
	const version = config2.version;
	const public_api_key = config2.public_api_key;

	try {

		const res = await axios.post(
			url,
			{
				licensekey,
				product,
				version,
			},
			{
				headers: { Authorization: public_api_key },
			}
		);


		if (!res.data.status_code || !res.data.status_id) {
			console.log('Invalid authentication');
			return process.exit(1);
		}


		if (res.data.status_overview !== 'success') {
			console.log('Compra la cazzo di licenza e non provare a inculare il codice animale');
			console.log(res.data.status_msg);
			return process.exit(1);
		}

		const hash = res.data.status_id;


		const hash_split = hash.split('694201337');

		const decoded_hash = Buffer.from(hash_split[0], 'base64').toString();


		const license_first = licensekey.substr(0, 2);


		const license_last = licensekey.substr(licensekey.length - 2);


		const public_api_key_first = public_api_key.substr(0, 2);

		if (
			decoded_hash !==
			`${license_first}${license_last}${public_api_key_first}`
		) {
			console.log('Authentication failed');
			return process.exit(1);
		}




		let epoch_time_full = Math.floor(Date.now() / 1000);


		const epoch_time = epoch_time_full
			.toString()
			.substr(0, epoch_time_full.toString().length - 2);

		if (parseInt(epoch_time) - parseInt(hash_split[1]) > 1) {
			console.log('Authentication failed');
			return process.exit(1);
		}

		console.log("Ticket licence's valid <3                                [6-7]");
	} catch (err) {
		console.log('Authentication failed');
		console.log(error);
		process.exit(1);
	}
};


startup();

let hastebin = require('hastebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Hai già un ticket aperto !',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Ticket creato! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('035efc')
          .setAuthor('Vanity Evolution Ticket Bot', 'https://media.discordapp.net/attachments/952707348525375488/955927087242440714/ricchioni.png?width=630&height=630')
          .setDescription('Seleziona la categoria del ticket prima di mandare un messaggio')
          .setFooter('Cescofran#3696', 'https://media.discordapp.net/attachments/952707348525375488/955927087242440714/ricchioni.png?width=630&height=630')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Seleziona la tipologia del ticket')
            .addOptions([{
                label: 'Assistenza',
                value: 'assistenza',  //transaction
                emoji: '❓',
              },
              {
                label: 'Donazioni',
                value: 'donazioni', //jeux
                emoji: '💸',
              },
              {
                label: 'Altro',
                value: 'generale',  //autre
                emoji: '🔥',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('035efc')
                  .setAuthor('Ticket', 'https://media.discordapp.net/attachments/952707348525375488/955927087242440714/ricchioni.png?width=630&height=630')
                  .setDescription(`<@!${interaction.user.id}> Hai appena creato un ticket ${i.values[0]}.\nUno staffer sarà presto da te.\n\n*Ti pregiamo di non spammare ping in caso di mancata riposta immediata.*`)
                  .setFooter('Cescofran#3696')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Chiudi il ticket')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'assisenza') {
              c.edit({
                parent: client.config.parentTransactions
              });
            };
            if (i.values[0] == 'donazioni') {
              c.edit({
                parent: client.config.parentJeux
              });
            };
            if (i.values[0] == 'generale') {
              c.edit({
                parent: client.config.parentAutres
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Non hai selezionato nessuna categoria. Sto per **chiudere** il ticket, ti rimangono 60 secondi per selezionare una categoria`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 60000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Chiudi il ticket')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Annulla')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Sei sicuro di voler chiudere il ticket ?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Ticket chiuso da <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('035efc')
                .setAuthor('Ticket', 'https://media.discordapp.net/attachments/952707348525375488/955927087242440714/ricchioni.png?width=630&height=630')
                .setDescription('```Sicuro di voler chiudere il ticket```')
                .setFooter('Cescofran#3696')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Conferma la chiusura del ticket')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Chiusura del ticket annullata !',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Chiusura del ticket annullata !',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: `Sto memorizzando i messaggi. Li troverai nei log che ti ho mandato in dm <@!${interaction.user.id}>...`
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('fr-FR')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com/'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://media.discordapp.net/attachments/952707348525375488/955927087242440714/ricchioni.png?width=630&height=630')
              .setDescription(`📰 Logs del ticket \`${chan.id}\` creato per <@!${chan.topic}> e chiuso da <@!${interaction.user.id}>\n\nLogs: [**Clicca qua per leggere i log**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://media.discordapp.net/attachments/952707348525375488/955927087242440714/ricchioni.png?width=630&height=630')
              .setDescription(`📰 Logs del tuo ticket \`${chan.id}\`: [**Clicca qua per leggere i log**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });
            client.users.cache.get(chan.topic).send({
              embeds: [embed2]
            }).catch(() => {console.log('I can\'t dm him :(')});
            chan.send('Elimino il canale...');

            setTimeout(() => {
              chan.delete();
            }, 3000);
          });
      });
    };
  },
};
