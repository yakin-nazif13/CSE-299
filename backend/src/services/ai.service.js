/**
 * AI Service - Handles all AI operations using Google Gemini
 * 
 * This service manages:
 * - Resume parsing from uploaded files
 * - Layout recommendations based on user profile
 * - Resume content generation
 * - Career coaching chatbot
 * 
 * Using: Google Gemini 1.5 Flash (Free with generous limits)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using Gemini 1.5 Flash - fast, free, and powerful
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

/**
 * Helper function to call Google Gemini API
 */
async function callGeminiAI(prompt, maxTokens = 2000) {
  try {
    console.log('🤖 Calling Gemini AI...');
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const response = result.response;
    const text = response.text();
    
    console.log('✅ Gemini AI responded');
    return text.trim();
  } catch (error) {
    console.error('❌ Gemini AI Error:', error.message);
    throw new Error('AI service temporarily unavailable. Please try again in a moment.');
  }
}

/**
 * Parse resume text and extract structured information
 * @param {string} resumeText - Raw text from uploaded resume
 * @returns {Promise<Object>} Structured resume data
 */
export async function parseResume(resumeText) {
  console.log('🤖 AI: Parsing resume with Gemini...');
  
  const prompt = `You are an expert resume parser. Extract ALL information from the following resume and return it as valid JSON.

Resume text:
${resumeText}

Return ONLY valid JSON in this exact structure (fill in ALL data you can extract from the resume):
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": "",
    "github": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "position": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "location": "",
      "graduationDate": "",
      "gpa": ""
    }
  ],
  "skills": {
    "technical": [],
    "soft": [],
    "languages": []
  },
  "certifications": [],
  "projects": [],
  "achievements": []
}

Return ONLY the JSON, no markdown, no explanation, just the raw JSON object.`;

  try {
    const response = await callGeminiAI(prompt, 3000);
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const parsedData = JSON.parse(jsonText);
    console.log('✅ AI: Resume parsed successfully');
    return parsedData;
  } catch (error) {
    console.error('❌ AI Error parsing resume:', error);
    // Return basic structure as fallback
    return createBasicStructure(resumeText);
  }
}

/**
 * Create basic structure when AI parsing fails
 * Enhanced fallback with comprehensive regex extraction
 */
function createBasicStructure(text) {
  console.log('⚠️ Using fallback parsing (AI unavailable)');
  
  // Split text into lines for easier parsing
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract contact information
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin:)\s*([\w-]+)/i);
  const githubMatch = text.match(/(?:github\.com\/|github:)\s*([\w-]+)/i);
  const websiteMatch = text.match(/(https?:\/\/(?:www\.)?[\w.-]+\.\w+)/);
  
  // Extract name (usually in first few lines, often the longest capitalized text)
  let fullName = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Name is often all caps or title case, longer than 5 chars, no special chars
    if (line.length > 5 && line.length < 50 && 
        /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(line)) {
      fullName = line;
      break;
    } else if (/^[A-Z\s]{10,50}$/.test(line)) {
      fullName = line;
      break;
    }
  }
  
  // Extract skills - look for common skill section headers
  const skills = { technical: [], soft: [], languages: [] };
  const skillSectionMatch = text.match(/(?:SKILLS?|TECHNICAL SKILLS?|CORE COMPETENCIES)[:\s]*([^\n]+(?:\n[^\n]+)*?)(?=\n[A-Z]{2,}|$)/i);
  if (skillSectionMatch) {
    const skillsText = skillSectionMatch[1];
    // Split by common separators
    const extractedSkills = skillsText
      .split(/[,•|·\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && s.length < 50);
    
    // Categorize skills
    const techKeywords = /javascript|python|java|react|node|sql|aws|docker|html|css|angular|vue|typescript|c\+\+|ruby|php|swift|kotlin|git|api|database/i;
    const languageKeywords = /english|spanish|french|german|mandarin|chinese|arabic|hindi|bengali|portuguese|urdu/i;
    
    extractedSkills.forEach(skill => {
      if (techKeywords.test(skill)) {
        skills.technical.push(skill);
      } else if (languageKeywords.test(skill)) {
        skills.languages.push(skill);
      } else {
        skills.soft.push(skill);
      }
    });
  }
  
  // Extract experience - look for date patterns and company names
  const experience = [];
  const expSectionMatch = text.match(/(?:EXPERIENCE|WORK HISTORY|EMPLOYMENT)[:\s]*([^\n]+(?:\n[^\n]+)*?)(?=\n(?:EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|$))/i);
  if (expSectionMatch) {
    const expText = expSectionMatch[1];
    // Look for date patterns like "2020 - 2022", "Jan 2020 - Present"
    const datePattern = /(\d{4}|\w{3,9}\s+\d{4})\s*[-–—]\s*(\d{4}|\w{3,9}\s+\d{4}|Present|Current)/gi;
    const dateMatches = [...expText.matchAll(datePattern)];
    
    dateMatches.forEach(match => {
      const contextStart = Math.max(0, match.index - 200);
      const contextEnd = Math.min(expText.length, match.index + 200);
      const context = expText.substring(contextStart, contextEnd);
      
      // Extract company and position from context
      const lines = context.split('\n').filter(l => l.trim());
      const position = lines.find(l => !datePattern.test(l) && l.length > 10 && l.length < 100) || '';
      
      experience.push({
        company: '',
        position: position.trim(),
        location: '',
        startDate: match[1],
        endDate: match[2],
        responsibilities: []
      });
    });
  }
  
  // Extract education - look for degree keywords
  const education = [];
  const eduSectionMatch = text.match(/(?:EDUCATION)[:\s]*([^\n]+(?:\n[^\n]+)*?)(?=\n(?:EXPERIENCE|SKILLS|PROJECTS|CERTIFICATIONS|$))/i);
  if (eduSectionMatch) {
    const eduText = eduSectionMatch[1];
    const degreePattern = /(Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|MBA|Associate)[\s\w]*(?:in|of)?\s*([\w\s]+)/gi;
    const degreeMatches = [...eduText.matchAll(degreePattern)];
    
    degreeMatches.forEach(match => {
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(eduText.length, match.index + 200);
      const context = eduText.substring(contextStart, contextEnd);
      
      // Look for graduation year
      const yearMatch = context.match(/\b(19|20)\d{2}\b/);
      
      education.push({
        institution: '',
        degree: match[0].trim(),
        field: match[2]?.trim() || '',
        location: '',
        graduationDate: yearMatch ? yearMatch[0] : '',
        gpa: ''
      });
    });
  }
  
  // Extract summary/objective
  let summary = '';
  const summaryMatch = text.match(/(?:SUMMARY|OBJECTIVE|PROFILE)[:\s]*([^\n]+(?:\n[^\n]+){0,3})/i);
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
  }
  
  // Extract certifications
  const certifications = [];
  const certMatch = text.match(/(?:CERTIFICATIONS?|LICENSES?)[:\s]*([^\n]+(?:\n[^\n]+)*?)(?=\n[A-Z]{2,}|$)/i);
  if (certMatch) {
    certifications.push(...certMatch[1]
      .split(/\n|•|·/)
      .map(c => c.trim())
      .filter(c => c.length > 3 && c.length < 100));
  }
  
  // Extract projects
  const projects = [];
  const projectMatch = text.match(/(?:PROJECTS?)[:\s]*([^\n]+(?:\n[^\n]+)*?)(?=\n[A-Z]{2,}|$)/i);
  if (projectMatch) {
    projects.push(...projectMatch[1]
      .split(/\n(?=[A-Z])|•|·/)
      .map(p => p.trim())
      .filter(p => p.length > 10 && p.length < 200));
  }
  
  console.log('✅ Fallback parsing completed');
  
  return {
    personalInfo: {
      fullName: fullName,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: '',
      linkedin: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : '',
      website: websiteMatch ? websiteMatch[1] : '',
      github: githubMatch ? `https://github.com/${githubMatch[1]}` : ''
    },
    summary: summary,
    experience: experience,
    education: education,
    skills: skills,
    certifications: certifications,
    projects: projects,
    achievements: []
  };
}

/**
 * Recommend the best resume layout based on user profile
 * @param {Object} resumeData - User's resume information
 * @param {string} targetRole - The job role user is targeting
 * @returns {Promise<Object>} Layout recommendation with reasoning
 */
export async function recommendLayout(resumeData, targetRole = '') {
  console.log('🤖 AI: Recommending layout with Gemini...');
  
  const yearsOfExperience = calculateYearsOfExperience(resumeData.experience);
  const industry = inferIndustry(resumeData);
  
  const prompt = `You are a professional resume consultant. Recommend the BEST resume layout for this candidate.

Candidate Profile:
- Years of Experience: ${yearsOfExperience}
- Industry: ${industry}
- Target Role: ${targetRole || 'Not specified'}
- Education: ${resumeData.education?.[0]?.degree || 'Not specified'}
- Technical Skills: ${resumeData.skills?.technical?.length || 0}

Available Layouts:
1. Classic Professional - Traditional, ATS-friendly, conservative
2. Modern Minimalist - Clean, contemporary, tech-focused
3. Technical Focus - Skills and projects emphasized
4. Executive - Leadership-oriented, sophisticated
5. Academic - Research-focused, publications

Return ONLY valid JSON in this exact format:
{
  "recommendedLayout": "layout name",
  "reasoning": "2-3 sentences why this fits",
  "alternativeLayouts": ["second best", "third best"],
  "confidenceScore": 0.85
}

Return ONLY the JSON object, no markdown, no explanation.`;

  try {
    const response = await callGeminiAI(prompt, 500);
    
    // Extract JSON from response
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const recommendation = JSON.parse(jsonText);
    console.log('✅ AI: Layout recommended -', recommendation.recommendedLayout);
    return recommendation;
  } catch (error) {
    console.error('❌ AI Error recommending layout:', error);
    return getDefaultLayoutRecommendation(yearsOfExperience, industry);
  }
}

/**
 * Default layout recommendation if AI fails
 */
function getDefaultLayoutRecommendation(years, industry) {
  let layout = 'Modern Minimalist';
  let reasoning = 'This clean, professional layout works well for most industries.';
  
  if (years < 2) {
    layout = 'Classic Professional';
    reasoning = 'A traditional format helps early-career professionals present their credentials clearly.';
  } else if (industry.includes('Tech')) {
    layout = 'Technical Focus';
    reasoning = 'This layout emphasizes your technical skills and projects, perfect for tech roles.';
  } else if (years > 10) {
    layout = 'Executive';
    reasoning = 'Your extensive experience deserves a layout that highlights leadership and impact.';
  }
  
  return {
    recommendedLayout: layout,
    reasoning: reasoning,
    alternativeLayouts: ['Modern Minimalist', 'Classic Professional'],
    confidenceScore: 0.75
  };
}

/**
 * Generate polished resume content from user data
 * @param {Object} resumeData - Raw resume information
 * @param {string} targetRole - Target job role
 * @param {string} targetIndustry - Target industry
 * @returns {Promise<Object>} Enhanced resume content
 */
export async function generateResumeContent(resumeData, targetRole = '', targetIndustry = '') {
  console.log('🤖 AI: Generating resume content with Gemini...');
  
  const prompt = `You are an expert resume writer specializing in ATS-optimized resumes.

Transform this resume into polished, professional content optimized for ${targetRole || 'their target role'} in ${targetIndustry || 'their industry'}.

Current Resume:
${JSON.stringify(resumeData, null, 2)}

Guidelines:
1. Start bullets with strong action verbs (Led, Developed, Implemented, Increased)
2. Quantify achievements with numbers and percentages
3. Focus on impact and results, not just tasks
4. Keep bullets concise (1-2 lines)
5. Use present tense for current role, past tense for previous
6. Create a compelling 2-3 sentence professional summary
7. Optimize for ATS with relevant keywords

Return the enhanced resume in the EXACT same JSON structure, but with improved content.
Return ONLY valid JSON, no markdown, no explanation.`;

  try {
    const response = await callGeminiAI(prompt, 4000);
    
    // Extract JSON from response
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const enhancedResume = JSON.parse(jsonText);
    console.log('✅ AI: Resume content generated successfully');
    return enhancedResume;
  } catch (error) {
    console.error('❌ AI Error generating content:', error);
    return enhanceResumeBasic(resumeData);
  }
}

/**
 * Basic enhancement if AI fails
 */
function enhanceResumeBasic(resumeData) {
  // Just return the original data with a generic summary if missing
  if (!resumeData.summary) {
    resumeData.summary = `Experienced professional with ${resumeData.experience?.length || 0} positions of expertise. Skilled in ${resumeData.skills?.technical?.slice(0, 3).join(', ') || 'various areas'}.`;
  }
  return resumeData;
}

/**
 * Career chatbot - Provides personalized career advice
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {Object} resumeData - User's resume data for context
 * @param {string} userMessage - User's current message
 * @returns {Promise<string>} AI's response
 */
export async function chatWithCareerCoach(conversationHistory, resumeData, userMessage) {
  console.log('🤖 AI: Career coach responding with Gemini...');
  
  const contextPrompt = resumeData 
    ? `\n\nCandidate's Resume Context:\n${JSON.stringify(resumeData, null, 2)}`
    : '';
  
  const prompt = `You are an expert career coach and resume consultant. Help the user with their career and resume questions. Be friendly, professional, and provide actionable advice.

Previous conversation:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User's Question: ${userMessage}${contextPrompt}

Provide a helpful, specific response focused on:
- Resume writing best practices
- Career development advice
- Interview preparation tips
- Professional development
- ATS optimization

Keep your response concise (2-4 paragraphs) but valuable. Use bullet points when appropriate.`;

  try {
    const response = await callGeminiAI(prompt, 1000);
    
    console.log('✅ AI: Career coach responded');
    return response;
  } catch (error) {
    console.error('❌ AI Error in career chat:', error);
    
    // Simple fallback response when AI is unavailable
    return `I'm having trouble connecting to the AI service right now. This usually means the API key needs to be configured. 

In the meantime, here are some general career tips:
- Use strong action verbs in your resume (Led, Developed, Implemented)
- Quantify your achievements with numbers and metrics
- Tailor your resume to each job application
- Keep your LinkedIn profile updated
- Network actively in your industry

Please make sure your Gemini API key is properly configured, then try again!`;
  }
}

/**
 * Suggest improvements to specific sections of the resume
 * @param {Object} section - The resume section to improve
 * @param {string} sectionType - Type of section (experience, education, skills, etc.)
 * @returns {Promise<string>} Improvement suggestions
 */
export async function suggestSectionImprovements(section, sectionType) {
  console.log(`🤖 AI: Suggesting improvements for ${sectionType}...`);
  
  const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a resume expert providing specific, actionable improvement suggestions.<|eot_id|>

<|start_header_id|>user<|end_header_id|>
Analyze this ${sectionType} section and provide specific improvements:

Current ${sectionType}:
${JSON.stringify(section, null, 2)}

Provide:
1. What's working well (be specific)
2. 3-5 concrete improvements (what to change and how)
3. Example of one improved version

Be encouraging but honest. Keep advice practical and tailored to this content.<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

  try {
    const response = await callHuggingFace(prompt, 1000);
    console.log('✅ AI: Suggestions generated');
    return response || "Consider adding more specific metrics and achievements to strengthen this section.";
  } catch (error) {
    console.error('❌ AI Error suggesting improvements:', error);
    return "Consider adding more quantifiable achievements and using stronger action verbs to make this section more impactful.";
  }
}

// Helper functions

function calculateYearsOfExperience(experience) {
  if (!experience || experience.length === 0) return 0;
  
  let totalMonths = 0;
  experience.forEach(exp => {
    const start = new Date(exp.startDate);
    const end = exp.endDate.toLowerCase() === 'present' ? new Date() : new Date(exp.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += months;
  });
  
  return Math.round(totalMonths / 12 * 10) / 10;
}

function inferIndustry(resumeData) {
  const allText = JSON.stringify(resumeData).toLowerCase();
  
  if (allText.includes('software') || allText.includes('developer') || allText.includes('engineer')) {
    return 'Technology/Software';
  } else if (allText.includes('marketing') || allText.includes('brand')) {
    return 'Marketing';
  } else if (allText.includes('finance') || allText.includes('accounting')) {
    return 'Finance';
  } else if (allText.includes('design') || allText.includes('creative')) {
    return 'Design/Creative';
  } else if (allText.includes('research') || allText.includes('phd')) {
    return 'Research/Academic';
  } else {
    return 'General/Multiple Industries';
  }
}

export default {
  parseResume,
  recommendLayout,
  generateResumeContent,
  chatWithCareerCoach,
  suggestSectionImprovements
};
