import { Data } from 'lucid-cardano';
const Constr = (Data as any).Constr;

// ==========================================
// Schema Definitions (Matching Aiken Types)
// ==========================================

export enum ProductType {
    Coffee = 0,
    Tea = 1,
}

export enum Stage {
    Farmer = 0,
    WashingStation = 1,
    Factory = 2,
    Exporter = 3,
    Importer = 4,
    Retailer = 5,
}

// ==========================================
// Helpers
// ==========================================

/**
 * Convert value to Plutus Option
 * Aiken: type Option<a> { Some(a), None }
 * Some = Constr(0, [val]), None = Constr(1, [])
 */
const toOption = (val: Data | undefined | null): Data => {
    return val !== undefined && val !== null
        ? new Constr(0, [val])
        : new Constr(1, []);
};

// ==========================================
// Datum Builders
// ==========================================

export interface BatchStateParams {
    batchId: string;        // Hex
    productType: ProductType;
    currentStage: Stage;
    originLocation: string; // Hex (or Utf8 converted to Hex)
    quantity: number;
    farmerId?: string;      // Hex
    createdAt: number;
    lastUpdated: number;
    currentHandler: string; // Hex (PKH)
    metadataCid?: string;   // Hex
}

/**
 * Builds BatchState Datum
 * Schema:
 * BatchState {
 *   batch_id: ByteArray,       (0)
 *   product_type: ProductType, (1)
 *   current_stage: Stage,      (2)
 *   origin_location: ByteArray,(3)
 *   quantity: Int,             (4)
 *   farmer_id: Option<ByteArray>, (5)
 *   created_at: Int,           (6)
 *   last_updated: Int,         (7)
 *   current_handler: ByteArray,(8)
 *   metadata_cid: Option<ByteArray> (9)
 * }
 */
export const buildBatchState = (params: BatchStateParams): Data => {
    return new Constr(0, [
        params.batchId,
        BigInt(params.productType), // Constr index for enum? No, Enum is usually Constr(index, [])
        // Wait! Aiken Enums with NO fields are just Integers? OR Constr(index, [])?
        // In Plutus Core, Enum variants are Constr(index, []).
        // Let's verify Aiken behavior.
        // Zero-arg constructors are optimized to Integers ONLY if `no-tag-optimization` is NOT used?
        // Aiken v1 defaults: `data` feature.
        // Standard Plutus Data for Enums: Constr(i, []).
        new Constr(params.productType, []), // ProductType
        new Constr(params.currentStage, []), // Stage
        params.originLocation,
        BigInt(params.quantity),
        toOption(params.farmerId),
        BigInt(params.createdAt),
        BigInt(params.lastUpdated),
        params.currentHandler,
        toOption(params.metadataCid),
    ]);
};

// ==========================================
// Redeemer Builders
// ==========================================

export interface CreateBatchParams {
    batchId: string;
    productType: ProductType;
    originLocation: string;
    farmerId?: string;
    quantity: number;
    timestamp: number;
    creatorPkh: string;
    initialCid?: string;
}

/**
 * Builds CreateBatch Redeemer
 * Index: 0
 * Schema:
 * CreateBatch {
 *   batch_id, (0)
 *   product_type, (1)
 *   origin, (2)
 *   farmer, (3)
 *   qty, (4)
 *   time, (5)
 *   creator, (6)
 *   cid (7)
 * }
 */
export const buildCreateBatchRedeemer = (params: CreateBatchParams): Data => {
    return new Constr(0, [
        params.batchId,
        new Constr(params.productType, []),
        params.originLocation,
        toOption(params.farmerId),
        BigInt(params.quantity),
        BigInt(params.timestamp),
        params.creatorPkh,
        toOption(params.initialCid),
    ]);
};

export interface UpdateStageParams {
    toStage: Stage;
    changedBy: string; // Hex (PKH?) - field name is `changed_by`
    quantity?: number;
    metadata?: string; // Option<ByteArray> - legacy field
    timestamp: number;
    nextHandler: string;
    newCid?: string;
}

/**
 * Builds UpdateStage Redeemer
 * Index: 1
 * Schema:
 * UpdateStage {
 *   to_stage, (0)
 *   changed_by, (1)
 *   quantity, (2) (Option<Int>)
 *   metadata, (3) (Option<ByteArray>)
 *   timestamp, (4)
 *   next_handler, (5)
 *   new_cid (6)
 * }
 */
export const buildUpdateStageRedeemer = (params: UpdateStageParams): Data => {
    return new Constr(1, [
        new Constr(params.toStage, []),
        params.changedBy,
        toOption(params.quantity ? BigInt(params.quantity) : null), // Check logic: if 0? 0 is falsy.
        // quantity is Option<Int>. If we pass 0, we mean Some(0)? Or ignore?
        // Params optional `quantity?: number`. If undefined -> None.
        toOption(params.metadata),
        BigInt(params.timestamp),
        params.nextHandler,
        toOption(params.newCid),
    ]);
};

export interface MintBasicParams {
    batchId: string;
}

/**
 * Builds Mint Redeemer (batch_nft)
 * Index: 0
 * Mint { batch_id }
 */
export const buildMintRedeemer = (params: MintBasicParams): Data => {
    return new Constr(0, [
        params.batchId
    ]);
};
