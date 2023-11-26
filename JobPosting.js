const mongoose = require('mongoose')

const JobPostingSchema = new mongoose.Schema({
  expLevel: {
    type: String,
    enum: ['junior', 'intermediate', 'senior'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  salary: {
    min: {
      type: Number,
      default: null,
    },
    max: {
      type: Number,
      default: null,
    },
    other: {
      type: String,
      default: null,
    },
    unit: {
      type: String,
      default: null,
    },
  },
  contactInfo: {
    cell: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    geolocation: {
      lat: {
        type: Number,
        default: null,
      },
      long: {
        type: Number,
        default: null,
      },
    },
  },
  company: {
    name: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: null,
    },
  },
}, {
  timestamps: true,
})

JobPostingSchema.index({
  title: 'text',
  description: 'text',
  'company.name': 'text',
})

module.exports = mongoose.model('JobPosting', JobPostingSchema)
