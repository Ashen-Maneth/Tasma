const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const companySchema = new Schema({
  company_name: { type: String, required: true, unique: true },
  supervisor_name: { type: String, required: true },
}, {
  timestamps: true,
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
