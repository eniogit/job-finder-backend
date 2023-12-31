const joi = require('joi')

const express = require('express')
const server = express()

const cors = require('cors')

const mongoose = require('mongoose')
const JobPosting = require('./JobPosting')

mongoose.connect('mongodb://db:27017/jobs').then(() => {
  console.log('Connected to MongoDB')
  server.listen(8000, () => {
    console.log('Server listening on port 8000')
  })
})

server.use(cors())

server.use(express.json())
server.use(express.urlencoded({ extended: true }))

// Post a job posting
server.post('/api/jobs', async (req, res, next) => {
  try {
    const jobPostingSchema = joi
      .object({
        expLevel: joi.string().valid('junior', 'intermediate', 'senior').required(),
        title: joi.string().required(),
        description: joi.string().required(),
        salary: joi.object({
          min: joi.number(),
          max: joi.number(),
          other: joi.string(),
          unit: joi.string(),
        }),
        contactInfo: joi
          .object({
            cell: joi.string().required(),
            email: joi.string().required(),
            address: joi.string().required(),
            geolocation: joi.object({
              lat: joi.number(),
              long: joi.number(),
            }),
          })
          .required(),
        company: joi
          .object({
            name: joi.string().required(),
            logo: joi.string(),
          })
          .required(),
      })
      .required()
    const newJobPosting = await jobPostingSchema.validateAsync(req.body)
    console.log(newJobPosting)
    const newJob = await JobPosting.create(newJobPosting)
    res.status(201).json(newJob)
  } catch (error) {
    next(error)
  }
})

// Search for job postings
server.get('/api/jobs', async (req, res, next) => {
  try {
    const searchSchema = joi.object({
      query: joi.string().optional().default(null),
      sort: joi.string().valid('salary', 'date').default('date'),
      expLevel: joi.string().valid('all', 'junior', 'intermediate', 'senior').default('all'),
    })
    const aggregations = []
    const { query, sort, expLevel } = await searchSchema.validateAsync(req.query)
    if (query) {
      aggregations.push({
        $match: {
          $text: {
            $search: query,
          },
        },
      })
    }
    if (expLevel !== 'all') {
      aggregations.push({
        $match: {
          expLevel,
        },
      })
    }
    if (sort === 'salary') {
      aggregations.push({
        $sort: {
          'salary.min': -1,
        },
      })
    } else if (sort === 'date') {
      aggregations.push({
        $sort: {
          createdAt: -1,
        },
      })
    }
    const jobs = await JobPosting.aggregate(aggregations)
    res.status(200).json(jobs)
  } catch (error) {
    console.error(error)
    next(error)
  }
})

// Get a job posting by id
server.get('/api/jobs/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const job = await JobPosting.findById(id)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    res.status(200).json(job)
  } catch (error) {
    next(error)
  }
})
