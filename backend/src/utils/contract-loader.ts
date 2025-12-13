/**
 * Contract Loader Utility
 * 
 * Loads Aiken-compiled contracts from plutus.json and extracts policy IDs and addresses.
 * Provides functions to load contract scripts and get contract information.
 */

import { readFileSync, existsSync } from 'fs';
import { join as pathJoin } from 'path';
import { createHash } from 'crypto';

interface PlutusBlueprint {
  preamble: {
    title: string;
    version: string;
    plutusVersion: string;
    compiler: {
      name: string;
      version: string;
    };
  };
  validators: Array<{
    title: string;
    compiledCode: string;
    hash: string;
    datum?: {
      title: string;
      schema: unknown;
    };
    redeemer?: {
      title: string;
      schema: unknown;
    };
  }>;
  definitions?: {
    [key: string]: {
      compiledCode: string;
      hash: string;
    };
  };
}

interface ContractInfo {
  name: string;
  compiledCode: string;
  hash: string;
  policyId?: string;
  address?: string;
}

export const loadPlutusBlueprint = (): PlutusBlueprint | null => {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      pathJoin(process.cwd(), 'contracts', 'plutus.json'), // From backend root
      pathJoin(process.cwd(), '..', 'contracts', 'plutus.json'), // From backend/scripts
      // Robust Fallback
      'C:\\Users\\user\\Videos\\cuptrace\\backend\\contracts\\plutus.json'
    ];

    let blueprintPath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        blueprintPath = path;
        break;
      }
    }

    if (!blueprintPath) {
      console.error('Could not find plutus.json in any of these locations:');
      possiblePaths.forEach(p => console.error(`  - ${p}`));
      return null;
    }

    const blueprintContent = readFileSync(blueprintPath, 'utf-8');
    return JSON.parse(blueprintContent) as PlutusBlueprint;
  } catch (error) {
    console.error('Failed to load plutus.json:', error);
    return null;
  }
};

/**
 * Get contract by name from blueprint
 */
export const getContractByName = (name: string): ContractInfo | null => {
  const blueprint = loadPlutusBlueprint();
  if (!blueprint) {
    return null;
  }

  // Check validators
  const validator = blueprint.validators.find((v) => v.title === name);
  if (validator) {
    return {
      name: validator.title,
      compiledCode: validator.compiledCode,
      hash: validator.hash,
    };
  }

  // Check definitions (for minting policies)
  if (blueprint.definitions) {
    const definition = blueprint.definitions[name];
    if (definition) {
      return {
        name,
        compiledCode: definition.compiledCode,
        hash: definition.hash,
      };
    }
  }

  return null;
};

/**
 * Calculate policy ID from compiled contract code
 * Policy ID is the first 56 characters of the hash of the compiled code
 */
export const calculatePolicyId = (compiledCode: string): string => {
  const hash = createHash('sha256')
    .update(Buffer.from(compiledCode, 'hex'))
    .digest('hex');
  return hash.substring(0, 56);
};

/**
 * Get NFT minting policy contract
 */
export const getNFTMintingPolicy = (): ContractInfo | null => {
  // Try different possible names for the NFT minting policy
  const contract = getContractByName('batch_nft.batch_nft.mint')
    || getContractByName('batch_nft')
    || getContractByName('cuptrace/policies/batch_nft')
    || getContractByName('cuptrace/validators/batch_nft');

  if (!contract) {
    return null;
  }

  const policyId = calculatePolicyId(contract.compiledCode);
  return {
    ...contract,
    policyId,
  };
};

/**
 * Get batch traceability validator contract
 */
export const getBatchTraceabilityValidator = (): ContractInfo | null => {
  // Try different possible names for the batch traceability validator
  const contract = getContractByName('batch_traceability.batch_traceability.spend')
    || getContractByName('batch_traceability')
    || getContractByName('cuptrace/validators/batch_traceability');

  if (!contract) {
    return null;
  }

  return contract;
};

/**
 * Get stage transition validator contract
 */
export const getStageTransitionValidator = (): ContractInfo | null => {
  // Try different possible names for the stage transition validator
  const contract = getContractByName('stage_transition.stage_transition.spend')
    || getContractByName('stage_transition')
    || getContractByName('cuptrace/validators/stage_transition');

  if (!contract) {
    return null;
  }

  return contract;
};

/**
 * Load contract script from file system (fallback if not in blueprint)
 */
export const loadContractFromFile = async (contractPath: string): Promise<string | null> => {
  try {
    const fullPath = pathJoin(process.cwd(), 'contracts', 'build', contractPath);
    const contractScript = readFileSync(fullPath, 'utf-8');

    // If it's JSON, parse it
    if (contractPath.endsWith('.json')) {
      const parsed = JSON.parse(contractScript);
      return parsed.compiledCode || parsed.cborHex || contractScript;
    }

    // Otherwise return as hex
    return contractScript.trim();
  } catch (error) {
    console.error(`Failed to load contract from file ${contractPath}:`, error);
    return null;
  }
};

/**
 * Get all available contracts
 */
export const getAllContracts = (): ContractInfo[] => {
  const blueprint = loadPlutusBlueprint();
  if (!blueprint) {
    return [];
  }

  const contracts: ContractInfo[] = [];

  // Add validators
  blueprint.validators.forEach((validator) => {
    contracts.push({
      name: validator.title,
      compiledCode: validator.compiledCode,
      hash: validator.hash,
    });
  });

  // Add definitions (minting policies)
  if (blueprint.definitions) {
    Object.entries(blueprint.definitions).forEach(([name, definition]) => {
      const policyId = calculatePolicyId(definition.compiledCode);
      contracts.push({
        name,
        compiledCode: definition.compiledCode,
        hash: definition.hash,
        policyId,
      });
    });
  }

  return contracts;
};