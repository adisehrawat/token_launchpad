import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
} from '@solana/web3.js'
import fs from 'fs'
import path from 'path'
import {
    DynamicBondingCurveClient,
    ActivationType,
    CollectFeeMode,
    BaseFeeMode,
    MigrationFeeOption,
    MigrationOption,
    TokenDecimal,
    TokenType,
    TokenUpdateAuthorityOption,
    buildCurve,
    DammV2DynamicFeeMode,
} from '@meteora-ag/dynamic-bonding-curve-sdk'
import { NATIVE_MINT } from '@solana/spl-token'

export async function buildCurveAndCreateConfig(totalSuppy: number): Promise<PublicKey> {

    const keypairPath = path.resolve(process.cwd(), '../keypair.json')
    const secretKeyBytes = JSON.parse(fs.readFileSync(keypairPath, 'utf-8')) as number[]
    const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKeyBytes))
    console.log(`Using wallet: ${wallet.publicKey.toString()}`)

    const connection = new Connection(
        'https://api.devnet.solana.com',
        'confirmed'
    )

    const config = Keypair.generate()
    console.log(`Config account: ${config.publicKey.toString()}`)

    const curveConfig = buildCurve({
        totalTokenSupply: totalSuppy,
        percentageSupplyOnMigration: 10,
        migrationQuoteThreshold: 300,
        migrationOption: MigrationOption.MET_DAMM_V2,
        tokenBaseDecimal: TokenDecimal.SIX,
        tokenQuoteDecimal: TokenDecimal.NINE,
        lockedVestingParam: {
            totalLockedVestingAmount: 0,
            numberOfVestingPeriod: 0,
            cliffUnlockAmount: 0,
            totalVestingDuration: 0,
            cliffDurationFromMigrationTime: 0,
        },
        baseFeeParams: {
            baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
            feeSchedulerParam: {
                startingFeeBps: 100,
                endingFeeBps: 100,
                numberOfPeriod: 0,
                totalDuration: 0,
            },
        },
        dynamicFeeEnabled: true,
        activationType: ActivationType.Slot,
        collectFeeMode: CollectFeeMode.QuoteToken,
        migrationFeeOption: MigrationFeeOption.Customizable,
        tokenType: TokenType.SPL,
        partnerLpPercentage: 0,
        creatorLpPercentage: 0,
        partnerLockedLpPercentage: 100,
        creatorLockedLpPercentage: 0,
        creatorTradingFeePercentage: 0,
        leftover: 0,
        tokenUpdateAuthority: TokenUpdateAuthorityOption.Immutable,
        migrationFee: {
            feePercentage: 0,
            creatorFeePercentage: 0,
        },
        migratedPoolFee: {
            collectFeeMode: CollectFeeMode.QuoteToken,
            dynamicFee: DammV2DynamicFeeMode.Enabled,
            poolFeeBps: 250,
        },
    })
    

    console.log(curveConfig)

    try {
        const client = new DynamicBondingCurveClient(connection, 'confirmed')

        const transaction = await client.partner.createConfig({
            config: config.publicKey,
            feeClaimer: wallet.publicKey,
            leftoverReceiver: wallet.publicKey,
            payer: wallet.publicKey,
            quoteMint: NATIVE_MINT,
            ...curveConfig,
        })

        const { blockhash } = await connection.getLatestBlockhash('confirmed')
        
        transaction.recentBlockhash = blockhash
        transaction.feePayer = wallet.publicKey

        transaction.partialSign(config)

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [config, wallet],
            { commitment: 'confirmed' }
        )

        console.log(`Config created successfully!`)
        console.log(
            `Transaction: https://solscan.io/tx/${signature}`
        )
        console.log(`Config address: ${config.publicKey.toString()}`)
        return config.publicKey
    } catch (error) {
        console.error('Failed to create config:', error)
        throw error
    }
}
