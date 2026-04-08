const bcrypt = require('bcrypt');

async function test() {
  const password = 'changeme123';
  const hash = '$2b$10$A89FzyJoQ/R/f9qd57R/peMGpW1rWeO2Oke3gv/7j4cB1uVR5.8n6';
  const isValid = await bcrypt.compare(password, hash);
  console.log('Password valid:', isValid);
}

test();