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
