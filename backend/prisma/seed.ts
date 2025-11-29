import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create cooperatives
    console.log('Creating cooperatives...');
    const cooperative1 = await prisma.cooperative.upsert({
        where: { name: 'Huye Coffee Cooperative' },
        update: {},
        create: {
            name: 'Huye Coffee Cooperative',
            location: 'Huye District, Southern Province',
            description: 'Leading coffee cooperative in Southern Rwanda',
        },
    });

    const cooperative2 = await prisma.cooperative.upsert({
        where: { name: 'Musasa Tea Growers' },
        update: {},
        create: {
            name: 'Musasa Tea Growers',
            location: 'Musanze District, Northern Province',
            description: 'Premium tea producers in Northern Rwanda',
        },
    });

    console.log('✅ Cooperatives created');

    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@cuptrace.rw' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@cuptrace.rw',
            password: adminPassword,
            role: 'admin',
            phone: '+250788000000',
            country: 'Rwanda',
            city: 'Kigali',
            province: 'Kigali City',
        },
    });

    console.log('✅ Admin user created (email: admin@cuptrace.rw, password: admin123)');

    // Create farmer users
    console.log('Creating farmer users...');
    const farmerPassword = await bcrypt.hash('farmer123', 10);

    const farmer1 = await prisma.user.upsert({
        where: { email: 'jean.farmer@cuptrace.rw' },
        update: {},
        create: {
            name: 'Jean Uwimana',
            email: 'jean.farmer@cuptrace.rw',
            password: farmerPassword,
            role: 'farmer',
            phone: '+250788111111',
            country: 'Rwanda',
            city: 'Huye',
            province: 'Southern Province',
            cooperativeId: cooperative1.id,
        },
    });

    const farmer2 = await prisma.user.upsert({
        where: { email: 'marie.farmer@cuptrace.rw' },
        update: {},
        create: {
            name: 'Marie Mukamana',
            email: 'marie.farmer@cuptrace.rw',
            password: farmerPassword,
            role: 'farmer',
            phone: '+250788222222',
            country: 'Rwanda',
            city: 'Musanze',
            province: 'Northern Province',
            cooperativeId: cooperative2.id,
        },
    });

    console.log('✅ Farmer users created (password: farmer123)');

    // Create washing station user
    console.log('Creating washing station user...');
    const wsPassword = await bcrypt.hash('station123', 10);
    const washingStation = await prisma.user.upsert({
        where: { email: 'huye.station@cuptrace.rw' },
        update: {},
        create: {
            name: 'Huye Washing Station',
            email: 'huye.station@cuptrace.rw',
            password: wsPassword,
            role: 'ws',
            phone: '+250788333333',
            country: 'Rwanda',
            city: 'Huye',
            province: 'Southern Province',
        },
    });

    console.log('✅ Washing station user created (email: huye.station@cuptrace.rw, password: station123)');

    // Create exporter user
    console.log('Creating exporter user...');
    const exporterPassword = await bcrypt.hash('exporter123', 10);
    const exporter = await prisma.user.upsert({
        where: { email: 'rwanda.exports@cuptrace.rw' },
        update: {},
        create: {
            name: 'Rwanda Coffee Exports Ltd',
            email: 'rwanda.exports@cuptrace.rw',
            password: exporterPassword,
            role: 'exporter',
            phone: '+250788444444',
            country: 'Rwanda',
            city: 'Kigali',
            province: 'Kigali City',
        },
    });

    console.log('✅ Exporter user created (email: rwanda.exports@cuptrace.rw, password: exporter123)');

    // Create sample coffee batches
    console.log('Creating sample coffee batches...');

    const batch1 = await prisma.productBatch.create({
        data: {
            type: 'coffee',
            status: 'pending',
            currentStage: 'farmer',
            originLocation: 'Huye District',
            region: 'Southern Province',
            district: 'Huye',
            sector: 'Tumba',
            lotId: 'HYE-2025-001',
            quantity: 500,
            quality: 'A',
            moisture: 11.5,
            harvestDate: new Date('2025-01-15'),
            processingType: 'washed',
            grade: 'AA',
            description: 'Premium Bourbon coffee from high altitude farms',
            tags: ['organic', 'high-altitude', 'bourbon'],
            farmerId: farmer1.id,
            cooperativeId: cooperative1.id,
        },
    });

    const batch2 = await prisma.productBatch.create({
        data: {
            type: 'coffee',
            status: 'approved',
            currentStage: 'washing_station',
            originLocation: 'Huye District',
            region: 'Southern Province',
            district: 'Huye',
            sector: 'Ngoma',
            lotId: 'HYE-2025-002',
            quantity: 750,
            quality: 'A',
            moisture: 12.0,
            harvestDate: new Date('2025-01-10'),
            processingType: 'washed',
            grade: 'A',
            description: 'High-quality Arabica coffee',
            tags: ['arabica', 'washed'],
            farmerId: farmer1.id,
            cooperativeId: cooperative1.id,
            washingStationId: washingStation.id,
        },
    });

    // Create sample tea batch
    const batch3 = await prisma.productBatch.create({
        data: {
            type: 'tea',
            status: 'pending',
            currentStage: 'farmer',
            originLocation: 'Musanze District',
            region: 'Northern Province',
            district: 'Musanze',
            lotId: 'MSZ-2025-001',
            quantity: 1000,
            quality: 'Premium',
            pluckingDate: new Date('2025-01-20'),
            teaType: 'CTC',
            description: 'Fresh CTC tea leaves',
            tags: ['ctc', 'premium'],
            farmerId: farmer2.id,
            cooperativeId: cooperative2.id,
        },
    });

    console.log('✅ Sample batches created');

    // Create batch history
    console.log('Creating batch history...');
    await prisma.batchHistory.create({
        data: {
            batchId: batch1.id,
            stage: 'farmer',
            changedBy: farmer1.id,
            notes: 'Batch registered by farmer',
            quantity: 500,
            quality: 'A',
            location: 'Huye District',
        },
    });

    await prisma.batchHistory.createMany({
        data: [
            {
                batchId: batch2.id,
                stage: 'farmer',
                changedBy: farmer1.id,
                notes: 'Batch registered by farmer',
                quantity: 750,
                quality: 'A',
                location: 'Huye District',
            },
            {
                batchId: batch2.id,
                stage: 'washing_station',
                changedBy: washingStation.id,
                notes: 'Received at washing station for processing',
                quantity: 750,
                quality: 'A',
                location: 'Huye Washing Station',
            },
        ],
    });

    console.log('✅ Batch history created');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@cuptrace.rw');
    console.log('  Password: admin123');
    console.log('\nFarmer 1:');
    console.log('  Email: jean.farmer@cuptrace.rw');
    console.log('  Password: farmer123');
    console.log('\nFarmer 2:');
    console.log('  Email: marie.farmer@cuptrace.rw');
    console.log('  Password: farmer123');
    console.log('\nWashing Station:');
    console.log('  Email: huye.station@cuptrace.rw');
    console.log('  Password: station123');
    console.log('\nExporter:');
    console.log('  Email: rwanda.exports@cuptrace.rw');
    console.log('  Password: exporter123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
