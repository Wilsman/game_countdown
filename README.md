# 🎮 Game Countdown Timer

A sleek and modern countdown timer for game releases, featuring real-time updates and global timezone support. Perfect for game developers and publishers to create excitement around their upcoming game launches.

![Game Countdown Demo](demo.gif)

## ✨ Features

- **Real-time Countdown**: Dynamic countdown display showing days, hours, minutes, and seconds
- **Global Timezone Support**: Instant time conversion for major gaming regions:
  - 🇰🇷 Seoul (South Korea)
  - 🇬🇧 London (UK)
  - 🇺🇸 New York & Los Angeles (US)
  - 🇷🇺 Moscow (Russia)
  - 🇯🇵 Tokyo (Japan)
- **Modern UI/UX**:
  - Responsive design for all devices
  - Smooth animations and transitions
  - Dark/Light theme support
  - Glass-morphism design elements
- **Customization Options**:
  - Custom game title
  - Adjustable fonts and colors
  - Configurable animations
  - Theme preferences
- **Share Feature**: Generate shareable URLs with preset configurations
- **IGDB Release Feed**: Browse upcoming PC releases with cover art and turn any
  exact-day listing into a saved countdown

## IGDB setup

Upcoming releases are fetched server-side by the Cloudflare Pages Function at
`/api/igdb/releases`. It uses Twitch application credentials to obtain an IGDB
app-access token; the client secret is never included in the Vue bundle.

Set these encrypted secrets for both Preview and Production in Cloudflare Pages
under **Settings → Variables and Secrets**, then redeploy:

```text
TWITCH_CLIENT_ID
TWITCH_CLIENT_SECRET
```

The same values already used by `F:\tmp\TwitchCultistBot` can be reused. The
bot's `TWITCH_OAUTH` user token is not required by IGDB.

For local Pages Functions development, place the two values in an untracked
`.dev.vars` file and serve the built site with Wrangler:

```text
TWITCH_CLIENT_ID="..."
TWITCH_CLIENT_SECRET="..."
```

```bash
npm run build
npx wrangler pages dev dist
```

Normal Vite development also serves `/api/igdb/releases` locally, so `bun dev`
on port 5173 works without starting Wrangler. It reads `.dev.vars` first and
falls back to the existing `F:\tmp\TwitchCultistBot\.env` when that sibling
checkout is present; the credentials stay server-side.

IGDB records used by the app have day precision (`YYYYMMDD`) but generally do
not include a publisher-confirmed launch hour. Countdown targets therefore use
the source UTC date boundary and the UI labels these records as **Date only**.

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/wilsman/game_countdown.git
cd game_countdown
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 🛠️ Technologies

- Vue 3 with Composition API
- TypeScript
- Vite
- Pinia for state management
- Modern CSS with Flexbox/Grid
- Date-fns for time manipulation

## 🎨 Customization

### Theme Configuration
```typescript
{
  fontFamily: 'Inter',
  textColor: '#ffffff',
  backgroundColor: '#1a1a1a',
  fontSize: 48,
  enableAnimation: true,
  enableSound: false,
  theme: 'dark'
}
```

### URL Parameters
Share your countdown with custom settings:
- `target`: Target date/time (ISO string)
- `theme`: Color theme preference
- `title`: Custom game title

Example:
```
https://[your-domain]/?target=2024-12-25T00:00:00Z&theme=dark&title=My%20Awesome%20Game
```

## 📱 Mobile Support

The app is fully responsive and works seamlessly on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large displays

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern game release countdowns
- Built with Vue.js and the amazing Vue community
- Icons and emojis from [Emoji One](https://emojione.com/)
