require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(express.json())

morgan.token('post', (req, res) => { // eslint-disable-line no-unused-vars
  // console.log(req)
  const data = JSON.stringify(req.body)
  console.log(data)
  return data
})
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :post')
)

app.get('/info', (req, res) => {
  const currentTime = new Date()
  Person.find({}).then((people) => {
    res.write(`<p>Phonebook has info for ${people.length} people</p>`)
    res.write(`<p>${currentTime}</p>`)
    res.end()
  })
})

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((people) => {
      res.json(people)
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndRemove(id)
    .then((result) => { // eslint-disable-line no-unused-vars
      res.status(204).end()
    })
    .catch((error) => {
      next(error)
    })
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body) {
    return res.status(404).json({
      error: 'content missing',
    })
  } else if (!body.number || !body.name) {
    return res.status(404).json({
      error: 'name or number is missing from content',
    })
  }

  const newPerson = Person({
    name: body.name,
    number: body.number,
  })

  newPerson
    .save()
    .then((result) => { // eslint-disable-line no-unused-vars
      console.log('new person added')
      res.json(newPerson)
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(id, person, {
    new: true,
    runValidators: true,
  })
    .then((updatedPerson) => {
      res.json(updatedPerson)
    })
    .catch((error) => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
