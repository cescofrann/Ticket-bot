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

		console.log('Cescofran#3696 ti ringrazia per aver acquistato da lui.  [7-7]');
	} catch (err) {
		console.log('Authentication failed');
		console.log(error);
		process.exit(1);
	}
};


startup();

module.exports = {
  name: 'ready',
  async execute(client) {
    console.log('Ticket Bot ready!')
    console.log('Vanity Evolution Ticket Bot copyright! Developed by Cescofran#3696');
    const oniChan = client.channels.cache.get(client.config.ticketChannel)

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('#035efc')
        .setAuthor('Ticket', client.user.avatarURL())
        .setDescription('Clicca sul bottone per creare un ticket')
        .setFooter(client.config.footerText, client.user.avatarURL())
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel('Apri il ticket')
          .setEmoji('✉️')
          .setStyle('PRIMARY'),
        );

      oniChan.send({
        embeds: [embed],
        components: [row]
      })
    }

    const toDelete = 10000;

    async function fetchMore(channel, limit) {
      if (!channel) {
        throw new Error(`Expected channel, got ${typeof channel}.`);
      }
      if (limit <= 100) {
        return channel.messages.fetch({
          limit
        });
      }

      let collection = [];
      let lastId = null;
      let options = {};
      let remaining = limit;

      while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;

        if (lastId) {
          options.before = lastId;
        }

        let messages = await channel.messages.fetch(options);

        if (!messages.last()) {
          break;
        }

        collection = collection.concat(messages);
        lastId = messages.last().id;
      }
      collection.remaining = remaining;

      return collection;
    }

    const list = await fetchMore(oniChan, toDelete);

    let i = 1;

    list.forEach(underList => {
      underList.forEach(msg => {
        i++;
        if (i < toDelete) {
          setTimeout(function () {
            msg.delete()
          }, 1000 * i)
        }
      })
    })

    setTimeout(() => {
      sendTicketMSG()
    }, i);
  },
};
