import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'Untitled Resume'
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    website: String
  },
  summary: String,
  experience: [{
    position: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    responsibilities: [String]
  }],
  education: [{
    degree: String,
    institution: String,
    location: String,
    graduationDate: String,
    gpa: String,
    honors: String
  }],
  skills: {
    technical: [String],
    soft: [String],
    languages: [String]
  },
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    link: String
  }],
  achievements: [String],
  layout: {
    type: String,
    default: 'Modern Minimalist'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;


