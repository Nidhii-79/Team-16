const bcrypt = require('bcryptjs');

const hashPassword = (plain) => bcrypt.hashSync(plain, 10);
const checkPassword = (plain, hash) => bcrypt.compareSync(plain, hash);

module.exports = { hashPassword, checkPassword };
