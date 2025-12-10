# Morphix AI - 2D to 3D Neural Geometry Engine

<p align="center">
  <img src="public/next.svg" alt="Morphix AI" width="200"/>
</p>

Transform 2D images into high-fidelity 3D models using advanced AI technology.

## ✨ Features

- **Image to 3D** - Convert single images to 3D models
- **Text to 3D** - Generate 3D models from text descriptions
- **Multi-view to 3D** - Create models from multiple angle photos
- **Doodle to 3D** - Transform sketches into 3D objects
- **Advanced Options** - HD textures, PBR materials, rigging, low-poly optimization

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion, Three.js
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **3D Engine**: Tripo3D API
- **Payments**: Stripe
- **Email**: Resend
- **i18n**: next-intl (English & Chinese)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Configure your API keys in .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Configuration

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed configuration instructions.

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Tripo3D
TRIPO3D_API_KEY=

# Resend
RESEND_API_KEY=
EMAIL_FROM=
```

## 📦 Project Structure

```
src/
├── app/
│   ├── [locale]/          # i18n pages
│   │   ├── create/        # 3D generation page
│   │   ├── dashboard/     # User dashboard
│   │   ├── demo/          # Demo showcase
│   │   └── ...
│   └── api/               # API routes
│       ├── generate/      # 3D generation API
│       ├── webhooks/      # Stripe webhooks
│       └── ...
├── components/            # React components
├── lib/                   # Utilities & services
│   ├── tripo3d/          # Tripo3D API service
│   ├── stripe/           # Stripe service
│   ├── credits/          # Credits system
│   └── ...
└── messages/             # i18n translations
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/morphix-ai)

## 💰 Credits System

| Generation Type | Credits |
|----------------|---------|
| Image to 3D (Standard) | 10 |
| Image to 3D (High) | 15 |
| Image to 3D (Ultra) | 25 |
| Text to 3D | 10 |
| Multi-view to 3D | 15 |
| Doodle to 3D | 10 |

### Advanced Options (Additional)
- HD Texture: +5
- PBR Material: +3
- Rigging: +10
- Low-poly: +3
- Part Segment: +5

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.
