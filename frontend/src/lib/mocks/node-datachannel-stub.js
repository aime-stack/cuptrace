// Stub for node-datachannel to avoid native compilation issues
// This package is not needed for Cardano functionality

const nodeDatachannelStub = {};
export default nodeDatachannelStub;

// CommonJS fallback
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}

