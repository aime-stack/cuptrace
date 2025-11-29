export enum UserRole {
    admin = 'admin',
    farmer = 'farmer',
    ws = 'ws',
    factory = 'factory',
    exporter = 'exporter',
    importer = 'importer',
    retailer = 'retailer',
}

export enum ProductType {
    coffee = 'coffee',
    tea = 'tea',
}

export enum BatchStatus {
    pending = 'pending',
    approved = 'approved',
    rejected = 'rejected',
    processing = 'processing',
    ready_for_export = 'ready_for_export',
    exported = 'exported',
    delivered = 'delivered',
}

export enum SupplyChainStage {
    farmer = 'farmer',
    washing_station = 'washing_station',
    factory = 'factory',
    exporter = 'exporter',
    importer = 'importer',
    retailer = 'retailer',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    country?: string;
    city?: string;
    province?: string;
    cooperativeId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Cooperative {
    id: string;
    name: string;
    location: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductBatch {
    id: string;
    type: ProductType;
    status: BatchStatus;
    currentStage: SupplyChainStage;
    originLocation: string;
    region?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
    coordinates?: string;
    lotId?: string;
    quantity?: number;
    quality?: string;
    moisture?: number;
    harvestDate?: string;
    processingType?: string;
    grade?: string;
    teaType?: string;
    pluckingDate?: string;
    description?: string;
    tags?: string[];
    farmerId: string;
    cooperativeId?: string;
    washingStationId?: string;
    factoryId?: string;
    blockchainTxHash?: string;
    createdAt: string;
    updatedAt: string;
    history?: BatchHistory[];
}

export interface BatchHistory {
    id: string;
    batchId: string;
    stage: SupplyChainStage;
    changedBy: string;
    timestamp: string;
    action?: string;
    notes?: string;
    location?: string;
    quantity?: number;
    quality?: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    cooperativeId?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface CreateBatchRequest {
    type: ProductType;
    originLocation: string;
    region?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
    coordinates?: string;
    quantity?: number;
    quality?: string;
    moisture?: number;
    harvestDate?: string;
    processingType?: string;
    grade?: string;
    teaType?: string;
    pluckingDate?: string;
    description?: string;
    tags?: string[];
    cooperativeId?: string;
}

export interface UpdateBatchRequest {
    status?: BatchStatus;
    currentStage?: SupplyChainStage;
    [key: string]: any;
}

export interface BatchFilters {
    status?: BatchStatus;
    farmerId?: string;
    cooperativeId?: string;
    washingStationId?: string;
    [key: string]: any;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}
