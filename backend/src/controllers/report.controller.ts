import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  createReport,
  getReportById,
  listReports,
  updateReport,
  submitReport,
  approveReport,
  rejectReport,
  deleteReport,
  generateNaebReport,
} from '../services/report.service.js';
import { sendSuccess } from '../utils/response.js';

export const createReportController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const {
      reportType,
      periodStart,
      periodEnd,
      data,
      status,
    } = req.body;

    const report = await createReport({
      reportType,
      periodStart,
      periodEnd,
      generatedBy: req.user.id,
      data,
      status,
    });

    return sendSuccess(res, report, 201);
  } catch (error) {
    next(error);
  }
};

export const getReportController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const report = await getReportById(id);

    return sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
};

export const listReportsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { 
      reportType, 
      status, 
      generatedBy, 
      page = '1', 
      limit = '10' 
    } = req.query;

    const result = await listReports(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      reportType as 'monthly_summary' | 'quarterly_export' | 'annual_statistics' | 'quality_report' | 'payment_report' | 'custom' | undefined,
      status as 'draft' | 'submitted' | 'approved' | 'rejected' | undefined,
      generatedBy as string | undefined
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateReportController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const {
      reportType,
      periodStart,
      periodEnd,
      data,
      status,
    } = req.body;

    const report = await updateReport(id, {
      reportType,
      periodStart,
      periodEnd,
      data,
      status,
    });

    return sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
};

export const submitReportController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const report = await submitReport(id);

    return sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
};

export const approveReportController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const report = await approveReport(id);

    return sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
};

export const rejectReportController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const report = await rejectReport(id);

    return sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
};

export const deleteReportController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteReport(id);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const generateNaebReportController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    // Only admins can generate NAEB reports
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can generate NAEB reports',
      });
    }

    const {
      periodStart,
      periodEnd,
      reportType,
      format = 'json',
    } = req.query;

    const reportData = await generateNaebReport({
      periodStart: periodStart as string | undefined,
      periodEnd: periodEnd as string | undefined,
      reportType: reportType as 'monthly_summary' | 'quarterly_export' | 'annual_statistics' | 'quality_report' | 'payment_report' | 'custom' | undefined,
      format: format as 'json' | 'pdf' | 'excel',
    });

    // Return JSON format (PDF/Excel generation requires additional libraries like pdfkit or exceljs)
    if (format === 'json') {
      return sendSuccess(res, reportData);
    } else {
      const formatStr = typeof format === 'string' ? format : 'json';
      return res.status(501).json({
        success: false,
        error: `${formatStr.toUpperCase()} format not yet implemented. Please use format=json`,
      });
    }
  } catch (error) {
    next(error);
  }
};

