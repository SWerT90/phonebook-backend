module.exports = (error, req, res) => {
  console.log('No se porque estoy aqui')
  console.error(error)

  if (error.name === 'NotFound') {
    res.status(404).send({ error: 'Person not found' })
  } else if (error.name === 'DuplicateName') {
    res.status(409).send({ error: 'Person already exists in phonebook' })
  } else if (error.name === 'BadRequest') {
    res.status(400).send({ error: 'Bad request' })
  } else {
    return res.status(500).end()
  }
}
