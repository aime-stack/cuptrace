import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createCertificate,
  getCertificateById,
  getCertificateByNumber,
  listCertificatesByBatch,
  listCertificates,
  updateCertificate,
  deleteCertificate,
} from '../services/certificate.service';
import { sendSuccess } from '../utils/response';

export const createCertificateController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const {
      batchId,
      certificateType,
      certificateNumber,
      issuedBy,
      issuedDate,
      expiryDate,
      documentUrl,
      blockchainTxHash,
    } = req.body;

    const certificate = await createCertificate({
      batchId,
      certificateType,
      certificateNumber,
      issuedBy,
      issuedDate,
      expiryDate,
      documentUrl,
      blockchainTxHash,
    });

    return sendSuccess(res, certificate, 201);
  } catch (error) {
    next(error);
  }
};

export const getCertificateController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const certificate = await getCertificateById(id);

    return sendSuccess(res, certificate);
  } catch (error) {
    next(error);
  }
};

export const getCertificateByNumberController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await getCertificateByNumber(certificateNumber);

    return sendSuccess(res, certificate);
  } catch (error) {
    next(error);
  }
};

export const listCertificatesByBatchController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { batchId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const result = await listCertificatesByBatch(
      batchId,
      parseInt(page as string, 10),
      parseInt(limit as string, 10)
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const listCertificatesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const {
      batchId,
      certificateType,
      page = '1',
      limit = '10'
    } = req.query;

    const result = await listCertificates(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      batchId as string | undefined,
      certificateType as 'organic' | 'fair_trade' | 'quality_grade' | 'export_permit' | 'health_certificate' | 'origin_certificate' | 'other' | undefined
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateCertificateController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const {
      certificateType,
      certificateNumber,
      issuedBy,
      issuedDate,
      expiryDate,
      documentUrl,
      blockchainTxHash,
    } = req.body;

    const certificate = await updateCertificate(id, {
      certificateType,
      certificateNumber,
      issuedBy,
      issuedDate,
      expiryDate,
      documentUrl,
      blockchainTxHash,
    });

    return sendSuccess(res, certificate);
  } catch (error) {
    next(error);
  }
};

export const deleteCertificateController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteCertificate(id);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};