const { model, Schema } = require('mongoose')

const personSchema = new Schema({
  name: String,
  phone: Number
})

personSchema.set('toJSON', {
  transform: (document, returnedDocument) => {
    returnedDocument.id = returnedDocument._id
    delete returnedDocument._id
    delete returnedDocument.__v
  }
})

const Person = model('Person', personSchema)
module.exports = Person
