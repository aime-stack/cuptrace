/// Common types used across CupTrace contracts

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

/// Validation result
pub type ValidationResult {
  Valid
  Invalid { reason: ByteArray }
}

