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

  Person.findById(id).then(note => {
    return note
      ? res.json(note)
      : next({ error: 'person not found' })
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findOneAndRemove(id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const person = req.body

  if (!person || !person.name || !person.phone) {
    next({ name: 'BadRequest' })
  }

  // TODO: Implementar que no se guarde en bbdd si el nombre existe

  let personAlready = null

  Person.find({ name: person.name })
    .then(person => {
      console.log({ person })
      personAlready = person
    })
    .catch(error => next(error))

  console.log({ personAlready })
  if (personAlready) {
    next({ name: 'DuplicateName' })
  }

  const newPerson = new Person({
    name: person.name,
    phone: person.phone
  })

  newPerson.save()
    .then(savedPerson => {
      res.status(201).json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  const date = new Date().toUTCString()

  let nPersons = 0

  Person.countDocuments()
    .then(totalPersons => {
      nPersons = totalPersons
    }).catch(error => next(error))

    .res.send(
    `<p>Phonebook has info for ${nPersons} people</p>
    <p>${date}</p>`
    )
})

app.use(handleErrors)

app.use(notFound)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Running app on PORT ${PORT}`)
})
