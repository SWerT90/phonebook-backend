module.exports = (err, req, res, next) => {
  console.log(err)

  if (err.name === 'ValidationError') {
    return err.errors.name
      ? res.status(400).send({ error: err.errors.name.message })
      : res.status(400).send({ error: err.errors.phone.message })
  }

  if (err.name === 'NotFound') {
    res.status(404).send({ error: 'Person not found' })
  } else if (err.name === 'DuplicateName' || err.name === 'ValidationError') {
    res.status(409).send({ error: 'Person already exists in phonebook' })
  } else if (err.name === 'BadRequest' || err.name === 'CastError') {
    res.status(400).send({ error: 'Bad request' })
  } else {
    return res.status(500).end()
  }
}
