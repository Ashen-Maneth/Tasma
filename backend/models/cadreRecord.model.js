const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cadreRecordSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  date: { type: Date, required: true },
  active_cadre: { type: Number, required: true },
  request_cadre: { type: Number, required: true },
  given_cadre: { type: Number, required: true },
  permanent_cadre: { type: Number, required: true },
  temporary_cadre: { type: Number, required: true },
  absent: { type: Number, required: true },
  leave: { type: Number, required: true },
  new_heads: { type: Number, required: true },
  short_cadre: { type: Number, required: true },
}, {
  timestamps: true,
});

const CadreRecord = mongoose.model('CadreRecord', cadreRecordSchema);

module.exports = CadreRecord;
