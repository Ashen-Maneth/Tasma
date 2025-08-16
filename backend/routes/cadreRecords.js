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

  const short_cadre = request_cadre - active_cadre;

  const newCadreRecord = new CadreRecord({
    company,
    date: Date.parse(date),
    active_cadre,
    request_cadre,
    given_cadre,
    permanent_cadre,
    temporary_cadre,
    absent,
    leave,
    new_heads,
    short_cadre
  });

  newCadreRecord.save()
    .then(() => res.json('Cadre record added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/highlights/consecutive-short-cadre').get(auth('manager'), cadreController.getConsecutiveShortCadre);
router.route('/highlights/increasing-short-cadre').get(auth('manager'), cadreController.getIncreasingShortCadre);
router.route('/highlights/decreasing-request-cadre').get(auth('manager'), cadreController.getDecreasingRequestCadre);

router.route('/:id').delete(auth('auditor'), (req, res) => {
  CadreRecord.findByIdAndDelete(req.params.id)
    .then(() => res.json('Cadre record deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;
