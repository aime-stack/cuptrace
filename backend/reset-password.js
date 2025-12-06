const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
    const password = 'agent123';
    const hash = await bcrypt.hash(password, 10);

    console.log('Generated hash:', hash);
    console.log('Hash length:', hash.length);

    // Update the agent user password
    const user = await prisma.user.update({
        where: { email: 'agent.huye@cuptrace.rw' },
        data: { password: hash },
    });

    console.log('Updated user:', user.email);

    // Verify it works
    const verify = await bcrypt.compare(password, hash);
    console.log('Verification test:', verify);

    await prisma.$disconnect();
}

resetPassword().catch(console.error);
