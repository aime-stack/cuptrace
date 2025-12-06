const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAgent() {
    try {
        const hashedPassword = await bcrypt.hash('agent123', 10);
        const coop = await prisma.cooperative.findFirst();
        console.log('Found cooperative:', coop?.name || 'None');

        const user = await prisma.user.upsert({
            where: { email: 'agent.huye@cuptrace.rw' },
            update: { password: hashedPassword },
            create: {
                name: 'Jean Claude (Agent)',
                email: 'agent.huye@cuptrace.rw',
                password: hashedPassword,
                role: 'agent',
                phone: '+250788555555',
                country: 'Rwanda',
                city: 'Huye',
                province: 'Southern Province',
                cooperativeId: coop?.id,
            },
        });
        console.log('Agent created/updated:', user.email);
        console.log('Password hash:', hashedPassword);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}
createAgent();
