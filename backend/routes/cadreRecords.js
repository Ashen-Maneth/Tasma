const router = require('express').Router();
let CadreRecord = require('../models/cadreRecord.model');
const cadreController = require('../controllers/cadreRecord.controller');

const auth = require('../middleware/auth');

router.route('/').get(auth(), (req, res) => {
  CadreRecord.find()
    .populate('company')
    .then(records => res.json(records))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post(auth('auditor'), (req, res) => {
  const {
    company,
    date,
    active_cadre,
    request_cadre,
    given_cadre,
    permanent_cadre,
    temporary_cadre,
    absent,
    leave,
    new_heads
  } = req.body;

  // Validation
  if (!company || !date || active_cadre === undefined || request_cadre === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const short_cadre = request_cadre - active_cadre;

  const newCadreRecord = new CadreRecord({
    company,
    date: Date.parse(date),
    active_cadre: Number(active_cadre),
    request_cadre: Number(request_cadre),
    given_cadre: Number(given_cadre),
    permanent_cadre: Number(permanent_cadre),
    temporary_cadre: Number(temporary_cadre),
    absent: Number(absent),
    leave: Number(leave),
    new_heads: Number(new_heads),
    short_cadre
  });

  newCadreRecord.save()
    .then((savedRecord) => res.json({ 
      message: 'Cadre record added!', 
      record: savedRecord 
    }))
    .catch(err => {
      console.error('Error saving cadre record:', err);
      res.status(400).json({ error: 'Failed to save cadre record: ' + err.message });
    });
});

router.route('/highlights/consecutive-short-cadre').get(auth('manager'), cadreController.getConsecutiveShortCadre);
router.route('/highlights/increasing-short-cadre').get(auth('manager'), cadreController.getIncreasingShortCadre);
router.route('/highlights/decreasing-request-cadre').get(auth('manager'), cadreController.getDecreasingRequestCadre);

router.route('/:id').delete(auth('auditor'), (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ error: 'Record ID is required' });
  }

  CadreRecord.findByIdAndDelete(id)
    .then((deletedRecord) => {
      if (!deletedRecord) {
        return res.status(404).json({ error: 'Record not found' });
      }
      res.json({ message: 'Cadre record deleted successfully' });
    })
    .catch(err => {
      console.error('Error deleting cadre record:', err);
      res.status(400).json({ error: 'Failed to delete record: ' + err.message });
    });
});


module.exports = router;
