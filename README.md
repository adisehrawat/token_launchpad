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
git clone <https://github.com/adisehrawat/token_launchpad.git>
cd token_launchpad
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



## 🔧 Configuration

### Bonding Curve Configuration

Curve Address :-

```
configAddress = "AdQWsu7ittQwDqr1aaBHDndisLUksGZMieM3krVU4XRZ"
```

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
        └── route.ts           # Create token endpoint
│   ├── components/            # Reusable UI components
│   │   ├── AlertCircle.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   └── Loader2.ts
│   │   └── index.ts
│   ├── context/               # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── create-token.tsx       # Token creation component
│   ├── pools.tsx             # Pool management component
│   ├── page.tsx              # Main page component
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
```

## 🔌 API Endpoints

### Token Creation (POST)
- **Endpoint**: `/api`
- **Method**: `POST`
- **Purpose**: Create a new token with bonding curve configuration
- **Request Body**:
  ```json
  {
    "name": "Token Name",
    "symbol": "SYMBOL",
    "walletAddress": "wallet_public_key",
    "uri": "https://example.com/token-metadata.json"
  }
  ```
- **Response**: Returns base64-encoded transaction for wallet signing


### Image Proxy
- **Endpoint**: `/api/image-proxy`
- **Method**: `GET`
- **Purpose**: Secure image loading with CORS handling
- **Parameters**: `url` - The image URL to proxy
- **Example**: `/api/image-proxy?url=https://example.com/image.png`

### Pools Data
- **Endpoint**: `/api/pools`
- **Method**: `GET`
- **Purpose**: Fetch pool data from the blockchain
- **Parameters**: `config` - Configuration address
- **Example**: `/api/pools?config=AdQWsu7ittQwDqr1aaBHDndisLUksGZMieM3krVU4XRZ`

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


## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint


Built with ❤️ using Next.js and Solana