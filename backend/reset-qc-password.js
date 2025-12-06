const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetQCPassword() {
    const password = 'quality123';
    console.log(`Resetting QC password to: ${password}`);

    const hash = await bcrypt.hash(password, 10);
    console.log('Generated hash:', hash);

    // Update the QC user password
    try {
        const user = await prisma.user.update({
            where: { email: 'qc@cuptrace.rw' },
            data: { password: hash },
        });
        console.log('Successfully updated password for user:', user.email);

        // Verify immediately
        const verify = await bcrypt.compare(password, hash);
        console.log('Verification check:', verify);

    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetQCPassword().catch(console.error);
