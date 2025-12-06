const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createDemoFarmers() {
    console.log('Creating demo farmers...');

    // Get the cooperative
    const coop = await prisma.cooperative.findFirst();
    if (!coop) {
        console.log('No cooperative found! Creating one...');
        const newCoop = await prisma.cooperative.create({
            data: {
                name: 'Huye Coffee Cooperative',
                location: 'Huye District, Southern Province',
                description: 'Premium coffee cooperative',
            }
        });
        console.log('Created cooperative:', newCoop.name);
    }

    const cooperative = await prisma.cooperative.findFirst();
    console.log('Using cooperative:', cooperative.name, cooperative.id);

    const password = await bcrypt.hash('farmer123', 10);

    const farmers = [
        {
            name: 'Marie Uwimana',
            email: 'marie.uwimana@cuptrace.rw',
            phone: '+250788100001',
            city: 'Huye',
            province: 'Southern Province',
        },
        {
            name: 'Jean Baptiste Habimana',
            email: 'jean.habimana@cuptrace.rw',
            phone: '+250788100002',
            city: 'Huye',
            province: 'Southern Province',
        },
        {
            name: 'Claudine Mukamana',
            email: 'claudine.mukamana@cuptrace.rw',
            phone: '+250788100003',
            city: 'Butare',
            province: 'Southern Province',
        },
        {
            name: 'Emmanuel Niyonzima',
            email: 'emmanuel.niyonzima@cuptrace.rw',
            phone: '+250788100004',
            city: 'Huye',
            province: 'Southern Province',
        },
        {
            name: 'Vestine Mukagatare',
            email: 'vestine.mukagatare@cuptrace.rw',
            phone: '+250788100005',
            city: 'Gisagara',
            province: 'Southern Province',
        },
    ];

    for (const farmer of farmers) {
        const user = await prisma.user.upsert({
            where: { email: farmer.email },
            update: {},
            create: {
                name: farmer.name,
                email: farmer.email,
                password: password,
                role: 'farmer',
                phone: farmer.phone,
                city: farmer.city,
                province: farmer.province,
                country: 'Rwanda',
                cooperativeId: cooperative.id,
                isActive: true,
            },
        });
        console.log('Created farmer:', user.name, '- ID:', user.id);
    }

    // Also update the agent to use the same cooperative
    await prisma.user.update({
        where: { email: 'agent.huye@cuptrace.rw' },
        data: { cooperativeId: cooperative.id },
    });
    console.log('Updated agent with cooperative ID');

    // List all farmers in the cooperative
    const allFarmers = await prisma.user.findMany({
        where: {
            role: 'farmer',
            cooperativeId: cooperative.id,
        },
        select: { id: true, name: true, email: true, city: true },
    });

    console.log('\n=== FARMERS IN COOPERATIVE ===');
    allFarmers.forEach(f => {
        console.log(`ID: ${f.id} | Name: ${f.name} | City: ${f.city}`);
    });

    await prisma.$disconnect();
    console.log('\nDone!');
}

createDemoFarmers().catch(console.error);
