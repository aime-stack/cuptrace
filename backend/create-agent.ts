import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting agent creation...');

    const hashedPassword = await bcrypt.hash('agent123', 10);
    console.log('Password hashed');

    const coop = await prisma.cooperative.findFirst();
    console.log('Cooperative found:', coop?.name || 'None');

    const user = await prisma.user.upsert({
        where: { email: 'agent.huye@cuptrace.rw' },
        update: { password: hashedPassword },
        create: {
            name: 'Jean Claude Agent',
            email: 'agent.huye@cuptrace.rw',
            password: hashedPassword,
            role: 'agent',
            phone: '+250788555555',
            country: 'Rwanda',
            city: 'Huye',
            province: 'Southern Province',
            cooperativeId: coop?.id,
            isActive: true,
        },
    });
    console.log('Agent created/updated:', user.email, user.role);

    await prisma.$disconnect();
    console.log('Done!');
}
main().catch(e => {
    console.error('Error:', e);
    process.exit(1);
});
