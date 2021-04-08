const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

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

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    phone: 609719857
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    phone: 60845711
  },
  {
    id: 3,
    name: 'Miguel Sanchez',
    phone: 690845172
  },
  {
    id: 4,
    name: 'Marta Poveda',
    phone: 696651823
  }
]

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  res.json(persons.find(person => person.id === id))
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)

  if (persons.find(person => person.id === id)) {
    persons = persons.filter(person => person.id !== id)
    return res.status(204).json(persons)
  }

  res.status(404).send({
    error: 'Person not found'
  })
})

app.post('/api/persons', (req, res) => {
  const person = req.body

  if (!person || !person.name || !person.phone) {
    return res.status(400).send({
      error: 'No person or name'
    })
  }

  if (persons.find(personAlready => personAlready.name.toLowerCase() === person.name.toLowerCase())) {
    return res.status(409).send({
      error: 'Duplicate name'
    })
  }

  const ids = persons.map(person => person.id)
  const newId = Math.max(...ids) + 1

  const newPerson = {
    id: newId,
    name: person.name,
    phone: person.phone
  }

  persons = [...persons, newPerson]

  res.status(201).json(newPerson)
})

app.get('/info', (req, res) => {
  const date = new Date().toUTCString()
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>`
  )
})

app.use((req, res) => {
  res.status(404).send()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Running app on PORT ${PORT}`)
})
