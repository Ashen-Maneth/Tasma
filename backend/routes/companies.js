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

  // Validation
  if (!company_name || !supervisor_name) {
    return res.status(400).json({ error: 'Company name and supervisor name are required' });
  }

  const newCompany = new Company({
    company_name,
    supervisor_name,
  });

  newCompany.save()
    .then((savedCompany) => res.json({ 
      message: 'Company added!', 
      company: savedCompany 
    }))
    .catch(err => {
      console.error('Error saving company:', err);
      if (err.code === 11000) {
        res.status(400).json({ error: 'Company name already exists' });
      } else {
        res.status(400).json({ error: 'Failed to save company: ' + err.message });
      }
    });
});

module.exports = router;
