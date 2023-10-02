const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { stripIndents, oneLine } = require('common-tags');

module.exports = {
	name: 'verification',
	listener: 'interactionCreate',
	async run(client, int) {
		if (int.isModalSubmit()) {
			
			const db = await mongodb?.db('nikki');
			const coll = db.collection('setting');
			const mongoData = await coll.find({ server_id: int.guildId })?.toArray();
			
			const serverData = mongoData[0];
			const verificationQuestion = serverData.verify_question ?? client.verificationQuestion;
			
			if (int.customId == 'verification_modal_1') {
				
				const answer_1 = int.fields.getTextInputValue('answer_1');
				const answer_2 = int.fields.getTextInputValue('answer_2');
				const answer_3 = int.fields.getTextInputValue('answer_3');
				const answer_4 = int.fields.getTextInputValue('answer_4');
				const answer_5 = int.fields.getTextInputValue('answer_5');
				

				const confirm = new ButtonBuilder()
				.setCustomId('verification_button')
				.setLabel('Continue')
				.setStyle(ButtonStyle.Success);
				
				const row = new ActionRowBuilder()
				.addComponents(confirm);
				
				const Embed = new EmbedBuilder()
				.setTitle('Continue your verification, click button below')
				.setColor('Green')
				
				
				await client.verify.set(
					int.user.id, 
					[
						[ verificationQuestion[0], answer_1 ],
						[ verificationQuestion[1], answer_2 ],
						[ verificationQuestion[2], answer_3 ],
						[ verificationQuestion[3], answer_4 ],
						[ verificationQuestion[4], answer_5 ],
					]
				)
				
				
				return int.reply(globalFunc.sendEphemeral({
					content: int.user.toString(),
					embeds: [Embed],
					components: [row]
				}))
				
				
			}
			
			if (int.customId == 'verification_modal_2') {

				let backupChannel = false;
				let channel_log = await client.channels.cache.get(serverData.verification_log);

				if(!channel_log) {
					channel_log = await client.channels.cache.get(serverData.general_log);
					backupChannel = true
				}

				if(!channel_log) {
					const owner = await client.users.fetch(client.owner);

					const cx = await owner.createDM();

					cx?.send({
						content: `\`verification_log\` and \`general_log\` is invalid on \`${int.guild.name}\`:\`${int.guildId}\` `
					})

					return int.update('Something broke, please contact staff for alternative way to verification.')
				}

				const datas = await client.verify.get(int.user.id);
				const userAnswers = [
					[ verificationQuestion[5], int.fields.getTextInputValue('answer_6') ],
					[ verificationQuestion[6], int.fields.getTextInputValue('answer_7') ],
					[ verificationQuestion[7], int.fields.getTextInputValue('answer_8') ],
					[ verificationQuestion[8], int.fields.getTextInputValue('answer_9') ],
					[ verificationQuestion[9], int.fields.getTextInputValue('answer_10') ],
				];


				const sortedAnswer = [...datas, ...userAnswers]

				client.verify.delete(int.user.id);

				let State = '';

				State += stripIndents`
				**User Tag & Id:**
				> \`${int.user.tag}\` | \`${int.user.id}\`

				**Account Created:**
				> <t:${ Math.round(int.user.createdTimestamp/1000) }:R> | <t:${ Math.round(int.user.createdTimestamp/1000) }:F>
				`+'\n\n';
				
				
				sortedAnswer.map((cat, i) => {
					State += `${i+1}) **${cat[0]}**?\n> ${cat[1]}\n\n`
				})


				// send to Staff
				const ANS = new EmbedBuilder()
				.setAuthor({
					name: `${int.user.username} | ${int.user.id}`,
					iconURL: int.user.displayAvatarURL({ extension: 'png', dynamic: false }),
					url: int.user.displayAvatarURL({ extension: 'png', dynamic: false })
				})
				.setColor('Yellow')
				.setDescription(State)
				.setImage(int.user.displayAvatarURL({ dynamic: true, size: 4096 }))


				const ver_app = new ButtonBuilder()
				.setCustomId(`ver_pending_approve_${int.user.id}`)
				.setLabel('Approve')
				.setStyle(ButtonStyle.Success);

				const ver_den = new ButtonBuilder()
				.setCustomId(`ver_pending_deny_${int.user.id}`)
				.setLabel('Deny')
				.setStyle(ButtonStyle.Danger);

				const ver_resumbit = new ButtonBuilder()
				.setCustomId(`ver_pending_reverify_${int.user.id}`)
				.setLabel('Ask for Re-sumbit')
				.setStyle(ButtonStyle.Secondary);

				const staffRow_1 = new ActionRowBuilder().addComponents(ver_app, ver_den, ver_resumbit);

				channel_log?.send({
					content: `${backupChannel ? serverData.staff_role : '' }`,
					embeds: [ANS],
					components: [staffRow_1]
				})


				// send to user
				const Embed = new EmbedBuilder()
				.setTitle('Your submission was received successfully!. Please wait for staff to review it.')
				.setColor('Green')

				await int.member.roles.add(serverData?.verification_pending_role)

				return int.update(
					globalFunc.sendEphemeral({ 
						content: int.user.toString(), 
						embeds: [Embed],
						components: []
					})
				)
				
			}
			
			if (int.customId.startsWith('staff_resubmit')) {
				const sub = int.customId.replace('staff_resubmit_', '');
				const [userId, messageId] = sub.split('_');
				const modInput = int.fields.getTextInputValue('reason')
				
				const member = await int.guild.members.fetch(userId).catch(() => false);

				if(!member) {					
					const embed2 = new EmbedBuilder()
					.setTitle('User Left')
					.setColor('Red')
					await int.update({ components: [] });
					return int.followUp({ embeds: [embed2] })
				}
				
				const US_DM = await member.createDM()

				try {
					US_DM.send({
						content: `It seems like your submission is denied.\nModerator Reasoning: \`${modInput}\``
					})
					
					await member.roles.remove(mongoData[0]?.verification_pending_role)

					await int.update({ components: [] })
					
					const embed = new EmbedBuilder()
					.setTitle('Verification Denied with Reason')
					.setDescription(stripIndents`
					>>> Target User:
					${member.user.toString()} | \`${userId}\` | ${member.user.tag}
						
					Moderator: 
					${int.user.toString()}
					
					Reason:
					${modInput}
					
					When?:
					<t:${ Math.floor( Date.now() / 1000) }:R>
					`)
					.setColor('Red')
					.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
					
					return int.followUp({
						content: 'User Successfully Notified',
						embeds: [embed]
					})
				}
				catch(e) {
					
					await member.roles.remove(mongoData[0]?.verification_pending_role)
					await int.update({ components: [] }).catch(() => false)
					
					const embed = new EmbedBuilder()
					.setTitle('Verification Denied with Reason')
					.setDescription(stripIndents`
					>>> Moderator: 
					${int.user.toString()}
					
					Reason:
					${modInput}
					
					Error: 
					${e.message}
					`)
					return int.followUp({
						content: 'Cannot Notify the user, they might have DM closed, or they blocked me.',
						embeds: [embed]
					})
				}
			}
		}
		if(int.isButton()) {
		
			const db = await mongodb?.db('nikki');
			const coll = db.collection('setting');
			const mongoData = await coll.find({ server_id: int.guildId })?.toArray();

			if (int.customId == 'start_verification') {
				const pendingRole = mongoData[0]?.verification_pending_role;
				const state2 = await int.member.guild.roles.fetch(pendingRole).catch(() => false)
				if(!pendingRole || !state2 ) {

					const owner = await client.users.fetch(client.owner);
					const cx = await owner.createDM();
					cx?.send({
						content: `\`pending_role\` is invalid on \`${int.guild.name}\`:\`${int.guildId}\` `
					})

					return int.reply( globalFunc.sendEphemeral('Error, Please contact Staff for alternative verification or open ticket.') )
				}

				if(int.member.roles.cache.find(x => x.id == state2.id)) {
					const embedex = new EmbedBuilder()
					.setTitle('You already submitted your verification. Please wait for staff to review it.')
					.setColor('Random')

					return int.reply(globalFunc.sendEphemeral({
						embeds: [embedex]
					}))
				}
				
				if(int.member.roles.cache.find(x => x.id == mongoData[0]?.member_role)) {
					const embedex = new EmbedBuilder()
					.setTitle('You already verified.')
					.setColor('Random')

					return int.reply(globalFunc.sendEphemeral({
						embeds: [embedex]
					}))
				}
				

				const modal = new ModalBuilder()
				.setCustomId('verification_modal_1')
				.setTitle('Verification Modal 1/2');

				// Create the text input components
				const one = new TextInputBuilder()
					.setCustomId('answer_1')
					.setStyle(TextInputStyle.Paragraph);

				const two = new TextInputBuilder()
					.setCustomId('answer_2')
					.setStyle(TextInputStyle.Paragraph);

				const three = new TextInputBuilder()
					.setCustomId('answer_3')
					.setStyle(TextInputStyle.Short);

				const four = new TextInputBuilder()
					.setCustomId('answer_4')
					.setStyle(TextInputStyle.Paragraph);

				const five = new TextInputBuilder()
					.setCustomId('answer_5')
					.setStyle(TextInputStyle.Paragraph);


				one.setLabel( client.verificationQuestion[0] )
				two.setLabel( client.verificationQuestion[1] )
				three.setLabel( client.verificationQuestion[2] )
				four.setLabel( client.verificationQuestion[3] )
				five.setLabel( client.verificationQuestion[4] )

				const oneRow = new ActionRowBuilder().addComponents(one);
				const twoRow = new ActionRowBuilder().addComponents(two);
				const threeRow = new ActionRowBuilder().addComponents(three);
				const fourRow = new ActionRowBuilder().addComponents(four);
				const fiveRow = new ActionRowBuilder().addComponents(five);

				modal.addComponents(oneRow, twoRow, threeRow, fourRow, fiveRow);
				await int.showModal(modal);
			}
				
			if (int.customId == 'verification_button') {			
				const VQ = mongoData[0]?.verify_question ?? client.verificationQuestion;
				
				const modal = new ModalBuilder()
				.setCustomId('verification_modal_2')
				.setTitle('Verification Modal 2/2');

				const one = new TextInputBuilder()
				.setCustomId('answer_6')
				.setStyle(TextInputStyle.Paragraph);
				
				const two = new TextInputBuilder()
				.setCustomId('answer_7')
				.setStyle(TextInputStyle.Paragraph);
				
				const three = new TextInputBuilder()
				.setCustomId('answer_8')
				.setStyle(TextInputStyle.Paragraph);
				
				const four = new TextInputBuilder()
				.setCustomId('answer_9')
				.setStyle(TextInputStyle.Short);
				
				const five = new TextInputBuilder()
				.setCustomId('answer_10')
				.setStyle(TextInputStyle.Short);
				
				one.setLabel( VQ[5] )
				two.setLabel( VQ[6] )
				three.setLabel( VQ[7] )
				four.setLabel( VQ[8] )
				five.setLabel( VQ[9] )
				
				const oneRow = new ActionRowBuilder().addComponents(one);
				const twoRow = new ActionRowBuilder().addComponents(two);
				const threeRow = new ActionRowBuilder().addComponents(three);
				const fourRow = new ActionRowBuilder().addComponents(four);
				const fiveRow = new ActionRowBuilder().addComponents(five);
				
				modal.addComponents(oneRow, twoRow, threeRow, fourRow, fiveRow);
				await int.showModal(modal);
			}
			
			if (int.customId.startsWith('ver_pending')) {
				const parse = int.customId.replace('ver_pending_', '')
				const splitted = parse.split('_');
				const UserID = splitted[ splitted.length - 1 ];
				const type = splitted[0];
				
				const Embed = new EmbedBuilder()
				const member = await int.guild.members.fetch(UserID).catch(() => false);
				
				if(type == 'approve') {
					try {
						if(!member) {
							const embed2 = new EmbedBuilder()
							.setTitle('User Left')
							.setColor('Red')
							await int.update({ components: [] });
							return int.followUp({ embeds: [embed2] })
						}

						if( member?.roles?.cache?.find(x => x.id == mongoData[0]?.member_role) ) {
							const embed2 = new EmbedBuilder()
							.setTitle('User already verified')
							.setColor('Red')
							await int.update({ components: [] });
							return int.followUp({ embeds: [embed2] })
						}
							
						
						await member.roles.add(mongoData[0]?.member_role)
						await member.roles.remove(mongoData[0]?.verification_pending_role)

						const USRX_DM = await member.createDM();
						
						let customMsg = undefined;
						if(mongoData[0].verify_approved_message) {
							customMsg = mongoData[0].verify_approved_message
							.replaceAll('{guildName}', int.guild.name)
							.replaceAll('{userName}', member.user.username)
						}
						
						USRX_DM.send(
							customMsg ?? `Congratulations, you've been approved into ${int.guild.name}`
						)
						
						await int.update({ components: [] });
						
						console.log(int)
						return int.followUp({ 
							embeds: [ 
								Embed
								.setTitle('User Submission Approved')
								.setDescription(stripIndents`
								>>> Target User:
								${member.user.toString()} | \`${UserID}\` | ${member.user.tag}
								
								Moderator: 
								${ int.user.toString() }
								
								Role Given:
								<@&${ mongoData[0]?.member_role }>
								
								When?:
								<t:${ Math.floor( Date.now() / 1000) }:R>
								`)
								.setColor('Green')
								.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
							] 
						})
					}
					catch(e) {
						console.log(e)
						int.reply({
							content: `ERROR, Contact Owner.\n\nError: [ \n${e.message} \n]`
						})
					}
				}
				if(type == 'deny') {
					try {
						if(!member) {
							const embed2 = new EmbedBuilder()
							.setTitle('User Left')
							.setColor('Red')
							await int.update({ components: [] });
							return int.followUp({ embeds: [embed2] })
						}
						
						if( member?.roles?.cache?.find(x => x.id == mongoData[0]?.member_role) ) {
							const embed2 = new EmbedBuilder()
							.setTitle('User already verified')
							.setColor('Red')
							await int.update({ components: [] });
							return int.followUp({ embeds: [embed2] })
						}
						
						const USRX_DM = await member.createDM();
						
						let customMsg = undefined;
						if(mongoData[0].verify_denied_message) {
							customMsg = mongoData[0].verify_denied_message
							.replaceAll('{guildName}', int.guild.name)
							.replaceAll('{userName}', member.user.username)
						}
						
						USRX_DM.send(
							customMsg ?? `It seems like your submission denied on ${int.guild.name}. But you can reapplied again.`
						)

						await member.roles.remove(mongoData[0]?.verification_pending_role)

						await int.update({ components: [] });
						
						// console.log(int)
						return int.followUp({ 
							embeds: [ 
								Embed
								.setTitle('User Submission Denied')
								.setDescription(stripIndents`
								>>> Target User:
								${member.user.toString()} | \`${UserID}\` | ${member.user.tag}
								
								Moderator: 
								${ int.user.toString() }
								
								When?:
								<t:${ Math.floor( Date.now() / 1000) }:R>
								`)
								.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
								.setColor('Red') 
							] 
						})
					}
					catch(e) {
						console.log(e)
						int.reply({
							content: `ERROR, Contact Owner.\n\nError: [ \n${e.message} \n]`
						})
					}
				}
				if(type == 'reverify') {
					try {
						if(!member) {
							const embed2 = new EmbedBuilder()
							.setTitle('User Left')
							.setColor('Red')
							await int.update({ components: [] });
							return int.followUp({ embeds: [embed2] })
						}
						
						if( member?.roles?.cache?.find(x => x.id == mongoData[0]?.member_role) ) {
							const embed2 = new EmbedBuilder()
							.setTitle('User already verified')
							.setColor('Red')
							await int.update({ components: [] });
							return int.followUp({ embeds: [embed2] })
						}						
						
						const modal = new ModalBuilder()
						.setCustomId(`staff_resubmit_${UserID}_${int.message?.id}`)
						.setTitle('Asking for Re-sumbmission');

						const reasoning = new TextInputBuilder()
						.setCustomId('reason')
						.setLabel("Give a reason for re-sumbmission?")
						.setStyle(TextInputStyle.Paragraph);

						const oneRow = new ActionRowBuilder().addComponents(reasoning);

						modal.addComponents(oneRow);
						await int.showModal(modal);
						
					}
					catch(e) {
						console.log(e)
						int.reply({
							content: `ERROR, Contact Owner.\n\nError: [ \n${e.message} \n]`
						})
					}
				}
			}
		}
	}
}
