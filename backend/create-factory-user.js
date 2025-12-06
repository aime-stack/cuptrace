const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createFactoryUser() {
    console.log('Creating Factory User...');

    const password = 'factory123';
    const hash = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email: 'factory@cuptrace.rw' },
            update: {
                password: hash,
                role: 'factory',
                isActive: true,
            },
            create: {
                id: 'usr-factory-001',
                name: 'Kigali Coffee Factory',
                email: 'factory@cuptrace.rw',
                password: hash,
                role: 'factory',
                phone: '+250788777777',
                city: 'Kigali',
                province: 'Kigali City',
                country: 'Rwanda',
                isActive: true,
            },
        });

        console.log('Factory user created/updated successfully!');
        console.log('Email: factory@cuptrace.rw');
        console.log('Password: factory123');
        console.log('Role:', user.role);

    } catch (error) {
        console.error('Error creating factory user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createFactoryUser().catch(console.error);
