const bcrypt = require('bcryptjs');

async function generate() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('\n========================================');
    console.log('YOUR NEW SECURE HASH:');
    console.log(hash);
    console.log('========================================\n');
}

generate();
