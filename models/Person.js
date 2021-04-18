const { model, Schema } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const personSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
    minLength: 3
  },
  phone: {
    type: String,
    required: true,
    minLength: 8
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedDocument) => {
    returnedDocument.id = returnedDocument._id
    delete returnedDocument._id
    delete returnedDocument.__v
  }
})

personSchema.plugin(uniqueValidator)

const Person = model('Person', personSchema)
module.exports = Person
