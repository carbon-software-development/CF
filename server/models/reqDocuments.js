const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RequiredDocument = new mongoose.Schema({
    name: String,
    milestone: {type: Schema.Types.ObjectId, ref: 'Milestone'},
  },
  {
    collection: 'requiredDocuments'
  });

module.exports = mongoose.model('RequiredDocument', RequiredDocument);
