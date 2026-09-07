# TraceFace Web 🔍

**Discover. Verify. Prove.**

A beautiful Next.js frontend for the TraceFace Face Identification & Blockchain Verification platform. Built for HH Goa 2026 Shortlisting Task 3.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add SERPAPI_KEY
vercel env add RPC_URL
vercel env add PRIVATE_KEY
vercel env add CONTRACT_ADDRESS
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for automatic deployments.

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SERPAPI_KEY` | No | SerpAPI key for real reverse image search |
| `RPC_URL` | No | Blockchain RPC endpoint |
| `PRIVATE_KEY` | No | Wallet private key for blockchain transactions |
| `CONTRACT_ADDRESS` | No | Deployed EvidenceRegistry contract address |

Without API keys, the app runs in **demo mode** with clearly labeled synthetic results.

## 🎨 Design

- **Theme**: Dark cyber-forensics (deep greens, electric accents)
- **Fonts**: Space Grotesk + JetBrains Mono
- **Animations**: Framer Motion (scroll reveals, staggered text, magnetic buttons)
- **Effects**: Glassmorphism, noise overlay, gradient borders

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main page
│   ├── globals.css         # Global styles
│   └── api/
│       ├── search/route.ts # Reverse image search API
│       └── blockchain/route.ts # Blockchain registration API
├── components/
│   ├── Navbar.tsx          # Navigation bar
│   ├── Hero.tsx            # Hero section with animations
│   ├── Marquee.tsx         # Infinite scrolling marquee
│   ├── Pipeline.tsx        # Investigation pipeline UI
│   ├── HowItWorks.tsx      # How it works section
│   ├── Footer.tsx          # Footer with disclaimer
│   └── ui/
│       ├── Reveal.tsx      # Scroll-reveal animation
│       ├── SplitText.tsx   # Animated text splitting
│       ├── MagneticButton.tsx # Magnetic hover button
│       └── NoiseOverlay.tsx # Film grain overlay
└── lib/
    └── utils.ts            # Hashing, canonical JSON, UUID
```

## 🔗 Related

- `task 3/traceface/` — Python backend with InsightFace, Web3.py, and Streamlit dashboard
