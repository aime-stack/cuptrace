// Stub for bitcoinjs-lib to avoid bip174 export issues
// This provides minimal exports that satisfy the imports
// Since we only use Cardano, Bitcoin functionality is not needed

const Psbt = class {};
const Transaction = class {};
const address = {};
const networks = {};
const payments = {};
const script = {};

const bitcoinjsLib = {
  Psbt,
  Transaction,
  address,
  networks,
  payments,
  script,
};

// Support both ESM and CommonJS
export { Psbt, Transaction, address, networks, payments, script };
export default bitcoinjsLib;

// CommonJS fallback
if (typeof module !== 'undefined' && module.exports) {
  module.exports = bitcoinjsLib;
  module.exports.Psbt = Psbt;
  module.exports.Transaction = Transaction;
  module.exports.address = address;
  module.exports.networks = networks;
  module.exports.payments = payments;
  module.exports.script = script;
}

