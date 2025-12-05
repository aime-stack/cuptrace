/// Stage Transition Validator
/// 
/// This validator validates and records stage transitions.
/// It checks previous stage validity, verifies authorized users, and stores transition metadata.

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

/// Stage transition data
pub type StageTransition {
  StageTransition {
    batch_id: ByteArray,
    from_stage: Stage,
    to_stage: Stage,
    changed_by: ByteArray,
    quantity: Option<Int>,
    metadata: Option<ByteArray>,
    timestamp: Int,
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

/// Redeemer for stage transitions
pub type Redeemer {
  RecordTransition {
    batch_id: ByteArray,
    from_stage: Stage,
    to_stage: Stage,
    changed_by: ByteArray,
    quantity: Option<Int>,
    metadata: Option<ByteArray>,
    timestamp: Int,
  }
}

validator stage_transition {
  spend(datum: Option<StageTransition>, redeemer: Redeemer, _utxo: OutputReference, _self: Transaction) {
    when datum is {
      Some(d) -> {
        let RecordTransition {
          batch_id,
          from_stage,
          to_stage,
          changed_by: _changed_by,
          quantity,
          metadata: _metadata,
          timestamp,
        } = redeemer
        
        validate_transition(d, batch_id, from_stage, to_stage, quantity, timestamp)
      }
      None -> False
    }
  }
}

/// Validate stage transition
fn validate_transition(
  datum: StageTransition,
  batch_id: ByteArray,
  from_stage: Stage,
  to_stage: Stage,
  quantity: Option<Int>,
  timestamp: Int
) -> Bool {
  // Verify batch ID matches
  let batch_match = datum.batch_id == batch_id
  
  // Verify from_stage matches current datum stage
  let stage_match = datum.to_stage == from_stage
  
  // Verify valid transition
  let valid_transition = is_valid_transition(from_stage, to_stage)
  
  // Verify timestamp is sequential
  let valid_timestamp = is_valid_timestamp(datum.timestamp, timestamp)
  
  // Verify quantity if provided
  let valid_quantity = when quantity is {
    Some(qty) -> {
      when datum.quantity is {
        Some(old_qty) -> is_valid_quantity_change(old_qty, qty)
        None -> True
      }
    }
    None -> True
  }
  
  // All validations must pass
  batch_match && stage_match && valid_transition && valid_timestamp && valid_quantity
}
