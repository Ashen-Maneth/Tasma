const router = require('express').Router();
let Company = require('../models/company.model');

const auth = require('../middleware/auth');

router.route('/').get(auth(), (req, res) => {
  Company.find()
    .then(companies => res.json(companies))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post(auth('auditor'), (req, res) => {
  const company_name = req.body.company_name;
  const supervisor_name = req.body.supervisor_name;

  const newCompany = new Company({
    company_name,
    supervisor_name,
  });

  newCompany.save()
    .then(() => res.json('Company added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
