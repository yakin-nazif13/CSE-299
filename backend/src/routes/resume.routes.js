/**
 * Resume Routes - API endpoints for resume operations
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { parseResumeFile, validateResumeFile } from '../services/parser.service.js';
import aiService from '../services/ai.service.js';
import exportService from '../services/export.service.js';
import { protect } from '../middleware/auth.middleware.js';
import Resume from '../models/Resume.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  }
});

/**
 * POST /api/resume/parse
 * Upload and parse a resume file
 */
router.post('/parse', upload.single('resume'), async (req, res) => {
  try {
    console.log('\n📤 Upload request received');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }
    
    // Validate file
    const validation = validateResumeFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: validation.errors.join(', ') 
      });
    }
    
    console.log('✅ File validated:', req.file.originalname);
    
    // Extract text from file
    const extractedText = await parseResumeFile(req.file);
    console.log('📄 Text extracted, length:', extractedText.length);
    
    // Use AI to parse the text into structured data
    const parsedResume = await aiService.parseResume(extractedText);
    
    res.json({
      success: true,
      data: parsedResume,
      message: 'Resume parsed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in /parse:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to parse resume'
    });
  }
});

/**
 * POST /api/resume/recommend-layout
 * Get AI recommendation for resume layout
 */
router.post('/recommend-layout', async (req, res) => {
  try {
    console.log('\n🎨 Layout recommendation request');
    
    const { resumeData, targetRole } = req.body;
    
    if (!resumeData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Resume data is required' 
      });
    }
    
    const recommendation = await aiService.recommendLayout(resumeData, targetRole);
    
    res.json({
      success: true,
      data: recommendation,
      message: 'Layout recommended successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in /recommend-layout:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to recommend layout'
    });
  }
});

/**
 * POST /api/resume/generate
 * Generate enhanced resume content using AI
 */
router.post('/generate', async (req, res) => {
  try {
    console.log('\n✨ Resume generation request');
    
    const { resumeData, targetRole, targetIndustry } = req.body;
    
    if (!resumeData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Resume data is required' 
      });
    }
    
    const enhancedResume = await aiService.generateResumeContent(
      resumeData, 
      targetRole, 
      targetIndustry
    );
    
    res.json({
      success: true,
      data: enhancedResume,
      message: 'Resume content generated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in /generate:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate resume'
    });
  }
});

/**
 * POST /api/resume/export/pdf
 * Export resume as PDF
 */
router.post('/export/pdf', async (req, res) => {
  try {
    console.log('\n📄 PDF export request');
    
    const { resumeData, layoutStyle } = req.body;
    
    if (!resumeData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Resume data is required' 
      });
    }
    
    const pdfPath = await exportService.generatePDF(resumeData, layoutStyle);
    
    // Send file
    res.download(pdfPath, 'resume.pdf', (err) => {
      // Clean up file after sending
      exportService.cleanupTempFile(pdfPath);
      
      if (err) {
        console.error('❌ Error sending PDF:', err);
      }
    });
    
  } catch (error) {
    console.error('❌ Error in /export/pdf:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to export PDF'
    });
  }
});

/**
 * POST /api/resume/export/docx
 * Export resume as DOCX
 */
router.post('/export/docx', async (req, res) => {
  try {
    console.log('\n📄 DOCX export request');
    
    const { resumeData } = req.body;
    
    if (!resumeData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Resume data is required' 
      });
    }
    
    const docxPath = await exportService.generateDOCX(resumeData);
    
    // Send file
    res.download(docxPath, 'resume.docx', (err) => {
      // Clean up file after sending
      exportService.cleanupTempFile(docxPath);
      
      if (err) {
        console.error('❌ Error sending DOCX:', err);
      }
    });
    
  } catch (error) {
    console.error('❌ Error in /export/docx:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to export DOCX'
    });
  }
});

/**
 * POST /api/resume/improve
 * Get AI suggestions for improving a specific section
 */
router.post('/improve', async (req, res) => {
  try {
    console.log('\n💡 Improvement suggestion request');
    
    const { section, sectionType } = req.body;
    
    if (!section || !sectionType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Section data and type are required' 
      });
    }
    
    const suggestions = await aiService.suggestSectionImprovements(section, sectionType);
    
    res.json({
      success: true,
      data: { suggestions },
      message: 'Suggestions generated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in /improve:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate suggestions'
    });
  }
});

/**
 * POST /api/resume/save
 * Save a resume to database (protected route)
 */
router.post('/save', protect, async (req, res) => {
  try {
    console.log('\n💾 Save resume request');
    
    const resumeData = req.body;
    
    // Create new resume with user association
    const resume = await Resume.create({
      userId: req.user._id,
      title: resumeData.title || `${resumeData.personalInfo?.fullName || 'Untitled'}'s Resume`,
      ...resumeData
    });
    
    console.log('✅ Resume saved:', resume._id);
    
    res.status(201).json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    console.error('❌ Error saving resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save resume'
    });
  }
});

/**
 * GET /api/resume/list
 * Get all resumes for current user (protected route)
 */
router.get('/list', protect, async (req, res) => {
  try {
    console.log('\n📋 List resumes request for user:', req.user.email);
    
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('-__v');
    
    console.log(`✅ Found ${resumes.length} resumes`);
    
    res.json({
      success: true,
      data: { resumes }
    });
  } catch (error) {
    console.error('❌ Error listing resumes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resumes'
    });
  }
});

/**
 * GET /api/resume/:id
 * Get a specific resume by ID (protected route)
 */
router.get('/:id', protect, async (req, res) => {
  try {
    console.log('\n📄 Get resume request:', req.params.id);
    
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }
    
    console.log('✅ Resume found');
    
    res.json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    console.error('❌ Error getting resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resume'
    });
  }
});

/**
 * PUT /api/resume/:id
 * Update a resume (protected route)
 */
router.put('/:id', protect, async (req, res) => {
  try {
    console.log('\n✏️  Update resume request:', req.params.id);
    
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }
    
    // Update resume fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'userId' && key !== '_id') {
        resume[key] = req.body[key];
      }
    });
    
    await resume.save();
    
    console.log('✅ Resume updated');
    
    res.json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    console.error('❌ Error updating resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update resume'
    });
  }
});

/**
 * DELETE /api/resume/:id
 * Delete a resume (protected route)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    console.log('\n🗑️  Delete resume request:', req.params.id);
    
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }
    
    console.log('✅ Resume deleted');
    
    res.json({
      success: true,
      data: { message: 'Resume deleted successfully' }
    });
  } catch (error) {
    console.error('❌ Error deleting resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete resume'
    });
  }
});

export default router;
