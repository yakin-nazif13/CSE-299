/**
 * AI Resume Builder - Main Application
 * 
 * A comprehensive resume builder with AI assistance
 * Features: File upload, manual entry, AI generation, chat assistant, export
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileUp, Sparkles, MessageSquare, Download, 
  ChevronRight, Check, X, Loader, Edit, Save,
  Layout, User, Briefcase, GraduationCap, Code,
  Send, Bot, RefreshCw, ArrowLeft
} from 'lucide-react';
import { resumeAPI, aiAPI, authAPI } from './services/api';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import './index.css';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'dashboard', 'builder'
  const [editingResume, setEditingResume] = useState(null); // Resume being edited
  
  // Main state
  const [currentStep, setCurrentStep] = useState(1); // 1-6 for each step
  const [resumeData, setResumeData] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState('Modern Minimalist'); // Default layout
  const [generatedResume, setGeneratedResume] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Manual entry state
  const [manualData, setManualData] = useState({
    personalInfo: { fullName: '', email: '', phone: '', location: '' },
    experience: [],
    education: [],
    skills: { technical: [], soft: [] },
  });

  // Check for existing authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        // Verify token with backend
        const response = await authAPI.getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          setCurrentView('dashboard');
        } else {
          // Invalid token, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setCurrentView('login');
        }
      } else {
        setCurrentView('login');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      // If token is invalid, clear storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setCurrentView('login');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('login');
    // Reset all state
    setCurrentStep(1);
    setResumeData(null);
    setGeneratedResume(null);
    setEditingResume(null);
  };

  const handleCreateNew = () => {
    // Reset builder state
    setCurrentStep(1);
    setResumeData(null);
    setGeneratedResume(null);
    setEditingResume(null);
    setSelectedLayout('Modern Minimalist');
    setManualData({
      personalInfo: { fullName: '', email: '', phone: '', location: '' },
      experience: [],
      education: [],
      skills: { technical: [], soft: [] },
    });
    setCurrentView('builder');
  };

  const handleEditResume = (resume) => {
    setEditingResume(resume);
    setResumeData(resume);
    setGeneratedResume(resume);
    setSelectedLayout(resume.layout || 'Modern Minimalist');
    setCurrentStep(5); // Go to edit step
    setCurrentView('builder');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentStep(1);
  };

  // Save resume to database (called from Export step)
  const handleSaveResume = async () => {
    if (!generatedResume && !resumeData) return;

    try {
      setLoading(true);
      const dataToSave = {
        ...generatedResume,
        layout: selectedLayout,
      };

      if (editingResume) {
        // Update existing resume
        await resumeAPI.updateResume(editingResume._id, dataToSave);
        setSuccess('Resume updated successfully!');
      } else {
        // Create new resume
        await resumeAPI.saveResume(dataToSave);
        setSuccess('Resume saved successfully!');
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save resume. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Steps configuration
  const steps = [
    { number: 1, name: 'Get Started', icon: User },
    { number: 2, name: 'Information', icon: FileUp },
    { number: 3, name: 'Choose Layout', icon: Layout },
    { number: 4, name: 'Generate', icon: Sparkles },
    { number: 5, name: 'Edit & Refine', icon: Edit },
    { number: 6, name: 'Export', icon: Download },
  ];

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Login page
  if (currentView === 'login') {
    return <Login onLogin={handleLogin} onSwitchToSignup={() => setCurrentView('signup')} />;
  }

  // Show Signup page
  if (currentView === 'signup') {
    return <Signup onSignup={handleSignup} onSwitchToLogin={() => setCurrentView('login')} />;
  }

  // Show Dashboard
  if (currentView === 'dashboard') {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onCreateNew={handleCreateNew}
        onEditResume={handleEditResume}
      />
    );
  }

  // Show Resume Builder (currentView === 'builder')


  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 mesh-background opacity-20"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      {/* Header */}
      <header className="glass-strong backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back to Dashboard Button */}
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 px-3 py-2 glass-dark text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all hover-lift"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-semibold">Dashboard</span>
              </button>
              
              <div className="flex items-center gap-3 float-slow">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">
                    <span className="gradient-text">AI Resume Builder</span>
                  </h1>
                  {editingResume && (
                    <p className="text-xs text-white/70">Editing: {editingResume.title}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* AI Chat Button - Available from step 2 onwards */}
            {currentStep >= 2 && (
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="flex items-center gap-2 px-5 py-3 btn-premium text-white rounded-xl shadow-lg glow-hover"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline font-bold">AI Career Coach</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      {currentStep > 1 && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-strong backdrop-blur-xl rounded-2xl p-6 border border-white/30 fade-in">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.number 
                        ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg scale-110' 
                        : 'glass text-white/50'
                    }`}>
                      {currentStep > step.number ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-semibold transition-colors ${
                      currentStep >= step.number ? 'text-white' : 'text-white/50'
                    }`}>{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded-full transition-all duration-300 ${
                      currentStep > step.number ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {/* Notifications */}
        {error && (
          <div className="mb-6 p-5 glass-dark border border-red-400/30 rounded-2xl flex items-start gap-4 slide-in-down">
            <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 font-bold text-lg">Error</p>
              <p className="text-red-200">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-5 glass border border-green-400/30 rounded-2xl flex items-start gap-4 slide-in-down">
            <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-300 font-bold text-lg">Success</p>
              <p className="text-green-200">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <WelcomeStep onNext={() => setCurrentStep(2)} />
        )}
        
        {currentStep === 2 && (
          <InformationStep 
            onNext={(data) => {
              setResumeData(data);
              setCurrentStep(3);
            }}
            setError={setError}
            setLoading={setLoading}
            loading={loading}
          />
        )}
        
        {currentStep === 3 && resumeData && (
          <LayoutStep 
            resumeData={resumeData}
            onNext={(layout) => {
              setSelectedLayout(layout);
              setCurrentStep(4);
            }}
            onBack={() => setCurrentStep(2)}
            setError={setError}
            setLoading={setLoading}
            loading={loading}
          />
        )}
        
        {currentStep === 4 && resumeData && selectedLayout && (
          <GenerateStep 
            resumeData={resumeData}
            layout={selectedLayout}
            onNext={(enhanced) => {
              setGeneratedResume(enhanced);
              setCurrentStep(5);
            }}
            onBack={() => setCurrentStep(3)}
            setError={setError}
            setSuccess={setSuccess}
            setLoading={setLoading}
            loading={loading}
          />
        )}
        
        {currentStep === 5 && generatedResume && (
          <EditStep 
            resume={generatedResume}
            layout={selectedLayout}
            onUpdate={setGeneratedResume}
            onNext={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
            setError={setError}
          />
        )}
        
        {currentStep === 6 && generatedResume && (
          <ExportStep 
            resume={generatedResume}
            layout={selectedLayout}
            onBack={() => setCurrentStep(5)}
            onSave={handleSaveResume}
            setError={setError}
            setSuccess={setSuccess}
            setLoading={setLoading}
            loading={loading}
          />
        )}
      </main>

      {/* AI Chat Sidebar */}
      {chatOpen && resumeData && (
        <ChatSidebar 
          resumeData={generatedResume || resumeData}
          onClose={() => setChatOpen(false)}
          messages={chatMessages}
          setMessages={setChatMessages}
        />
      )}
    </div>
  );
}

// Step 1: Welcome Screen
function WelcomeStep({ onNext }) {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="mb-8">
        <Sparkles className="w-20 h-20 mx-auto text-blue-600 mb-4" />
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to AI Resume Builder
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create a professional, ATS-friendly resume in minutes with the power of AI
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <FeatureCard 
          icon={<FileUp className="w-8 h-8" />}
          title="Import or Create"
          description="Upload your existing resume or build from scratch"
        />
        <FeatureCard 
          icon={<Sparkles className="w-8 h-8" />}
          title="AI Enhancement"
          description="Let AI optimize your content and suggest improvements"
        />
        <FeatureCard 
          icon={<MessageSquare className="w-8 h-8" />}
          title="Career Coaching"
          description="Get personalized advice from our AI career coach"
        />
      </div>

      <button
        onClick={onNext}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
      >
        Get Started
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="text-blue-600 mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

// Step 2: Information Entry
function InformationStep({ onNext, setError, setLoading, loading }) {
  const [mode, setMode] = useState(null); // 'upload' or 'manual'
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const response = await resumeAPI.parseResume(file);
      
      if (response.success) {
        setParsedData(response.data);
        setMode('upload');
      } else {
        setError(response.error || 'Failed to parse resume');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    setMode('manual');
  };

  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-center">How would you like to start?</h2>
        <p className="text-gray-600 text-center mb-8">Choose your preferred method</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Option */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <FileUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Upload Resume</h3>
            <p className="text-gray-600 text-sm">
              Import from PDF or DOCX file
            </p>
            {loading && <Loader className="w-5 h-5 animate-spin mx-auto mt-4" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Manual Entry Option */}
          <button
            onClick={handleManualEntry}
            className="p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all"
          >
            <Edit className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Start From Scratch</h3>
            <p className="text-gray-600 text-sm">
              Enter your information manually
            </p>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'upload' && parsedData) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Review Extracted Information</h2>
        <p className="text-gray-600 mb-6">Please verify and edit if needed</p>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <DataReviewForm data={parsedData} onSubmit={onNext} />
        </div>
      </div>
    );
  }

  if (mode === 'manual') {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Enter Your Information</h2>
        <p className="text-gray-600 mb-6">Fill in your details below</p>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <ManualEntryForm onSubmit={onNext} />
        </div>
      </div>
    );
  }
}

// Data Review Component (for uploaded resumes)
function DataReviewForm({ data, onSubmit }) {
  const [formData, setFormData] = useState(data);

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <div>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.personalInfo?.fullName || ''}
            onChange={(e) => setFormData({
              ...formData,
              personalInfo: { ...formData.personalInfo, fullName: e.target.value }
            })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.personalInfo?.email || ''}
            onChange={(e) => setFormData({
              ...formData,
              personalInfo: { ...formData.personalInfo, email: e.target.value }
            })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.personalInfo?.phone || ''}
            onChange={(e) => setFormData({
              ...formData,
              personalInfo: { ...formData.personalInfo, phone: e.target.value }
            })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.personalInfo?.location || ''}
            onChange={(e) => setFormData({
              ...formData,
              personalInfo: { ...formData.personalInfo, location: e.target.value }
            })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="url"
            placeholder="LinkedIn URL"
            value={formData.personalInfo?.linkedin || ''}
            onChange={(e) => setFormData({
              ...formData,
              personalInfo: { ...formData.personalInfo, linkedin: e.target.value }
            })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="url"
            placeholder="GitHub URL"
            value={formData.personalInfo?.github || ''}
            onChange={(e) => setFormData({
              ...formData,
              personalInfo: { ...formData.personalInfo, github: e.target.value }
            })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Professional Summary */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Professional Summary</h3>
        <textarea
          placeholder="Professional summary..."
          value={formData.summary || ''}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          rows="3"
        />
      </div>

      {/* Experience Summary */}
      <div>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Experience ({formData.experience?.length || 0} positions)
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {formData.experience && formData.experience.length > 0 ? (
            formData.experience.map((exp, idx) => (
              <div key={idx} className="pb-2 border-b last:border-b-0 last:pb-0">
                <p className="font-medium">{exp.position || 'Position'} at {exp.company || 'Company'}</p>
                <p className="text-sm text-gray-600">{exp.startDate || 'Start'} - {exp.endDate || 'End'}</p>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{exp.responsibilities.length} responsibilities listed</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No experience data extracted</p>
          )}
        </div>
      </div>

      {/* Education Summary */}
      <div>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education ({formData.education?.length || 0} entries)
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {formData.education && formData.education.length > 0 ? (
            formData.education.map((edu, idx) => (
              <div key={idx} className="pb-2 border-b last:border-b-0 last:pb-0">
                <p className="font-medium">{edu.degree || 'Degree'} - {edu.field || 'Field'}</p>
                <p className="text-sm text-gray-600">{edu.institution || 'Institution'}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No education data extracted</p>
          )}
        </div>
      </div>

      {/* Skills Summary */}
      <div>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Skills ({formData.skills?.technical?.length || 0} listed)
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {formData.skills?.technical && formData.skills.technical.length > 0 ? (
            <p className="text-sm">{formData.skills.technical.join(', ')}</p>
          ) : (
            <p className="text-gray-500 text-sm">No skills extracted</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          ✓ Information extracted! You can edit any field above before continuing, or proceed to select a layout.
        </p>
      </div>

      <button
        onClick={() => onSubmit(formData)}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        Continue to Layout Selection
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Manual Entry Form
function ManualEntryForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
    summary: '',
    experience: [{ company: '', position: '', location: '', startDate: '', endDate: 'Present', responsibilities: [''] }],
    education: [{ institution: '', degree: '', field: '', location: '', graduationDate: '', gpa: '' }],
    skills: { technical: [], soft: [], languages: [] },
    projects: [],
    certifications: [],
    achievements: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [expIndex, setExpIndex] = useState(0);
  const [currentTab, setCurrentTab] = useState('personal');

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        skills: { ...formData.skills, technical: [...formData.skills.technical, skillInput.trim()] }
      });
      setSkillInput('');
    }
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: '', position: '', location: '', startDate: '', endDate: 'Present', responsibilities: [''] }]
    });
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...formData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData({ ...formData, experience: newExp });
  };

  const addResponsibility = (expIndex) => {
    const newExp = [...formData.experience];
    newExp[expIndex].responsibilities = [...newExp[expIndex].responsibilities, ''];
    setFormData({ ...formData, experience: newExp });
  };

  const updateResponsibility = (expIndex, respIndex, value) => {
    const newExp = [...formData.experience];
    newExp[expIndex].responsibilities[respIndex] = value;
    setFormData({ ...formData, experience: newExp });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: '', degree: '', field: '', location: '', graduationDate: '', gpa: '' }]
    });
  };

  const updateEducation = (index, field, value) => {
    const newEdu = [...formData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData({ ...formData, education: newEdu });
  };

  const handleSubmit = () => {
    if (!formData.personalInfo.fullName || !formData.personalInfo.email) {
      alert('Please fill in at least your name and email');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {['personal', 'experience', 'education', 'skills'].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              currentTab === tab 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Personal Information Tab */}
      {currentTab === 'personal' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.personalInfo.fullName}
              onChange={(e) => setFormData({
                ...formData,
                personalInfo: { ...formData.personalInfo, fullName: e.target.value }
              })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.personalInfo.email}
              onChange={(e) => setFormData({
                ...formData,
                personalInfo: { ...formData.personalInfo, email: e.target.value }
              })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.personalInfo.phone}
              onChange={(e) => setFormData({
                ...formData,
                personalInfo: { ...formData.personalInfo, phone: e.target.value }
              })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Location (City, State)"
              value={formData.personalInfo.location}
              onChange={(e) => setFormData({
                ...formData,
                personalInfo: { ...formData.personalInfo, location: e.target.value }
              })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="url"
              placeholder="LinkedIn Profile URL"
              value={formData.personalInfo.linkedin}
              onChange={(e) => setFormData({
                ...formData,
                personalInfo: { ...formData.personalInfo, linkedin: e.target.value }
              })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="url"
              placeholder="GitHub Profile URL"
              value={formData.personalInfo.github}
              onChange={(e) => setFormData({
                ...formData,
                personalInfo: { ...formData.personalInfo, github: e.target.value }
              })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="url"
              placeholder="Personal Website"
              value={formData.personalInfo.website}
              onChange={(e) => setFormData({
                ...formData,
                personalInfo: { ...formData.personalInfo, website: e.target.value }
              })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none col-span-2"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-2">Professional Summary</label>
            <textarea
              placeholder="Brief 2-3 sentence summary highlighting your experience and expertise..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="4"
            />
          </div>
        </div>
      )}

      {/* Experience Tab */}
      {currentTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Work Experience</h3>
            <button
              onClick={addExperience}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              + Add Experience
            </button>
          </div>
          
          {formData.experience.map((exp, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-gray-600">Experience #{idx + 1}</span>
                {formData.experience.length > 1 && (
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      experience: formData.experience.filter((_, i) => i !== idx)
                    })}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={exp.company}
                  onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Job Title"
                  value={exp.position}
                  onChange={(e) => updateExperience(idx, 'position', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={exp.location}
                  onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Start Date (e.g., Jan 2020)"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Key Responsibilities & Achievements</label>
                {exp.responsibilities.map((resp, respIdx) => (
                  <div key={respIdx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Describe achievement or responsibility..."
                      value={resp}
                      onChange={(e) => updateResponsibility(idx, respIdx, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {exp.responsibilities.length > 1 && (
                      <button
                        onClick={() => {
                          const newExp = [...formData.experience];
                          newExp[idx].responsibilities = newExp[idx].responsibilities.filter((_, i) => i !== respIdx);
                          setFormData({ ...formData, experience: newExp });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addResponsibility(idx)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Responsibility
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education Tab */}
      {currentTab === 'education' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Education</h3>
            <button
              onClick={addEducation}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              + Add Education
            </button>
          </div>
          
          {formData.education.map((edu, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-gray-600">Education #{idx + 1}</span>
                {formData.education.length > 1 && (
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      education: formData.education.filter((_, i) => i !== idx)
                    })}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Institution Name"
                  value={edu.institution}
                  onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Degree (e.g., Bachelor of Science)"
                  value={edu.degree}
                  onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Field of Study (e.g., Computer Science)"
                  value={edu.field}
                  onChange={(e) => updateEducation(idx, 'field', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={edu.location}
                  onChange={(e) => updateEducation(idx, 'location', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Graduation Date (e.g., May 2020)"
                  value={edu.graduationDate}
                  onChange={(e) => updateEducation(idx, 'graduationDate', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="GPA (Optional)"
                  value={edu.gpa}
                  onChange={(e) => updateEducation(idx, 'gpa', e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills Tab */}
      {currentTab === 'skills' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Skills</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={addSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.technical.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                {skill}
                <button
                  onClick={() => setFormData({
                    ...formData,
                    skills: { ...formData.skills, technical: formData.skills.technical.filter((_, i) => i !== idx) }
                  })}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        {currentTab !== 'personal' && (
          <button
            onClick={() => {
              const tabs = ['personal', 'experience', 'education', 'skills'];
              const currentIndex = tabs.indexOf(currentTab);
              if (currentIndex > 0) setCurrentTab(tabs[currentIndex - 1]);
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Previous
          </button>
        )}
        {currentTab !== 'skills' ? (
          <button
            onClick={() => {
              const tabs = ['personal', 'experience', 'education', 'skills'];
              const currentIndex = tabs.indexOf(currentTab);
              if (currentIndex < tabs.length - 1) setCurrentTab(tabs[currentIndex + 1]);
            }}
            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Next Section
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Continue to Layout Selection
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Step 3: Layout Selection (will continue in next file due to length)
function LayoutStep({ resumeData, onNext, onBack, setError, setLoading, loading }) {
  const [recommendation, setRecommendation] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Get AI recommendation when component mounts
    const getRecommendation = async () => {
      setLoading(true);
      try {
        const response = await resumeAPI.recommendLayout(resumeData);
        if (response.success) {
          setRecommendation(response.data);
          setSelected(response.data.recommendedLayout);
        }
      } catch (err) {
        setError('Failed to get layout recommendation');
      } finally {
        setLoading(false);
      }
    };

    getRecommendation();
  }, []);

  const layouts = [
    { name: 'Classic Professional', desc: 'Traditional, ATS-friendly' },
    { name: 'Modern Minimalist', desc: 'Clean, contemporary design' },
    { name: 'Technical Focus', desc: 'Highlights skills & projects' },
    { name: 'Executive', desc: 'Leadership-oriented' },
    { name: 'Academic', desc: 'Research-focused' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Choose Your Layout</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {recommendation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-blue-900 mb-2">AI Recommendation:</p>
              <p className="text-blue-800">{recommendation.reasoning}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {layouts.map((layout) => (
              <button
                key={layout.name}
                onClick={() => setSelected(layout.name)}
                className={`p-6 bg-white rounded-xl border-2 text-left hover:shadow-lg transition-all ${
                  selected === layout.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{layout.name}</h3>
                    <p className="text-gray-600 text-sm">{layout.desc}</p>
                  </div>
                  {selected === layout.name && (
                    <Check className="w-6 h-6 text-blue-600" />
                  )}
                  {recommendation?.recommendedLayout === layout.name && (
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => onNext(selected)}
              disabled={!selected}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue with {selected}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Step 4: Generate Resume
function GenerateStep({ resumeData, layout, onNext, onBack, setError, setSuccess, setLoading, loading }) {
  const [generating, setGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setLoading(true);
    setError(null);

    try {
      const response = await resumeAPI.generateResume(resumeData, targetRole, targetIndustry);
      
      if (response.success) {
        setSuccess('Resume generated successfully!');
        setTimeout(() => onNext(response.data), 1000);
      }
    } catch (err) {
      setError('Failed to generate resume. Please try again.');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Generate Your Resume</h2>
      <p className="text-gray-600 mb-6">Tell us about your target role for better customization</p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Target Job Role (Optional)</label>
          <input
            type="text"
            placeholder="e.g., Senior Software Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Industry (Optional)</label>
          <input
            type="text"
            placeholder="e.g., FinTech, Healthcare, E-commerce"
            value={targetIndustry}
            onChange={(e) => setTargetIndustry(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Our AI will optimize your resume content with action verbs, quantified achievements, 
            and industry-specific keywords while maintaining your authentic voice.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={generating}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating Your Resume...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate with AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Step 5: Edit Resume
function EditStep({ resume, layout, onUpdate, onNext, onBack, setError }) {
  const [editing, setEditing] = useState(true);
  const [editedResume, setEditedResume] = useState(resume);

  const handleSaveAndContinue = () => {
    onUpdate(editedResume);
    onNext();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Review & Edit</h2>
          <p className="text-gray-600">
            {editing ? 'Click any text to edit it' : 'Preview your resume'}
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            editing 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {editing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          {editing ? 'Editing Mode (Click to Preview)' : 'Enable Editing'}
        </button>
      </div>

      {editing && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900 text-sm flex items-center gap-2">
            <Edit className="w-4 h-4" />
            <strong>Edit Mode Active:</strong> Click on any field below to edit it directly
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border p-8 mb-6 max-h-[600px] overflow-y-auto">
        <ResumePreview resume={editedResume} layout={layout} editable={editing} onUpdate={setEditedResume} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleSaveAndContinue}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Continue to Export
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Resume Preview Component
function ResumePreview({ resume, layout = 'Modern Minimalist', editable, onUpdate }) {
  const updateField = (path, value) => {
    const newResume = { ...resume };
    const pathArray = path.split('.');
    let current = newResume;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) current[pathArray[i]] = {};
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    onUpdate(newResume);
  };

  const updateArrayField = (arrayPath, index, field, value) => {
    const newResume = { ...resume };
    const arr = arrayPath.split('.').reduce((obj, key) => obj[key], newResume);
    if (arr && arr[index]) {
      arr[index] = { ...arr[index], [field]: value };
      onUpdate(newResume);
    }
  };

  const updateArrayItem = (arrayPath, index, subfield, value) => {
    const newResume = { ...resume };
    const pathArray = arrayPath.split('.');
    let arr = newResume;
    for (const key of pathArray) {
      arr = arr[key];
    }
    if (arr && arr[index]) {
      if (subfield) {
        arr[index][subfield] = value;
      } else {
        arr[index] = value;
      }
      onUpdate(newResume);
    }
  };

  // Determine layout styles
  const isModern = layout.toLowerCase().includes('modern') || layout.toLowerCase().includes('minimalist');
  const isClassic = layout.toLowerCase().includes('classic') || layout.toLowerCase().includes('professional');
  const isTechnical = layout.toLowerCase().includes('technical') || layout.toLowerCase().includes('academic') || layout.toLowerCase().includes('focus');
  
  // Layout-specific styles
  const headerClass = isModern 
    ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg mb-6'
    : isClassic
    ? 'text-center border-b-2 border-gray-800 pb-6 mb-6'
    : 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-4 rounded-md mb-4';
  
  const sectionHeaderClass = isModern
    ? 'text-2xl font-bold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4'
    : isClassic
    ? 'text-xl font-serif font-bold uppercase tracking-wider border-b border-gray-400 pb-2 mb-4'
    : 'text-lg font-bold text-indigo-900 bg-indigo-50 px-3 py-2 rounded mb-3';
  
  const nameClass = isModern
    ? 'text-4xl font-bold'
    : isClassic
    ? 'text-3xl font-serif font-bold uppercase tracking-wide'
    : 'text-2xl font-bold';
  
  const contactClass = isModern
    ? 'text-blue-100 text-sm'
    : isClassic
    ? 'text-gray-700 text-sm'
    : 'text-purple-100 text-xs';

  return (
    <div className={`space-y-6 ${isClassic ? 'font-serif' : 'font-sans'}`}>
      {/* Header */}
      <div className={headerClass}>
        {editable ? (
          <>
            <input
              type="text"
              value={resume.personalInfo?.fullName || ''}
              onChange={(e) => updateField('personalInfo.fullName', e.target.value)}
              className={`${nameClass} mb-2 ${isClassic ? 'text-center' : ''} w-full border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 outline-none bg-transparent`}
            />
            <div className={`flex flex-col sm:flex-row gap-2 ${isClassic ? 'justify-center' : ''} ${contactClass} mt-2`}>
              <input
                type="email"
                value={resume.personalInfo?.email || ''}
                onChange={(e) => updateField('personalInfo.email', e.target.value)}
                className={`${isClassic ? 'text-center' : ''} border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none bg-transparent`}
                placeholder="Email"
              />
              <span className="hidden sm:inline">•</span>
              <input
                type="tel"
                value={resume.personalInfo?.phone || ''}
                onChange={(e) => updateField('personalInfo.phone', e.target.value)}
                className={`${isClassic ? 'text-center' : ''} border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none bg-transparent`}
                placeholder="Phone"
              />
              <span className="hidden sm:inline">•</span>
              <input
                type="text"
                value={resume.personalInfo?.location || ''}
                onChange={(e) => updateField('personalInfo.location', e.target.value)}
                className={`${isClassic ? 'text-center' : ''} border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none bg-transparent`}
                placeholder="Location"
              />
            </div>
          </>
        ) : (
          <>
            <h1 className={nameClass}>{resume.personalInfo?.fullName}</h1>
            <p className={contactClass}>
              {resume.personalInfo?.email} • {resume.personalInfo?.phone} • {resume.personalInfo?.location}
            </p>
          </>
        )}
      </div>

      {/* Summary */}
      {(resume.summary || editable) && (
        <div>
          <h2 className={sectionHeaderClass}>PROFESSIONAL SUMMARY</h2>
          {editable ? (
            <textarea
              value={resume.summary || ''}
              onChange={(e) => updateField('summary', e.target.value)}
              className="w-full text-gray-700 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
              placeholder="Professional summary..."
            />
          ) : (
            <p className="text-gray-700">{resume.summary}</p>
          )}
        </div>
      )}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <div>
          <h2 className={sectionHeaderClass}>EXPERIENCE</h2>
          {resume.experience.map((exp, idx) => (
            <div key={idx} className="mb-4 p-3 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start mb-1 gap-2">
                {editable ? (
                  <>
                    <input
                      type="text"
                      value={exp.position || ''}
                      onChange={(e) => updateArrayField('experience', idx, 'position', e.target.value)}
                      className="font-semibold flex-1 border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
                      placeholder="Position"
                    />
                    <div className="flex gap-1 text-sm">
                      <input
                        type="text"
                        value={exp.startDate || ''}
                        onChange={(e) => updateArrayField('experience', idx, 'startDate', e.target.value)}
                        className="w-24 text-gray-600 text-right border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
                        placeholder="Start"
                      />
                      <span className="text-gray-600">-</span>
                      <input
                        type="text"
                        value={exp.endDate || ''}
                        onChange={(e) => updateArrayField('experience', idx, 'endDate', e.target.value)}
                        className="w-24 text-gray-600 border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
                        placeholder="End"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold">{exp.position}</h3>
                    <span className="text-sm text-gray-600 whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                  </>
                )}
              </div>
              
              <div className="flex gap-2 mb-2">
                {editable ? (
                  <>
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => updateArrayField('experience', idx, 'company', e.target.value)}
                      className="text-gray-700 border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
                      placeholder="Company"
                    />
                    <span className="text-gray-700">•</span>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => updateArrayField('experience', idx, 'location', e.target.value)}
                      className="text-gray-700 border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
                      placeholder="Location"
                    />
                  </>
                ) : (
                  <p className="text-gray-700">{exp.company} • {exp.location}</p>
                )}
              </div>
              
              {editable ? (
                <div className="space-y-1">
                  {exp.responsibilities?.map((resp, ridx) => (
                    <div key={ridx} className="flex gap-2">
                      <span className="text-gray-700">•</span>
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => {
                          const newResume = { ...resume };
                          newResume.experience[idx].responsibilities[ridx] = e.target.value;
                          onUpdate(newResume);
                        }}
                        className="flex-1 text-gray-700 text-sm border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
                        placeholder="Responsibility or achievement..."
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {exp.responsibilities?.map((resp, ridx) => (
                    <li key={ridx} className="text-gray-700 text-sm">{resp}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <div>
          <h2 className={sectionHeaderClass}>EDUCATION</h2>
          {resume.education.map((edu, idx) => (
            <div key={idx} className="mb-2 p-3 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  {editable ? (
                    <>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => updateArrayField('education', idx, 'degree', e.target.value)}
                        className="font-semibold w-full border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none mb-1"
                        placeholder="Degree"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={edu.institution || ''}
                          onChange={(e) => updateArrayField('education', idx, 'institution', e.target.value)}
                          className="text-gray-700 flex-1 border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
                          placeholder="Institution"
                        />
                        <span className="text-gray-700">•</span>
                        <input
                          type="text"
                          value={edu.location || ''}
                          onChange={(e) => updateArrayField('education', idx, 'location', e.target.value)}
                          className="text-gray-700 flex-1 border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
                          placeholder="Location"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-gray-700">{edu.institution} • {edu.location}</p>
                    </>
                  )}
                </div>
                {editable ? (
                  <input
                    type="text"
                    value={edu.graduationDate || ''}
                    onChange={(e) => updateArrayField('education', idx, 'graduationDate', e.target.value)}
                    className="text-sm text-gray-600 w-32 text-right border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
                    placeholder="Grad Date"
                  />
                ) : (
                  <span className="text-sm text-gray-600 whitespace-nowrap">{edu.graduationDate}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resume.skills && resume.skills.technical && resume.skills.technical.length > 0 && (
        <div>
          <h2 className={sectionHeaderClass}>SKILLS</h2>
          {editable ? (
            <input
              type="text"
              value={resume.skills.technical.join(', ')}
              onChange={(e) => updateField('skills.technical', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full text-gray-700 border-b border-transparent hover:border-blue-300 focus:border-blue-500 outline-none"
              placeholder="Skill1, Skill2, Skill3..."
            />
          ) : (
            <p className="text-gray-700">{resume.skills.technical.join(' • ')}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Step 6: Export
function ExportStep({ resume, layout, onBack, onSave, setError, setSuccess, setLoading, loading }) {
  const handleExportPDF = async () => {
    setLoading(true);
    try {
      await resumeAPI.exportPDF(resume, layout.toLowerCase().replace(/\s+/g, ''));
      setSuccess('PDF downloaded successfully!');
    } catch (err) {
      setError('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportDOCX = async () => {
    setLoading(true);
    try {
      await resumeAPI.exportDOCX(resume);
      setSuccess('Text file downloaded successfully!');
    } catch (err) {
      setError('Failed to export document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <Check className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-3xl font-bold mb-4">Your Resume is Ready!</h2>
        <p className="text-gray-600">Save to your account and download in your preferred format</p>
      </div>

      {/* Save to Database Button */}
      <button
        onClick={onSave}
        disabled={loading}
        className="w-full max-w-md mx-auto mb-6 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 font-semibold"
      >
        {loading ? (
          <>
            <Loader className="w-6 h-6 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-6 h-6" />
            Save Resume to Account
          </>
        )}
      </button>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={handleExportPDF}
          disabled={loading}
          className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Download className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Download PDF</h3>
          <p className="text-sm text-gray-600">Best for printing and ATS systems</p>
        </button>

        <button
          onClick={handleExportDOCX}
          disabled={loading}
          className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Download Text</h3>
          <p className="text-sm text-gray-600">Easy to edit and customize further</p>
        </button>
      </div>

      <button
        onClick={onBack}
        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        Go Back to Edit
      </button>
    </div>
  );
}

// Chat Sidebar Component
function ChatSidebar({ resumeData, onClose, messages, setMessages }) {
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleOptionClick = async (question) => {
    setShowMenu(false);
    
    const userMessage = { role: 'user', content: question };
    setMessages([...messages, userMessage]);
    setSending(true);

    try {
      const response = await aiAPI.chat(question, messages, resumeData);
      
      if (response.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.message 
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setSending(false);
      // Show menu again after response
      setTimeout(() => setShowMenu(true), 500);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setShowMenu(true);
  };

  // Menu options organized by category
  const menuOptions = [
    {
      category: '✍️ Resume Writing',
      options: [
        { label: 'Improve My Summary', value: 'summary' },
        { label: 'Enhance Experience Bullets', value: 'experience' },
        { label: 'Optimize Skills Section', value: 'skills' },
      ]
    },
    {
      category: '🎨 Design & Layout',
      options: [
        { label: 'Recommend Layout', value: 'layout' },
        { label: 'Formatting Tips', value: 'format' },
        { label: 'ATS Optimization', value: 'ats' },
      ]
    },
    {
      category: '🎤 Interview Prep',
      options: [
        { label: 'Common Questions', value: 'interview' },
        { label: 'STAR Method Help', value: 'star method' },
        { label: 'Behavioral Tips', value: 'behavioral questions' },
      ]
    },
    {
      category: '💼 Career Strategy',
      options: [
        { label: 'Salary Negotiation', value: 'salary negotiation' },
        { label: 'Career Change Advice', value: 'career transition' },
        { label: 'LinkedIn Optimization', value: 'linkedin' },
      ]
    }
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <h3 className="font-semibold">AI Career Coach</h3>
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <button onClick={resetChat} className="hover:bg-white/20 rounded p-1" title="Reset Chat">
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
          <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <Bot className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-800 font-semibold mb-1">👋 Hi! I'm your AI Career Coach</p>
            <p className="text-sm text-gray-500 mb-4">
              Choose a topic below to get started
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Menu Options */}
      {showMenu && !sending && (
        <div className="p-4 border-t max-h-80 overflow-y-auto bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">Select a topic:</p>
          <div className="space-y-4">
            {menuOptions.map((section, sIdx) => (
              <div key={sIdx}>
                <p className="text-sm font-semibold text-gray-700 mb-2">{section.category}</p>
                <div className="space-y-2">
                  {section.options.map((option, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleOptionClick(option.value)}
                      className="w-full text-left px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-sm font-medium text-gray-700 hover:text-blue-700"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
