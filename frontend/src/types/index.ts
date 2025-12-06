export enum UserRole {
    admin = 'admin',
    farmer = 'farmer',
    agent = 'agent',
    ws = 'ws',
    factory = 'factory',
    exporter = 'exporter',
    importer = 'importer',
    retailer = 'retailer',
    qc = 'qc',
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
    address?: string;
    country?: string;
    city?: string;
    province?: string;
    cooperativeId?: string;
    cooperative?: Cooperative;
    registrationNumber?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Cooperative {
    id: string;
    name: string;
    location: string;
    district?: string;
    province?: string;
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
    nftPolicyId?: string;
    nftAssetName?: string;

    nftMintedAt?: string;

    metadata?: Record<string, any>;

    createdAt: string;
    updatedAt: string;
    history?: BatchHistory[];
    events?: any[]; // TODO: Define SupplyChainEvent type
    documents?: any[]; // TODO: Define BatchDocument type
    integrity?: {
        hash: string;
        frozenData: any;
    };
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
    password: string;
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

export type CertificateType = 'organic' | 'fair_trade' | 'quality_grade' | 'export_permit' | 'health_certificate' | 'origin_certificate' | 'other';

export interface Certificate {
    id: string;
    batchId: string;
    certificateType: CertificateType;
    certificateNumber: string;
    issuedBy: string;
    issuedDate: string;
    expiryDate?: string;
    documentUrl?: string;
    blockchainTxHash?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCertificateRequest {
    batchId: string;
    certificateType: CertificateType;
    certificateNumber: string;
    issuedBy: string;
    issuedDate: string;
    expiryDate?: string;
    documentUrl?: string;
    blockchainTxHash?: string;
}

export interface UpdateCertificateRequest {
    certificateType?: CertificateType;
    certificateNumber?: string;
    issuedBy?: string;
    issuedDate?: string;
    expiryDate?: string;
    documentUrl?: string;
    blockchainTxHash?: string;
}

export type PaymentType = 'harvest_payment' | 'processing_payment' | 'export_payment' | 'quality_bonus' | 'other';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Payment {
    id: string;
    batchId: string;
    payerId: string;
    payeeId: string;
    amount: number;
    currency: string;
    paymentType: PaymentType;
    status: PaymentStatus;
    paymentDate?: string;
    transactionRef?: string;
    notes?: string;
    blockchainTxHash?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentRequest {
    batchId: string;
    payerId: string;
    payeeId: string;
    amount: number;
    currency?: string;
    paymentType: PaymentType;
    paymentDate?: string;
    transactionRef?: string;
    notes?: string;
    blockchainTxHash?: string;
}

export interface UpdatePaymentRequest {
    amount?: number;
    currency?: string;
    paymentType?: PaymentType;
    status?: PaymentStatus;
    paymentDate?: string;
    transactionRef?: string;
    notes?: string;
    blockchainTxHash?: string;
}

export interface ExportRecord {
    id: string;
    batchId: string;
    exporterId: string;
    buyerName: string;
    buyerAddress?: string;
    buyerEmail?: string;
    shippingMethod: string;
    shippingDate: string;
    expectedArrival?: string;
    trackingNumber?: string;
    certificates?: string[];
    blockchainTxHash?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExportRequest {
    batchId: string;
    exporterId: string;
    buyerName: string;
    buyerAddress?: string;
    buyerEmail?: string;
    shippingMethod: string;
    shippingDate: string;
    expectedArrival?: string;
    trackingNumber?: string;
    certificates?: string[];
    blockchainTxHash?: string;
}

export interface UpdateExportRequest {
    buyerName?: string;
    buyerAddress?: string;
    buyerEmail?: string;
    shippingMethod?: string;
    shippingDate?: string;
    expectedArrival?: string;
    trackingNumber?: string;
    certificates?: string[];
    blockchainTxHash?: string;
}

export interface ProcessingRecord {
    id: string;
    batchId: string;
    stage: SupplyChainStage;
    processingType: string;
    notes?: string;
    qualityScore?: number;
    quantityIn?: number;
    quantityOut?: number;
    processedBy: string;
    processedAt: string;
    blockchainTxHash?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProcessingRecordRequest {
    batchId: string;
    stage: SupplyChainStage;
    processingType: string;
    notes?: string;
    qualityScore?: number;
    quantityIn?: number;
    quantityOut?: number;
    processedBy: string;
    processedAt?: string;
    blockchainTxHash?: string;
}

export interface UpdateProcessingRecordRequest {
    processingType?: string;
    notes?: string;
    qualityScore?: number;
    quantityIn?: number;
    quantityOut?: number;
    blockchainTxHash?: string;
}

export type ReportType = 'monthly_summary' | 'quarterly_export' | 'annual_statistics' | 'quality_report' | 'payment_report' | 'custom';
export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Report {
    id: string;
    reportType: ReportType;
    periodStart: string;
    periodEnd: string;
    generatedBy: string;
    data: Record<string, unknown>;
    status: ReportStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReportRequest {
    reportType: ReportType;
    periodStart: string;
    periodEnd: string;
    generatedBy: string;
    data: Record<string, unknown>;
    status?: ReportStatus;
}

export interface UpdateReportRequest {
    reportType?: ReportType;
    periodStart?: string;
    periodEnd?: string;
    data?: Record<string, unknown>;
    status?: ReportStatus;
}

export interface UpdateStageRequest {
    stage: SupplyChainStage;
    blockchainTxHash?: string;
    changedBy: string;
    notes?: string;
    quantity?: number;
    quality?: string;
    location?: string;
    metadata?: Record<string, unknown>;
}
