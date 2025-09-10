# Token Launchpad

A modern, decentralized token launchpad built on Solana blockchain using Next.js and the Meteora Dynamic Bonding Curve SDK. This platform allows users to create and launch new tokens with advanced bonding curve mechanics, providing a seamless experience for token creators and traders.

## 🚀 Features

- **Token Creation**: Create new SPL tokens with custom metadata and images
- **Dynamic Bonding Curves**: Advanced bonding curve mechanics for price discovery
- **Wallet Integration**: Full Solana wallet support with multiple wallet providers
- **Pool Management**: View and manage your created token pools
- **Modern UI**: Beautiful light dark theme with responsive design
- **Real-time Updates**: Live pool data and transaction status
- **Image Proxy**: Secure image loading with proxy support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Custom CSS Variables
- **Blockchain**: Solana Web3.js, SPL Token
- **SDK**: Meteora Dynamic Bonding Curve SDK
- **Wallet**: Solana Wallet Adapter
- **UI Components**: Lucide React, Sonner (toasts)
- **Build Tool**: Turbopack

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Solana wallet (Phantom, Solflare, etc.)

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd launch
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🎨 Theme

The application features a modern **light dark theme** with:
- Soft slate backgrounds for reduced eye strain
- Subtle blue tints for a professional appearance
- High contrast text for excellent readability
- Responsive design that works on all devices

## 🔧 Configuration

### Bonding Curve Configuration

The platform uses a sophisticated bonding curve configuration that can be customized for different token launches:

```typescript
const curveConfig = buildCurveWithMarketCap({
  // Token Supply Configuration
  totalTokenSupply: 1000000000,           // Total supply: 1 billion tokens
  initialMarketCap: 30,                   // Initial market cap: $30
  migrationMarketCap: 540,                // Migration market cap: $540
  
  // Migration Settings
  migrationOption: MigrationOption.MET_DAMM_V2,
  tokenBaseDecimal: TokenDecimal.SIX,     // Token decimals: 6
  tokenQuoteDecimal: TokenDecimal.NINE,   // Quote token decimals: 9
  
  // Vesting Configuration
  lockedVestingParam: {
    totalLockedVestingAmount: 0,          // No locked vesting
    numberOfVestingPeriod: 0,
    cliffUnlockAmount: 0,
    totalVestingDuration: 0,
    cliffDurationFromMigrationTime: 0,
  },
  
  // Fee Configuration
  baseFeeParams: {
    baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
    feeSchedulerParam: {
      startingFeeBps: 100,                // Starting fee: 1%
      endingFeeBps: 100,                  // Ending fee: 1%
      numberOfPeriod: 0,
      totalDuration: 0,
    },
  },
  
  // Advanced Settings
  dynamicFeeEnabled: true,                // Dynamic fees enabled
  activationType: ActivationType.Slot,    // Slot-based activation
  collectFeeMode: 0,
  migrationFeeOption: MigrationFeeOption.FixedBps100,
  tokenType: TokenType.SPL,               // SPL token type
  
  // Liquidity Provider Configuration
  partnerLpPercentage: 0,                 // Partner LP: 0%
  creatorLpPercentage: 0,                 // Creator LP: 0%
  partnerLockedLpPercentage: 50,          // Partner locked LP: 50%
  creatorLockedLpPercentage: 50,          // Creator locked LP: 50%
  creatorTradingFeePercentage: 50,        // Creator trading fee: 50%
  leftover: 0,
  
  // Token Authority
  tokenUpdateAuthority: TokenUpdateAuthorityOption.Immutable,
  
  // Migration Fees
  migrationFee: {
    feePercentage: 0,                     // Migration fee: 0%
    creatorFeePercentage: 0,              // Creator fee: 0%
  },
});
```

### Configuration Parameters Explained

#### Token Supply
- **totalTokenSupply**: Total number of tokens to be minted
- **initialMarketCap**: Starting market capitalization in USD
- **migrationMarketCap**: Market cap threshold for migration to DEX

#### Decimals
- **tokenBaseDecimal**: Number of decimal places for the token (6 = 1,000,000 base units)
- **tokenQuoteDecimal**: Number of decimal places for the quote token (9 = 1,000,000,000 base units)

#### Fee Structure
- **startingFeeBps**: Initial trading fee in basis points (100 = 1%)
- **endingFeeBps**: Final trading fee in basis points
- **dynamicFeeEnabled**: Whether fees change over time

#### Liquidity Provider Settings
- **partnerLpPercentage**: Percentage of liquidity provided by partners
- **creatorLpPercentage**: Percentage of liquidity provided by creators
- **partnerLockedLpPercentage**: Percentage of partner LP that's locked
- **creatorLockedLpPercentage**: Percentage of creator LP that's locked

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── image-proxy/        # Image proxy endpoint
│   │   └── pools/             # Pool data endpoint
│   ├── components/            # Reusable UI components
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   └── index.ts
│   ├── context/               # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── create-token.tsx       # Token creation component
│   ├── pools.tsx             # Pool management component
│   ├── page.tsx              # Main page component
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
└── lib/
    └── utils.ts              # Utility functions
```

## 🔌 API Endpoints

### Image Proxy
- **Endpoint**: `/api/image-proxy`
- **Purpose**: Secure image loading with CORS handling
- **Parameters**: `url` - The image URL to proxy

### Pools Data
- **Endpoint**: `/api/pools`
- **Purpose**: Fetch pool data from the blockchain
- **Parameters**: `config` - Configuration address

## 🎯 Usage

### Creating a Token

1. **Connect Wallet**: Click the wallet button to connect your Solana wallet
2. **Fill Token Details**: 
   - Enter token name (e.g., "My Token")
   - Enter token symbol (e.g., "MTK")
   - Provide token image URL
3. **Preview**: Review your token details in the preview section
4. **Create**: Click "Create Token" to deploy your token with the bonding curve

### Managing Pools

- View all your created pools on the main page
- Each pool shows:
  - Token name and symbol
  - Base and quote supply
  - Migration status
  - Pool address
- Use "View Details" and "Trade" buttons for pool interactions

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
# Add your environment variables here
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_CONFIG_ADDRESS=AdQWsu7ittQwDqr1aaBHDndisLUksGZMieM3krVU4XRZ
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Documentation](https://docs.solana.com/)
- [Meteora SDK Documentation](https://docs.meteora.ag/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

Built with ❤️ using Next.js and Solana