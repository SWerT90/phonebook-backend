const ENV = process.env.ENV || 'DEV'

if (ENV === 'DEV') {
  require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const handleErrors = require('./middlewares/handleErrors')
const notFound = require('./middlewares/notFound')

require('./mongo')
const Person = require('./models/Person')

const app = express()

app.use(cors())
app.use(express.json())
morgan.token('bodyRequest', (req) => {
  return JSON.stringify(req.body)
})

app.use(morgan((tokens, req, res) => {
  if (req.method === 'POST') {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.bodyRequest(req)
    ].join(' ')
  }
}))

app.use(express.static('build'))

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => res.json(persons))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findById(id).then(person => {
    return person
      ? res.json(person)
      : next({ name: 'NotFound' })
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findByIdAndRemove(id)
    .then(result => res.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const person = req.body

  if (!person || !person.name || !person.phone) {
    next({ name: 'BadRequest' })
  }

  const newPerson = new Person({
    name: person.name,
    phone: person.phone
  })

  newPerson.save()
    .then(savedPerson => {
      res.status(201).json(savedPerson)
    })
    .catch(error => {
      next(error)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const newPhone = req.body

  Person.findByIdAndUpdate(id, newPhone, { new: true, runValidators: true })
    .then(updatedPerson => {
      console.log({ updatedPerson })
      res.status(200).json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  const date = new Date().toUTCString()

  Person.countDocuments({})
    .then(totalPersons => {
      res.send(
        `<p>Phonebook has info for ${totalPersons} people</p>
        <p>${date}</p>`
      )
    }).catch(error => next(error))
})

app.use(notFound)

app.use(handleErrors)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Running app on PORT ${PORT}`)
})
