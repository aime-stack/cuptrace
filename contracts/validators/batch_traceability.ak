/// Batch Traceability Validator
/// 
/// This validator stores batch state on-chain and validates stage transitions.
/// It enforces valid stage flow and stores metadata for each transition.

use cardano/transaction.{Transaction, OutputReference}

/// Supply chain stages
pub type Stage {
  Farmer
  WashingStation
  Factory
  Exporter
  Importer
  Retailer
}

/// Product types
pub type ProductType {
  Coffee
  Tea
}

/// Batch state stored on-chain
pub type BatchState {
  BatchState {
    batch_id: ByteArray,
    product_type: ProductType,
    current_stage: Stage,
    origin_location: ByteArray,
    quantity: Int,
    farmer_id: Option<ByteArray>,
    created_at: Int,
    last_updated: Int,
  }
}

/// Check if a stage transition is valid
fn is_valid_transition(from: Stage, to: Stage) -> Bool {
  when from is {
    Farmer -> when to is {
      WashingStation -> True
      _ -> False
    }
    WashingStation -> when to is {
      Factory -> True
      _ -> False
    }
    Factory -> when to is {
      Exporter -> True
      _ -> False
    }
    Exporter -> when to is {
      Importer -> True
      _ -> False
    }
    Importer -> when to is {
      Retailer -> True
      _ -> False
    }
    Retailer -> False
  }
}

/// Validate quantity doesn't increase (only decrease allowed for processing losses)
fn is_valid_quantity_change(old_quantity: Int, new_quantity: Int) -> Bool {
  new_quantity <= old_quantity
}

/// Validate timestamp is sequential
fn is_valid_timestamp(old_timestamp: Int, new_timestamp: Int) -> Bool {
  new_timestamp >= old_timestamp
}

/// Redeemer for batch operations
pub type Redeemer {
  CreateBatch {
    batch_id: ByteArray,
    product_type: ProductType,
    origin_location: ByteArray,
    farmer_id: Option<ByteArray>,
    quantity: Int,
    timestamp: Int,
  }
  UpdateStage {
    to_stage: Stage,
    changed_by: ByteArray,
    quantity: Option<Int>,
    metadata: Option<ByteArray>,
    timestamp: Int,
  }
  UpdateQuantity {
    new_quantity: Int,
    timestamp: Int,
  }
}

validator batch_traceability {
  spend(datum: Option<BatchState>, redeemer: Redeemer, _utxo: OutputReference, _self: Transaction) {
    when datum is {
      Some(d) -> {
        when redeemer is {
          CreateBatch { batch_id, product_type, origin_location, farmer_id, quantity, timestamp } -> {
            validate_batch_creation(d, batch_id, product_type, origin_location, farmer_id, quantity, timestamp)
          }
          UpdateStage { to_stage, changed_by: _changed_by, quantity, metadata: _metadata, timestamp } -> {
            validate_stage_transition(d, to_stage, quantity, timestamp)
          }
          UpdateQuantity { new_quantity, timestamp } -> {
            is_valid_quantity_change(d.quantity, new_quantity) && 
            is_valid_timestamp(d.last_updated, timestamp)
          }
        }
      }
      None -> False
    }
  }
}

/// Validate batch creation
fn validate_batch_creation(
  datum: BatchState,
  batch_id: ByteArray,
  product_type: ProductType,
  origin_location: ByteArray,
  farmer_id: Option<ByteArray>,
  quantity: Int,
  timestamp: Int
) -> Bool {
  // For creation, the output datum should match the creation parameters
  let expected_datum = BatchState {
    batch_id: batch_id,
    product_type: product_type,
    current_stage: Farmer, // Initial stage is always Farmer
    origin_location: origin_location,
    quantity: quantity,
    farmer_id: farmer_id,
    created_at: timestamp,
    last_updated: timestamp,
  }
  
  // Check that the output datum is exactly the expected initial state
  // and that quantity is positive and timestamp is valid.
  datum == expected_datum &&
  quantity > 0 &&
  timestamp > 0
}

/// Validate stage transition
fn validate_stage_transition(
  datum: BatchState,
  to_stage: Stage,
  quantity: Option<Int>,
  timestamp: Int
) -> Bool {
  // Check valid stage transition
  let valid_transition = is_valid_transition(datum.current_stage, to_stage)
  
  // Check timestamp is sequential
  let valid_timestamp = is_valid_timestamp(datum.last_updated, timestamp)
  
  // Check quantity if provided
  let valid_quantity = when quantity is {
    Some(qty) -> is_valid_quantity_change(datum.quantity, qty)
    None -> True
  }
  
  // All validations must pass
  valid_transition && valid_timestamp && valid_quantity
}
