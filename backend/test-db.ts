import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

async function main() {
    console.log('🔍 Environment Diagnostic:');
    console.log('----------------------------------------');

    // 1. Check Initial Environment (Shell/System)
    const initialUrl = process.env.DATABASE_URL;
    console.log('1. Initial process.env.DATABASE_URL (likely from Shell):');
    console.log(`   ${initialUrl ? initialUrl.replace(/:[^:@]*@/, ':****@') : 'undefined'}`);

    // 2. Load .env with Override
    console.log('\n2. Loading .env file with override...');
    const result = dotenv.config({ path: path.join(process.cwd(), '.env'), override: true });

    if (result.error) {
        console.error('❌ Failed to load .env file:', result.error);
    } else {
        console.log('✅ .env file loaded successfully');
    }

    const newUrl = process.env.DATABASE_URL;
    console.log('3. DATABASE_URL after .env load:');
    console.log(`   ${newUrl ? newUrl.replace(/:[^:@]*@/, ':****@') : 'undefined'}`);

    if (initialUrl && initialUrl !== newUrl) {
        console.log('\n⚠️  WARNING: Shell environment variable was shadowing .env file!');
        console.log('   The application was using the stale shell variable instead of the file.');
    }

    if (!newUrl) {
        console.error('❌ DATABASE_URL is missing!');
        process.exit(1);
    }

    console.log('\n🔄 Testing connection with CURRENT URL...');

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: newUrl
            }
        },
        log: ['info', 'warn', 'error'],
    });

    try {
        const start = Date.now();
        await prisma.$connect();
        const duration = Date.now() - start;
        console.log(`✅ Successfully connected in ${duration}ms`);

        const count = await prisma.user.count();
        console.log(`📊 Validated query: Found ${count} users`);

    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
