/**
 * Export Service - Generates Beautiful, Distinct PDF Resumes
 * 
 * Three stunning layouts:
 * 1. Modern Minimalist - Clean blue accent, contemporary
 * 2. Classic Professional - Traditional serif, formal
 * 3. Technical/Academic - Dense, two-column, research-focused
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate PDF resume
 */
export async function generatePDF(resumeData, layoutStyle = 'modern') {
  console.log('📄 Generating PDF resume with layout:', layoutStyle);
  
  const fileName = `resume_${uuidv4()}.pdf`;
  const outputPath = path.join(process.cwd(), 'temp', fileName);
  
  // Ensure temp directory exists
  if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
    fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
  }
  
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 40, bottom: 40, left: 50, right: 50 }
      });
      
      // Pipe to file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Apply layout - normalize names
      const normalizedLayout = layoutStyle.toLowerCase().replace(/\s+/g, '');
      
      if (normalizedLayout.includes('classic') || normalizedLayout.includes('professional')) {
        renderClassicLayout(doc, resumeData);
      } else if (normalizedLayout.includes('technical') || normalizedLayout.includes('focus') || normalizedLayout.includes('academic') || normalizedLayout.includes('curve')) {
        renderTechnicalLayout(doc, resumeData);
      } else {
        renderModernLayout(doc, resumeData); // Default modern
      }
      
      // Finalize
      doc.end();
      
      stream.on('finish', () => {
        console.log('✅ PDF generated:', fileName);
        resolve(outputPath);
      });
      
      stream.on('error', (error) => {
        console.error('❌ Error generating PDF:', error);
        reject(error);
      });
      
    } catch (error) {
      console.error('❌ Error creating PDF:', error);
      reject(error);
    }
  });
}

/**
 * ==========================================
 * MODERN MINIMALIST LAYOUT
 * Clean, contemporary with blue accent color
 * ==========================================
 */
function renderModernLayout(doc, data) {
  const ACCENT = '#3B82F6';  // Vibrant blue
  const DARK = '#1F2937';     // Almost black
  const GRAY = '#6B7280';     // Medium gray
  const LIGHT = '#E5E7EB';    // Light gray
  
  let y = 45;
  
  // ===== HEADER WITH ACCENT BAR =====
  doc.rect(0, 0, 612, 130).fill('#F9FAFB'); // Light background
  doc.rect(20, 35, 4, 70).fill(ACCENT); // Accent bar
  
  // Name
  doc.fontSize(30)
     .font('Helvetica-Bold')
     .fillColor(DARK)
     .text(data.personalInfo?.fullName || 'Your Name', 35, y);
  
  y += 38;
  
  // Contact - with icons
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor(GRAY);
  
  const contacts = [];
  if (data.personalInfo?.email) contacts.push(`✉ ${data.personalInfo.email}`);
  if (data.personalInfo?.phone) contacts.push(`☎ ${data.personalInfo.phone}`);
  if (data.personalInfo?.location) contacts.push(`📍 ${data.personalInfo.location}`);
  
  doc.text(contacts.join('   '), 35, y, { width: 540 });
  y += 12;
  
  // Links
  if (data.personalInfo?.linkedin || data.personalInfo?.github || data.personalInfo?.website) {
    const links = [];
    if (data.personalInfo.linkedin) links.push(`🔗 ${data.personalInfo.linkedin.replace('https://', '').replace('www.', '')}`);
    if (data.personalInfo.github) links.push(`💻 ${data.personalInfo.github.replace('https://', '').replace('www.', '')}`);
    if (data.personalInfo.website) links.push(`🌐 ${data.personalInfo.website.replace('https://', '').replace('www.', '')}`);
    
    doc.fillColor(ACCENT)
       .text(links.join('   '), 35, y, { width: 540 });
    y += 20;
  }
  
  y = 145; // Start content below header background
  
  // ===== PROFESSIONAL SUMMARY =====
  if (data.summary) {
    // Section header with underline
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor(ACCENT)
       .text('PROFESSIONAL SUMMARY', 50, y);
    doc.rect(50, y + 15, 40, 2).fill(ACCENT);
    y += 25;
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor(DARK)
       .text(data.summary, 50, y, { width: 512, align: 'justify', lineGap: 2 });
    y += doc.heightOfString(data.summary, { width: 512 }) + 20;
  }
  
  // ===== EXPERIENCE =====
  if (data.experience && data.experience.length > 0) {
    checkPageBreak(doc, y, 80);
    if (y < 50) y = 50; // Reset after page break
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor(ACCENT)
       .text('EXPERIENCE', 50, y);
    doc.rect(50, y + 15, 40, 2).fill(ACCENT);
    y += 25;
    
    data.experience.forEach((exp) => {
      checkPageBreak(doc, y, 60);
      if (y < 50) y = 50;
      
      // Position
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(DARK)
         .text(exp.position || 'Position', 50, y);
      y += 14;
      
      // Company & Location
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(ACCENT)
         .text(exp.company || 'Company', 50, y, { continued: true })
         .font('Helvetica')
         .fillColor(GRAY)
         .text(exp.location ? ` • ${exp.location}` : '', { continued: false });
      y += 13;
      
      // Dates
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .fillColor(GRAY)
         .text(`${exp.startDate || ''} - ${exp.endDate || ''}`, 50, y);
      y += 16;
      
      // Responsibilities
      if (exp.responsibilities && exp.responsibilities.length > 0) {
        exp.responsibilities.forEach(resp => {
          checkPageBreak(doc, y, 30);
          if (y < 50) y = 50;
          
          doc.fontSize(9.5)
             .font('Helvetica')
             .fillColor(DARK)
             .text('•', 55, y)
             .text(resp, 68, y, { width: 494, lineGap: 1 });
          
          y += doc.heightOfString(resp, { width: 494 }) + 5;
        });
      }
      
      y += 12;
    });
  }
  
  // ===== EDUCATION =====
  if (data.education && data.education.length > 0) {
    checkPageBreak(doc, y, 60);
    if (y < 50) y = 50;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor(ACCENT)
       .text('EDUCATION', 50, y);
    doc.rect(50, y + 15, 40, 2).fill(ACCENT);
    y += 25;
    
    data.education.forEach(edu => {
      checkPageBreak(doc, y, 40);
      if (y < 50) y = 50;
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(DARK)
         .text(edu.degree || 'Degree', 50, y);
      y += 13;
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(GRAY)
         .text(`${edu.institution || 'Institution'}${edu.location ? ' • ' + edu.location : ''}`, 50, y);
      y += 12;
      
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .text(`${edu.graduationDate || ''}${edu.gpa ? ' • GPA: ' + edu.gpa : ''}`, 50, y);
      y += 20;
    });
  }
  
  // ===== SKILLS =====
  if (data.skills?.technical && data.skills.technical.length > 0) {
    checkPageBreak(doc, y, 50);
    if (y < 50) y = 50;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor(ACCENT)
       .text('SKILLS', 50, y);
    doc.rect(50, y + 15, 40, 2).fill(ACCENT);
    y += 25;
    
    doc.fontSize(9.5)
       .font('Helvetica')
       .fillColor(DARK)
       .text(data.skills.technical.join(' • '), 50, y, { width: 512, lineGap: 2 });
    y += doc.heightOfString(data.skills.technical.join(' • '), { width: 512 }) + 15;
  }
  
  // ===== PROJECTS =====
  if (data.projects && data.projects.length > 0) {
    checkPageBreak(doc, y, 60);
    if (y < 50) y = 50;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor(ACCENT)
       .text('PROJECTS', 50, y);
    doc.rect(50, y + 15, 40, 2).fill(ACCENT);
    y += 25;
    
    data.projects.forEach(project => {
      checkPageBreak(doc, y, 40);
      if (y < 50) y = 50;
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(DARK)
         .text(project.name || project, 50, y);
      y += 13;
      
      if (typeof project === 'object' && project.description) {
        doc.fontSize(9.5)
           .font('Helvetica')
           .text(project.description, 50, y, { width: 512 });
        y += doc.heightOfString(project.description, { width: 512 }) + 8;
      }
    });
  }
  
  // ===== CERTIFICATIONS =====
  if (data.certifications && data.certifications.length > 0) {
    checkPageBreak(doc, y, 50);
    if (y < 50) y = 50;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor(ACCENT)
       .text('CERTIFICATIONS', 50, y);
    doc.rect(50, y + 15, 40, 2).fill(ACCENT);
    y += 25;
    
    data.certifications.forEach(cert => {
      doc.fontSize(9.5)
         .font('Helvetica')
         .fillColor(DARK)
         .text(`• ${cert}`, 50, y, { width: 512 });
      y += 14;
    });
  }
}

/**
 * ==========================================
 * CLASSIC PROFESSIONAL LAYOUT
 * Traditional, serif fonts, formal structure
 * ==========================================
 */
function renderClassicLayout(doc, data) {
  const DARK = '#000000';
  const GRAY = '#444444';
  
  let y = 60;
  
  // ===== HEADER - CENTERED, TRADITIONAL =====
  doc.fontSize(22)
     .font('Times-Bold')
     .fillColor(DARK)
     .text((data.personalInfo?.fullName || 'YOUR NAME').toUpperCase(), 50, y, { align: 'center', width: 512 });
  y += 30;
  
  // Contact - centered
  doc.fontSize(10)
     .font('Times-Roman')
     .fillColor(GRAY);
  
  const contact1 = [data.personalInfo?.email, data.personalInfo?.phone].filter(Boolean).join(' | ');
  if (contact1) {
    doc.text(contact1, 50, y, { align: 'center', width: 512 });
    y += 12;
  }
  
  const contact2 = [data.personalInfo?.location, data.personalInfo?.linkedin?.replace('https://', '')].filter(Boolean).join(' | ');
  if (contact2) {
    doc.text(contact2, 50, y, { align: 'center', width: 512 });
    y += 25;
  } else {
    y += 18;
  }
  
  // Horizontal rule
  doc.moveTo(100, y).lineTo(512, y).stroke(GRAY);
  y += 20;
  
  doc.fillColor(DARK);
  
  // ===== OBJECTIVE/SUMMARY =====
  if (data.summary) {
    doc.fontSize(11)
       .font('Times-Bold')
       .text('PROFESSIONAL SUMMARY', 50, y);
    y += 18;
    
    doc.fontSize(10)
       .font('Times-Roman')
       .text(data.summary, 50, y, { width: 512, align: 'justify' });
    y += doc.heightOfString(data.summary, { width: 512 }) + 18;
  }
  
  // ===== EXPERIENCE =====
  if (data.experience && data.experience.length > 0) {
    checkPageBreak(doc, y, 70);
    if (y < 50) y = 50;
    
    doc.fontSize(11)
       .font('Times-Bold')
       .text('PROFESSIONAL EXPERIENCE', 50, y);
    y += 18;
    
    data.experience.forEach((exp) => {
      checkPageBreak(doc, y, 50);
      if (y < 50) y = 50;
      
      // Company name - bold
      doc.fontSize(11)
         .font('Times-Bold')
         .text(exp.company || 'Company', 50, y);
      y += 14;
      
      // Position & Dates
      doc.fontSize(10)
         .font('Times-Italic')
         .text(`${exp.position || 'Position'} • ${exp.startDate || ''} - ${exp.endDate || ''}`, 50, y);
      y += 14;
      
      // Location
      if (exp.location) {
        doc.fontSize(9)
           .font('Times-Roman')
           .fillColor(GRAY)
           .text(exp.location, 50, y);
        y += 12;
        doc.fillColor(DARK);
      }
      
      // Responsibilities
      if (exp.responsibilities && exp.responsibilities.length > 0) {
        exp.responsibilities.forEach(resp => {
          checkPageBreak(doc, y, 25);
          if (y < 50) y = 50;
          
          doc.fontSize(10)
             .font('Times-Roman')
             .text('•', 60, y)
             .text(resp, 75, y, { width: 487 });
          
          y += doc.heightOfString(resp, { width: 487 }) + 5;
        });
      }
      
      y += 12;
    });
  }
  
  // ===== EDUCATION =====
  if (data.education && data.education.length > 0) {
    checkPageBreak(doc, y, 60);
    if (y < 50) y = 50;
    
    doc.fontSize(11)
       .font('Times-Bold')
       .text('EDUCATION', 50, y);
    y += 18;
    
    data.education.forEach(edu => {
      checkPageBreak(doc, y, 35);
      if (y < 50) y = 50;
      
      doc.fontSize(10)
         .font('Times-Bold')
         .text(`${edu.degree || 'Degree'}${edu.field ? ', ' + edu.field : ''}`, 50, y);
      y += 13;
      
      doc.fontSize(10)
         .font('Times-Roman')
         .text(`${edu.institution || 'Institution'}${edu.location ? ', ' + edu.location : ''}`, 50, y);
      y += 12;
      
      doc.fontSize(9)
         .font('Times-Italic')
         .fillColor(GRAY)
         .text(`${edu.graduationDate || ''}${edu.gpa ? ' • GPA: ' + edu.gpa : ''}`, 50, y);
      y += 18;
      doc.fillColor(DARK);
    });
  }
  
  // ===== SKILLS =====
  if (data.skills?.technical && data.skills.technical.length > 0) {
    checkPageBreak(doc, y, 50);
    if (y < 50) y = 50;
    
    doc.fontSize(11)
       .font('Times-Bold')
       .text('TECHNICAL SKILLS', 50, y);
    y += 18;
    
    doc.fontSize(10)
       .font('Times-Roman')
       .text(data.skills.technical.join(', '), 50, y, { width: 512 });
    y += doc.heightOfString(data.skills.technical.join(', '), { width: 512 }) + 15;
  }
  
  // ===== CERTIFICATIONS =====
  if (data.certifications && data.certifications.length > 0) {
    checkPageBreak(doc, y, 50);
    if (y < 50) y = 50;
    
    doc.fontSize(11)
       .font('Times-Bold')
       .text('CERTIFICATIONS', 50, y);
    y += 18;
    
    data.certifications.forEach(cert => {
      doc.fontSize(10)
         .font('Times-Roman')
         .text(`• ${cert}`, 60, y, { width: 502 });
      y += 14;
    });
  }
  
  // ===== PROJECTS =====
  if (data.projects && data.projects.length > 0) {
    checkPageBreak(doc, y, 50);
    if (y < 50) y = 50;
    
    doc.fontSize(11)
       .font('Times-Bold')
       .text('PROJECTS', 50, y);
    y += 18;
    
    data.projects.forEach(project => {
      checkPageBreak(doc, y, 30);
      if (y < 50) y = 50;
      
      const projectName = typeof project === 'object' ? project.name : project;
      doc.fontSize(10)
         .font('Times-Bold')
         .text(projectName || 'Project', 50, y);
      y += 12;
      
      if (typeof project === 'object' && project.description) {
        doc.fontSize(10)
           .font('Times-Roman')
           .text(project.description, 60, y, { width: 502 });
        y += doc.heightOfString(project.description, { width: 502 }) + 8;
      }
    });
  }
}

/**
 * ==========================================
 * TECHNICAL/ACADEMIC LAYOUT (CurVe Style)
 * Dense, two-column when possible, research-focused
 * ==========================================
 */
function renderTechnicalLayout(doc, data) {
  const PRIMARY = '#1E40AF'; // Deep blue
  const DARK = '#111827';
  const GRAY = '#4B5563';
  
  let y = 35;
  
  // ===== COMPACT HEADER =====
  // Name
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .fillColor(PRIMARY)
     .text((data.personalInfo?.fullName || 'YOUR NAME').toUpperCase(), 40, y);
  y += 24;
  
  // Contact - compact, two-line max
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor(GRAY);
  
  const line1 = [];
  if (data.personalInfo?.email) line1.push(`✉ ${data.personalInfo.email}`);
  if (data.personalInfo?.phone) line1.push(`☎ ${data.personalInfo.phone}`);
  if (data.personalInfo?.location) line1.push(`📍 ${data.personalInfo.location}`);
  
  doc.text(line1.join('  |  '), 40, y, { width: 532 });
  y += 10;
  
  const line2 = [];
  if (data.personalInfo?.linkedin) line2.push(`🔗 ${data.personalInfo.linkedin.replace('https://', '').replace('www.', '')}`);
  if (data.personalInfo?.github) line2.push(`💻 ${data.personalInfo.github.replace('https://', '').replace('www.', '')}`);
  if (data.personalInfo?.website) line2.push(`🌐 ${data.personalInfo.website.replace('https://', '').replace('www.', '')}`);
  
  if (line2.length > 0) {
    doc.text(line2.join('  |  '), 40, y, { width: 532 });
    y += 12;
  } else {
    y += 5;
  }
  
  // Separator
  doc.rect(40, y, 532, 1).fill(PRIMARY);
  y += 10;
  
  doc.fillColor(DARK);
  
  // ===== RESEARCH INTERESTS / SUMMARY (if exists) =====
  if (data.summary) {
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(PRIMARY)
       .text('RESEARCH INTERESTS / SUMMARY', 40, y);
    y += 12;
    
    doc.fontSize(8.5)
       .font('Helvetica')
       .fillColor(DARK)
       .text(data.summary, 40, y, { width: 532, align: 'justify', lineGap: 1 });
    y += doc.heightOfString(data.summary, { width: 532 }) + 10;
  }
  
  // ===== EDUCATION (High priority for academic) =====
  if (data.education && data.education.length > 0) {
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(PRIMARY)
       .text('EDUCATION', 40, y);
    y += 12;
    
    data.education.forEach(edu => {
      checkPageBreak(doc, y, 30);
      if (y < 35) y = 35;
      
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor(DARK)
         .text(edu.degree || 'Degree', 40, y);
      y += 11;
      
      doc.fontSize(8.5)
         .font('Helvetica')
         .text(`${edu.institution || 'Institution'}${edu.location ? ', ' + edu.location : ''}`, 40, y);
      y += 10;
      
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .fillColor(GRAY)
         .text(`${edu.graduationDate || ''}${edu.gpa ? ' • GPA: ' + edu.gpa : ''}${edu.field ? ' • ' + edu.field : ''}`, 40, y);
      y += 14;
      doc.fillColor(DARK);
    });
    
    y += 5;
  }
  
  // ===== EXPERIENCE =====
  if (data.experience && data.experience.length > 0) {
    checkPageBreak(doc, y, 60);
    if (y < 35) y = 35;
    
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(PRIMARY)
       .text('PROFESSIONAL EXPERIENCE', 40, y);
    y += 12;
    
    data.experience.forEach((exp) => {
      checkPageBreak(doc, y, 50);
      if (y < 35) y = 35;
      
      // Position | Company
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor(DARK)
         .text(`${exp.position || 'Position'} | ${exp.company || 'Company'}`, 40, y);
      y += 11;
      
      // Dates & Location
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .fillColor(GRAY)
         .text(`${exp.startDate || ''} - ${exp.endDate || ''}${exp.location ? ' • ' + exp.location : ''}`, 40, y);
      y += 12;
      doc.fillColor(DARK);
      
      // Responsibilities - compact
      if (exp.responsibilities && exp.responsibilities.length > 0) {
        exp.responsibilities.forEach(resp => {
          checkPageBreak(doc, y, 25);
          if (y < 35) y = 35;
          
          doc.fontSize(8.5)
             .font('Helvetica')
             .text('▸', 45, y)
             .text(resp, 55, y, { width: 517, lineGap: 0 });
          
          y += doc.heightOfString(resp, { width: 517 }) + 4;
        });
      }
      
      y += 8;
    });
    
    y += 3;
  }
  
  // ===== TECHNICAL SKILLS (Categorized) =====
  if (data.skills?.technical && data.skills.technical.length > 0) {
    checkPageBreak(doc, y, 40);
    if (y < 35) y = 35;
    
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(PRIMARY)
       .text('TECHNICAL SKILLS', 40, y);
    y += 12;
    
    doc.fontSize(8.5)
       .font('Helvetica')
       .fillColor(DARK)
       .text(data.skills.technical.join(' • '), 40, y, { width: 532, lineGap: 1 });
    y += doc.heightOfString(data.skills.technical.join(' • '), { width: 532 }) + 12;
  }
  
  // ===== PROJECTS / RESEARCH =====
  if (data.projects && data.projects.length > 0) {
    checkPageBreak(doc, y, 50);
    if (y < 35) y = 35;
    
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(PRIMARY)
       .text('PROJECTS & RESEARCH', 40, y);
    y += 12;
    
    data.projects.forEach(project => {
      checkPageBreak(doc, y, 30);
      if (y < 35) y = 35;
      
      const projectName = typeof project === 'object' ? project.name : project;
      doc.fontSize(8.5)
         .font('Helvetica-Bold')
         .fillColor(DARK)
         .text(projectName || 'Project', 40, y);
      y += 10;
      
      if (typeof project === 'object' && project.description) {
        doc.fontSize(8)
           .font('Helvetica')
           .text(project.description, 45, y, { width: 527, lineGap: 0 });
        y += doc.heightOfString(project.description, { width: 527 }) + 6;
      }
    });
    
    y += 5;
  }
  
  // ===== CERTIFICATIONS =====
  if (data.certifications && data.certifications.length > 0) {
    checkPageBreak(doc, y, 40);
    if (y < 35) y = 35;
    
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(PRIMARY)
       .text('CERTIFICATIONS & TRAINING', 40, y);
    y += 12;
    
    data.certifications.forEach(cert => {
      doc.fontSize(8.5)
         .font('Helvetica')
         .fillColor(DARK)
         .text(`• ${cert}`, 45, y, { width: 527 });
      y += 11;
    });
    
    y += 5;
  }
  
  // ===== ACHIEVEMENTS (if exists) =====
  if (data.achievements && data.achievements.length > 0) {
    checkPageBreak(doc, y, 40);
    if (y < 35) y = 35;
    
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor(PRIMARY)
       .text('ACHIEVEMENTS & HONORS', 40, y);
    y += 12;
    
    data.achievements.forEach(ach => {
      doc.fontSize(8.5)
         .font('Helvetica')
         .fillColor(DARK)
         .text(`• ${ach}`, 45, y, { width: 527 });
      y += 11;
    });
  }
}

/**
 * Helper: Check if page break is needed
 */
function checkPageBreak(doc, currentY, requiredSpace) {
  if (currentY + requiredSpace > 720) {
    doc.addPage();
    return 50; // Reset Y position
  }
  return currentY;
}

/**
 * Generate DOCX resume (placeholder)
 */
export async function generateDOCX(resumeData, layoutStyle = 'modern') {
  // For now, return text version
  return generateTextResume(resumeData);
}

/**
 * Generate plain text resume
 */
export function generateTextResume(resumeData) {
  let text = '';
  
  // Header
  text += `${resumeData.personalInfo?.fullName || 'YOUR NAME'}\n`;
  text += `${resumeData.personalInfo?.email || ''} | ${resumeData.personalInfo?.phone || ''}\n`;
  text += `${resumeData.personalInfo?.location || ''}\n\n`;
  
  // Summary
  if (resumeData.summary) {
    text += `SUMMARY\n${resumeData.summary}\n\n`;
  }
  
  // Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    text += `EXPERIENCE\n`;
    resumeData.experience.forEach(exp => {
      text += `\n${exp.position} | ${exp.company}\n`;
      text += `${exp.startDate} - ${exp.endDate}\n`;
      if (exp.responsibilities) {
        exp.responsibilities.forEach(r => text += `• ${r}\n`);
      }
    });
    text += '\n';
  }
  
  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    text += `EDUCATION\n`;
    resumeData.education.forEach(edu => {
      text += `${edu.degree} - ${edu.institution} (${edu.graduationDate})\n`;
    });
    text += '\n';
  }
  
  // Skills
  if (resumeData.skills?.technical) {
    text += `SKILLS\n${resumeData.skills.technical.join(', ')}\n\n`;
  }
  
  return text;
}

/**
 * Cleanup temporary file
 */
export function cleanupTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️  Cleaned up temp file:', filePath);
    }
  } catch (error) {
    console.error('❌ Error cleaning up file:', error);
  }
}

export default {
  generatePDF,
  generateDOCX,
  generateTextResume,
  cleanupTempFile
};
