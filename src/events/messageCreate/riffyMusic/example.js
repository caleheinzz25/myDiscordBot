export default async ({ client, eventArg }) => {
    if (!eventArg.content.startsWith('!') || eventArg.author.bot) return;

    const args = eventArg.content.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();

    // if (command === "play") {
        
    //     const query = args.join(" ");

    //     const player = client.riffy.createConnection({
    //     guildId: eventArg.guild.id,
    //     voiceChannel: eventArg.member.voice.channel.id,
    //     textChannel: eventArg.channel.id,
    //     deaf: true
    //     });

    //     const resolve = await client.riffy.resolve({ query: query, requester: eventArg.author });
    //     const { loadType, tracks, playlistInfo } = resolve;

    //     if (loadType === 'playlist') {
    //     for (const track of resolve.tracks) {
    //         track.info.requester = eventArg.author;
    //         player.queue.add(track);
    //     }

    //     eventArg.channel.send(`Added: \`${tracks.length} tracks\` from \`${playlistInfo.name}\``,);
    //     if (!player.playing && !player.paused) return player.play();
    //     } else if (loadType === 'search' || loadType === 'track') {
    //     const track = tracks.shift();
    //     track.info.requester = eventArg.author;

    //     player.queue.add(track);
    //     eventArg.channel.send(`Added: \`${track.info.title}\``);
    //     if (!player.playing && !player.paused) return player.play();
    //     } else {
    //     return eventArg.channel.send('There are no results found.');
    //     }
    // }

    // if (command === "skip") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     player.stop();
    //     eventArg.channel.send("Skipped the current song.");
    // }

    // if (command === "stop") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     player.destroy();
    //     eventArg.channel.send("Stopped the player.");
    // }

    // if (command === "pause") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     player.pause(true);
    //     eventArg.channel.send("Paused the player.");
    // }

    // if (command === "resume") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     player.pause(false);
    //     eventArg.channel.send("Resumed the player.");
    // }

    // if (command === "volume") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     const volume = parseInt(args[0]);
    //     if (!volume || isNaN(volume)) return eventArg.channel.send("Please provide a valid number.");

    //     player.setVolume(volume);
    //     eventArg.channel.send(`Set the player volume to: \`${volume}\`.`);
    // }

    // if (command === "queue") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     const queue = player.queue;
    //     if (!queue.length) return eventArg.channel.send("No songs in queue.");

    //     const embed = {
    //     title: "Queue",
    //     description: queue.map((track, i) => {
    //         return `${i + 1}) ${track.info.title} | ${track.info.author}`;
    //     }).join("\n")
    //     };

    //     eventArg.channel.send({ embeds: [embed] });
    // }

    // if (command === "nowplaying") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     console.log(player)
    //     const track = player.current;

    //     if (!track) return eventArg.channel.send("No song currently playing.");

    //     const embed = {
    //     title: "Now Playing",
    //     description: `${track.info.title} | ${track.info.author}`
    //     };

    //     eventArg.channel.send({ embeds: [embed] });
    // }

    // if (command === "loop") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     const loop = args[0];
    //     if (!loop || !["queue", "track"].includes(loop))
    //     return eventArg.channel.send(
    //         "Please provide a valid loop option: `queue` or `track`."
    //     );

    //     const toggleLoop = () => {
    //     const loopType = player.loop === loop ? "none" : loop;
    //     player.setLoop(loopType);
    //     eventArg.channel.send(
    //         `${loop.charAt(0).toUpperCase() + loop.slice(1)} loop is now ${loopType === "none" ? "disabled" : "enabled"
    //         }.`
    //     );
    //     };

    //     toggleLoop();
    // }

    // if (command === "shuffle") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     player.queue.shuffle();
    //     eventArg.channel.send("Shuffled the queue.");
    // }

    // if (command === "remove") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     const index = parseInt(args[0]);
    //     if (!index || isNaN(index))
    //     return eventArg.channel.send("Please provide a valid number.");

    //     const removed = player.queue.remove(index);
    //     eventArg.channel.send(`Removed: \`${removed.info.title}\` from the queue.`);
    // }

    // if (command === "clear") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     player.queue.clear();
    //     eventArg.channel.send("Cleared the queue.");
    // }

    // if (command === "filter") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     const filter = args[0];

    //     const filterActions = {
    //     "8d": { method: "set8D", eventArg: "8D filter enabled." },
    //     bassboost: {
    //         method: "setBassboost",
    //         eventArg: "Bassboost filter enabled.",
    //     },
    //     channelmix: {
    //         method: "setChannelMix",
    //         eventArg: "Channelmix filter enabled.",
    //     },
    //     distortion: {
    //         method: "setDistortion",
    //         eventArg: "Distortion filter enabled.",
    //     },
    //     karaoke: { method: "setKaraoke", eventArg: "Karaoke filter enabled." },
    //     lowpass: { method: "setLowPass", eventArg: "Lowpass filter enabled." },
    //     nightcore: {
    //         method: "setNightcore",
    //         eventArg: "Nightcore filter enabled.",
    //     },
    //     rotate: { method: "setRotation", eventArg: "Rotate filter enabled." },
    //     slowmode: { method: "setSlowmode", eventArg: "Slowmode filter enabled." },
    //     timescale: {
    //         method: "setTimescale",
    //         eventArg: "Timescale filter enabled.",
    //     },
    //     tremolo: { method: "setTremolo", eventArg: "Tremolo filter enabled." },
    //     vaporwave: {
    //         method: "setVaporwave",
    //         eventArg: "Vaporwave filter enabled.",
    //     },
    //     vibrato: { method: "setVibrato", eventArg: "Vibrato filter enabled." },
    //     };

    //     const action = filterActions[filter];
    //     if (action) {
    //     player.filters[action.method](true);
    //     eventArg.channel.send(action.eventArg);
    //     } else {
    //     eventArg.channel.send("Please provide a valid filter option.");
    //     }

    //     // console.log(player.filters);
    // }

    // if (command === "dfilter") {
    //     const player = client.riffy.players.get(eventArg.guild.id);
    //     if (!player) return eventArg.channel.send("No player found.");

    //     const filter = args[0];

    //     const filterActions = {
    //     "8d": { method: "set8D", eventArg: "8D filter disabled." },
    //     bassboost: {
    //         method: "setBassboost",
    //         eventArg: "Bassboost filter disabled.",
    //     },
    //     channelmix: {
    //         method: "setChannelMix",
    //         eventArg: "Channelmix filter disabled.",
    //     },
    //     distortion: {
    //         method: "setDistortion",
    //         eventArg: "Distortion filter disabled.",
    //     },
    //     karaoke: { method: "setKaraoke", eventArg: "Karaoke filter disabled." },
    //     lowpass: { method: "setLowPass", eventArg: "Lowpass filter disabled." },
    //     nightcore: {
    //         method: "setNightcore",
    //         eventArg: "Nightcore filter disabled.",
    //     },
    //     rotate: { method: "setRotation", eventArg: "Rotate filter disabled." },
    //     slowmode: { method: "setSlowmode", eventArg: "Slowmode filter disabled." },
    //     timescale: {
    //         method: "setTimescale",
    //         eventArg: "Timescale filter disabled.",
    //     },
    //     tremolo: { method: "setTremolo", eventArg: "Tremolo filter disabled." },
    //     vaporwave: {
    //         method: "setVaporwave",
    //         eventArg: "Vaporwave filter disabled.",
    //     },
    //     vibrato: { method: "setVibrato", eventArg: "Vibrato filter disabled." },
    //     };

    //     const action = filterActions[filter];
    //     if (action) {
    //     player.filters[action.method](false);
    //     eventArg.channel.send(action.eventArg);
    //     } else {
    //     eventArg.channel.send("Please provide a valid filter option.");
    //     }

    //     // console.log(player.filters);
    // }

    if (command === "eval" && args[0]) {
        try {
        let evaled = await eval(args.join(" "));
        let string = inspect(evaled);

        if (string.includes(client.token))
            return eventArg.reply("No token grabbing.");

        if (string.length > 2000) {
            let output = new AttachmentBuilder(Buffer.from(string), {
            name: "result.js",
            });
            return eventArg.channel.send({ files: [output] });
        }

        eventArg.channel.send(`\`\`\`js\n${string}\n\`\`\``);
        } catch (error) {
        eventArg.reply(`\`\`\`js\n${error}\n\`\`\``);
        }
    }
}