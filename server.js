const db = require("megadb");
const discord = require("discord.js");
const bot = new discord.Client();
const express = require("express");
const app = express();
const http = require("http");
const db2 = require("quick.db");
app.get("/", (request, response) => {
  var keepAlive = require("node-keepalive");
  keepAlive({}, app);
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 300000);
const ekonomi = new db.crearDB("ekonomi"); //ekonomi json oluşturdu
var prefix;
bot.on("message", async msg => {
  if (msg.content.startsWith("prefix")) {
    if (!msg.member.hasPermission("MANAGE_GUILD"))
      return msg.reply("iznin yok.");
    let args = msg.content.slice(7);
    if (!args) return msg.reply(`yeni prefix? simdiki prefix ${prefix}`);
    if(msg.author.bot) return;
    if(args.length > 1) return msg.reply("1 karakterden uzun prefix olamaz. prefix sadece 1 harf,karakter olabilir.")
    let prefix2 = await ekonomi.get(`prefix_${msg.guild.id}`);
    if (prefix2 == null) {
      prefix = "/";
    } else {
      prefix = prefix2;
    }
    if (msg.author.bot) return;

    await ekonomi.set(`prefix_${msg.guild.id}`, args);
    msg.channel.send(`prefix: ${args}`);
  }
});
bot.on("message", msg=>{
  if(msg.content.includes(bot.user)) {
  msg.channel.send(`prefixim: ${prefix}`)
}
       })
bot.on("message", async message => {
  if (message.content.startsWith(prefix + "paraekle")) {
    let args = message.content.slice(10);
    if (!args) message.reply("istenen miktar?");
    if (!ekonomi.has(`${message.author.id}.para`))
      ekonomi.set(`${message.author.id}.para`, 0);

    let para = ekonomi.get(`${message.author.id}.para`); //mesajı atan kişinin parasını ele alır
    ekonomi.add(`${message.author.id}.para`, args);
    let para2 = await ekonomi.get(`${message.author.id}.para`);
    message.channel.send(`mevcut bakiyen ${para2} eklenen para: ${args}`);
  }
});
bot.on("message", async msg => {
  if (msg.content == prefix + "param") {
    let para = await ekonomi.get(`${msg.author.id}.para`);
    msg.channel.send(`paran: ${para}`);
  }
});
bot.on("message", async msg => {
  if (msg.content.startsWith(prefix + "kaydet")) {
    if (!msg.member.hasPermission("MANAGE_GUILD"))
      return msg.reply("izin yok.");
    let rol = msg.mentions.roles.first();
    if (!rol) return msg.reply("rol etiketle");
    ekonomi.set(`${msg.guild.id}.rol`, rol.id);
    msg.channel.send(`kaydedilen otorol: ${rol}\nrolun idsi: ${rol.id}`);
  }
});
bot.on("message", async msg => {
  if (msg.content === prefix + "kaydedilen") {
    let kay = await ekonomi.get(`${msg.guild.id}.rol`);
    console.log(kay);
    if (!ekonomi.has(`${msg.guild.id}.rol`)) return;

    msg.channel.send(`kaydedilmiş rol(otorol): ${kay}`);
  }
});
bot.on("message", msg => {
  if (msg.content === prefix + "ayarlar") {
    let x = ekonomi.get(`${msg.guild.id}.rol`);
    let s;
    if (x === null) s = "kapalı";
    else s = "açık";
    let e = new discord.RichEmbed()
      .setDescription("ayarlar")
      .addField("otorol", s);
    msg.channel.send(e);
  }
});
bot.on("guildMemberAdd", async mem => {
  let oto = await ekonomi.get(`${mem.guild.id}.rol`);
  if (oto === undefined || oto === null || !ekonomi.has(`${mem.guild.id}.rol`))
    return;

  mem.addRole(oto);
});
bot.login('bot token')
