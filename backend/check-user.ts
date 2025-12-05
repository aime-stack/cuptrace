import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkUser() {
    const email = 'jean.farmer@cuptrace.rw';
    const password = 'farmer123';

    console.log(`Checking user: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('❌ User NOT found in database!');
            return;
        }

        console.log('✅ User found:', user.id, user.name, user.role);
        console.log('Stored hash:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log('✅ Password matches!');
        } else {
            console.log('❌ Password does NOT match!');

            // Generate new hash for debugging
            const newHash = await bcrypt.hash(password, 10);
            console.log('Expected hash for "farmer123":', newHash);
        }

    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
