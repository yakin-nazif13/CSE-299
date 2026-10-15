/**
 * API Service - Handles all API calls to the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Resume API endpoints
 */
export const resumeAPI = {
  /**
   * Upload and parse a resume file
   */
  parseResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/resume/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Get layout recommendation
   */
  recommendLayout: async (resumeData, targetRole = '') => {
    const response = await api.post('/resume/recommend-layout', {
      resumeData,
      targetRole,
    });
    
    return response.data;
  },

  /**
   * Generate enhanced resume content
   */
  generateResume: async (resumeData, targetRole = '', targetIndustry = '') => {
    const response = await api.post('/resume/generate', {
      resumeData,
      targetRole,
      targetIndustry,
    });
    
    return response.data;
  },

  /**
   * Export resume as PDF
   */
  exportPDF: async (resumeData, layoutStyle = 'modern') => {
    const response = await api.post('/resume/export/pdf', {
      resumeData,
      layoutStyle,
    }, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resume.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Export resume as DOCX
   */
  exportDOCX: async (resumeData) => {
    const response = await api.post('/resume/export/docx', {
      resumeData,
    }, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resume.txt');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Get improvement suggestions for a section
   */
  improveSectionRequest: async (section, sectionType) => {
    const response = await api.post('/resume/improve', {
      section,
      sectionType,
    });
    
    return response.data;
  },

  /**
   * Save resume to database
   */
  saveResume: async (resumeData) => {
    const response = await api.post('/resume/save', resumeData);
    return response.data;
  },

  /**
   * Get all user resumes
   */
  listResumes: async () => {
    const response = await api.get('/resume/list');
    return response.data;
  },

  /**
   * Get specific resume by ID
   */
  getResume: async (id) => {
    const response = await api.get(`/resume/${id}`);
    return response.data;
  },

  /**
   * Update resume
   */
  updateResume: async (id, resumeData) => {
    const response = await api.put(`/resume/${id}`, resumeData);
    return response.data;
  },

  /**
   * Delete resume
   */
  deleteResume: async (id) => {
    const response = await api.delete(`/resume/${id}`);
    return response.data;
  },
};

/**
 * AI API endpoints
 */
export const aiAPI = {
  /**
   * Send message to career coach
   */
  chat: async (message, conversationHistory = [], resumeData = {}) => {
    const response = await api.post('/ai/chat', {
      message,
      conversationHistory,
      resumeData,
    });
    
    return response.data;
  },

  /**
   * Check AI service health
   */
  healthCheck: async () => {
    const response = await api.get('/ai/health');
    return response.data;
  },
};

/**
 * Auth API endpoints
 */
export const authAPI = {
  /**
   * Sign up new user
   */
  signup: async (fullName, email, password) => {
    const response = await api.post('/auth/signup', {
      fullName,
      email,
      password,
    });
    
    // Store token in localStorage
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    // Store token in localStorage
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    return response.data;
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default {
  resumeAPI,
  aiAPI,
  authAPI,
};
