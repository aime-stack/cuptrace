
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@cuptrace.rw';
    const newPassword = 'admin123';

    console.log(`Resetting password for ${email}...`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
        where: { email },
        data: {
            password: hashedPassword,
        },
    });

    console.log(`Password reset successful for user: ${user.email}`);
    console.log(`New password: ${newPassword}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
