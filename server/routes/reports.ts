import { Router, Request, Response } from 'express';
import { dbCreateReport } from '../../src/db/queries.ts';

export const reportsRouter = Router();

reportsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { target_type, target_id, category, description, reporter_contact } = req.body;

    if (!target_type || !target_id || !category || !description) {
      return res.status(400).json({ error: 'Please provide target type, target id, category, and description.' });
    }

    if (description.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a detailed description of the violation.' });
    }

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newReport = await dbCreateReport({
      id: reportId,
      reporterReference: reporter_contact ? reporter_contact.trim() : 'Anonymous Reporter',
      targetType: target_type,
      targetId: target_id.trim(),
      category,
      description: description.trim(),
      status: 'New',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your report. Our trust and safety moderation team will review this shortly.',
      report_id: newReport.id,
    });
  } catch (err: any) {
    console.error('Report submission error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit report' });
  }
});
