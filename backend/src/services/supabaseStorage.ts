/**
 * Supabase Storage Service for CupTrace
 * 
 * Handles uploading and managing QR code files in Supabase Storage.
 * Uses service role key for backend operations.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const qrBucket = process.env.SUPABASE_QR_BUCKET || 'qr-codes';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client instance
 */
function getSupabaseClient(): SupabaseClient {
    if (!supabaseClient) {
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
        }
        supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return supabaseClient;
}

/**
 * Ensure the QR codes bucket exists
 * Creates it if it doesn't exist
 */
export async function ensureBucketExists(): Promise<void> {
    const client = getSupabaseClient();

    const { data: buckets, error: listError } = await client.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        throw listError;
    }

    const bucketExists = buckets?.some(b => b.name === qrBucket);

    if (!bucketExists) {
        const { error: createError } = await client.storage.createBucket(qrBucket, {
            public: true,
            fileSizeLimit: 1024 * 1024, // 1MB limit for QR codes
        });

        if (createError) {
            console.error('Error creating bucket:', createError);
            throw createError;
        }

        console.log(`Created bucket: ${qrBucket}`);
    }
}

/**
 * Upload a QR code image to Supabase Storage
 * 
 * @param buffer - Image buffer (PNG or SVG)
 * @param filename - Filename without bucket path
 * @param contentType - MIME type of the file
 * @param isPublic - Whether to make the file publicly accessible
 * @returns Public URL or signed URL depending on isPublic
 */
export async function uploadQRCode(
    buffer: Buffer,
    filename: string,
    contentType: 'image/png' | 'image/svg+xml' = 'image/png',
    isPublic: boolean = true
): Promise<string> {
    const client = getSupabaseClient();

    // Ensure bucket exists
    await ensureBucketExists();

    const { error } = await client.storage
        .from(qrBucket)
        .upload(filename, buffer, {
            contentType,
            upsert: true, // Overwrite if exists
        });

    if (error) {
        console.error('Error uploading QR code:', error);
        throw error;
    }

    // Get the URL
    if (isPublic) {
        return getPublicUrl(filename);
    } else {
        return await getSignedUrl(filename, 3600 * 24 * 7); // 7 days
    }
}

/**
 * Get public URL for a file
 * 
 * @param filename - Filename in the bucket
 * @returns Public URL
 */
export function getPublicUrl(filename: string): string {
    const client = getSupabaseClient();

    const { data } = client.storage
        .from(qrBucket)
        .getPublicUrl(filename);

    return data.publicUrl;
}

/**
 * Get signed URL for private files
 * 
 * @param filename - Filename in the bucket
 * @param expiresIn - Expiration time in seconds
 * @returns Signed URL
 */
export async function getSignedUrl(filename: string, expiresIn: number = 3600): Promise<string> {
    const client = getSupabaseClient();

    const { data, error } = await client.storage
        .from(qrBucket)
        .createSignedUrl(filename, expiresIn);

    if (error) {
        console.error('Error creating signed URL:', error);
        throw error;
    }

    return data.signedUrl;
}

/**
 * Delete a file from storage
 * 
 * @param filename - Filename to delete
 */
export async function deleteFile(filename: string): Promise<void> {
    const client = getSupabaseClient();

    const { error } = await client.storage
        .from(qrBucket)
        .remove([filename]);

    if (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

/**
 * Check if Supabase is configured
 * 
 * @returns boolean indicating if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
    return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

/**
 * List files in the QR codes bucket
 * 
 * @param prefix - Optional prefix to filter by
 * @param limit - Maximum number of files to return
 * @returns Array of file objects
 */
export async function listQRCodes(
    prefix?: string,
    limit: number = 100
): Promise<Array<{ name: string; size: number; createdAt: string }>> {
    const client = getSupabaseClient();

    const { data, error } = await client.storage
        .from(qrBucket)
        .list(prefix, {
            limit,
            sortBy: { column: 'created_at', order: 'desc' },
        });

    if (error) {
        console.error('Error listing QR codes:', error);
        throw error;
    }

    return (data || []).map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        createdAt: file.created_at || '',
    }));
}

export default {
    uploadQRCode,
    getPublicUrl,
    getSignedUrl,
    deleteFile,
    isSupabaseConfigured,
    listQRCodes,
    ensureBucketExists,
};
