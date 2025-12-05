import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting simple seed...');

    try {
        // Create cooperative first
        console.log('Creating cooperative...');
        const coop = await prisma.cooperative.upsert({
            where: { name: 'Huye Coffee Cooperative' },
            update: {},
            create: {
                name: 'Huye Coffee Cooperative',
                location: 'Huye District',
                description: 'Test Cooperative',
            },
        });
        console.log('✅ Cooperative created:', coop.id);

        // Create farmer user
        console.log('Creating farmer user...');
        const password = await bcrypt.hash('farmer123', 10);

        const user = await prisma.user.upsert({
            where: { email: 'jean.farmer@cuptrace.rw' },
            update: {
                password: password, // Update password just in case
            },
            create: {
                name: 'Jean Uwimana',
                email: 'jean.farmer@cuptrace.rw',
                password: password,
                role: 'farmer',
                country: 'Rwanda',
                cooperativeId: coop.id,
            },
        });

        console.log('✅ User created/updated:', user.email);
        console.log('✅ Password set to: farmer123');

    } catch (error) {
        console.error('❌ Error in simple seed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
