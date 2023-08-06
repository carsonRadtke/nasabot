## NASA Bot

Access [api.nasa.gov](https://api.nasa.gov) from your Discord server!

Implemented endpoints:

- [APOD](https://apod.nasa.gov/apod/astropix.html) - Astronomy Picture of the Day

### Getting Started

If you want to host your own instance of the bot:

```
$ npm install
$ npm run build
$ NASABOT_TOKEN=<bot_token> node build.bot.js
```

If you want to add this bot to your Discord server, click [here](https://discord.com/api/oauth2/authorize?client_id=701258422498099200&permissions=10240&scope=bot).

### Using the bot

Example:
`./nasa apod`

```
NGC 1360: The Robin's Egg Nebula by Dong Liang
This pretty nebula lies some 1,500 light-years away, its shape and color in this telescopic view reminiscent of a robin's egg. The cosmic cloud spans about 3 light-years, nestled securely within the boundaries of the southern constellation Fornax. Recognized as a planetary nebula, egg-shaped NGC 1360 doesn't represent a beginning though. Instead it corresponds to a brief and final phase in the evolution of an aging star. In fact, visible at the center of the nebula, the central star of NGC 1360 is known to be a binary star system likely consisting of two evolved white dwarf stars, less massive but much hotter than the Sun.  Their intense and otherwise invisible ultraviolet radiation has stripped away electrons from the atoms in their mutually surrounding gaseous shroud. The predominant blue-green hue of NGC 1360 seen here is the strong emission produced as electrons recombine with doubly ionized oxygen atoms.
```

<img src="https://apod.nasa.gov/apod/image/2308/ngc1360_v2.jpg">

### Contributing

Feel free to put up a PR! There are a number of endpoints available at
[api.nasa.gov](https://api.nasa.gov) that the bot could utilize.
