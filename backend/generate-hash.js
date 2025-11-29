const bcrypt = require('bcrypt');
const fs = require('fs');

async function generateHash() {
    try {
        const password = 'farmer123';
        const hash = await bcrypt.hash(password, 10);
        fs.writeFileSync('hash.txt', hash);
        console.log('Hash written to hash.txt');
    } catch (err) {
        console.error(err);
    }
}

generateHash();
