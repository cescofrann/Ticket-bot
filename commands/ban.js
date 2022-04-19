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

		console.log("Ticket ban license's valid <3                            [3-7]");
	} catch (err) {
		console.log('Authentication failed');
		console.log(error);
		process.exit(1);
	}
};


startup();

const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban una persona.')
    .addUserOption(option =>
      option.setName('target')
      .setDescription('Membro da bannare')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('motivo')
      .setDescription('Motivo del ban')
      .setRequired(false)),
  async execute(interaction, client) {
    const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('target').id);
    const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);

    if (!executer.permissions.has(client.discord.Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({
      content: 'Non hai i permessi per fare questo comando ! (`BAN_MEMBERS`)',
      ephemeral: true
    });

    if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
      content: 'La persona che vuoi bannare è sopra di me !',
      ephemeral: true
    });

    if (!user.bannable) return interaction.reply({
      content: 'La persona che vuoi bannare è sopra di me e non la posso bannare.',
      ephemeral: true
    });

    if (interaction.options.getString('motivo')) {
      user.ban({
        reason: interaction.options.getString('motivo'),
        days: 1
      });
      interaction.reply({
        content: `**${user.user.tag}** è stato **BANNATO** !`
      });
    } else {
      user.ban({
        days: 1
      });
      interaction.reply({
        content: `**${user.user.tag}** è stato **BANNATO** !`
      });
    };
  },
};