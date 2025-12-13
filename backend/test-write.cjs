const fs = require('fs');
console.log('Starting write test...');
try {
    fs.writeFileSync('write_test.txt', 'Hello World');
    console.log('Write successful');
} catch (e) {
    console.error('Write failed:', e);
}
