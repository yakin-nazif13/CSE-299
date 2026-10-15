/**
 * AI Routes - API endpoints for AI chat and interactions
 */

import express from 'express';
import aiService from '../services/ai.service.js';

const router = express.Router();

/**
 * POST /api/ai/chat
 * Send message to career coach chatbot
 */
router.post('/chat', async (req, res) => {
  try {
    console.log('\n💬 Chat message received');
    
    const { message, conversationHistory, resumeData } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }
    
    // Get AI response (resumeData is optional)
    const aiResponse = await aiService.chatWithCareerCoach(
      conversationHistory || [],
      resumeData || {},
      message
    );
    
    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString()
      },
      message: 'Response generated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in /chat:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate response'
    });
  }
});

/**
 * GET /api/ai/health
 * Check if AI service is working
 */
router.get('/health', async (req, res) => {
  try {
    // Simple check to see if API key is configured
    const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.HUGGINGFACE_API_KEY) && 
                      (process.env.GEMINI_API_KEY || process.env.HUGGINGFACE_API_KEY) !== 'your_huggingface_token_here';
    
    res.json({
      success: true,
      data: {
        status: hasApiKey ? 'ready' : 'not_configured',
        message: hasApiKey ? 'AI service is ready (Google Gemini)' : 'Google Gemini API key not configured',
        model: 'Gemini 1.5 Flash'
      }
    });
    
  } catch (error) {
    console.error('❌ Error in /health:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Health check failed'
    });
  }
});

export default router;
