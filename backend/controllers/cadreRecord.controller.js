const CadreRecord = require('../models/cadreRecord.model');

// Highlight companies with the same short cadre for 7 consecutive days
exports.getConsecutiveShortCadre = async (req, res) => {
    try {
        const records = await CadreRecord.find().sort({ company: 1, date: 1 }).populate('company');
        const highlighted = [];
        let consecutiveCount = 1;
        let lastShortCadre = null;

        for (let i = 0; i < records.length; i++) {
            if (i > 0 && records[i].company._id.equals(records[i-1].company._id) && records[i].short_cadre === lastShortCadre) {
                consecutiveCount++;
            } else {
                consecutiveCount = 1;
            }
            lastShortCadre = records[i].short_cadre;

            if (consecutiveCount >= 7) {
                if (!highlighted.find(h => h.company._id.equals(records[i].company._id))) {
                    highlighted.push({
                        company: records[i].company,
                        message: `Same short cadre of ${records[i].short_cadre} for 7 or more consecutive days.`
                    });
                }
            }
        }
        res.json(highlighted);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
};

// Highlight companies where short cadre is increasing over time
exports.getIncreasingShortCadre = async (req, res) => {
    try {
        const records = await CadreRecord.find().sort({ company: 1, date: 1 }).populate('company');
        const highlighted = [];

        for (let i = 1; i < records.length; i++) {
            if (records[i].company._id.equals(records[i-1].company._id) && records[i].short_cadre > records[i-1].short_cadre) {
                 if (!highlighted.find(h => h.company._id.equals(records[i].company._id))) {
                    highlighted.push({
                        company: records[i].company,
                        message: `Short cadre is increasing. Previous: ${records[i-1].short_cadre}, Current: ${records[i].short_cadre}`
                    });
                }
            }
        }
        res.json(highlighted);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
};

// Highlight if Request Cadre decreases compared to previous records
exports.getDecreasingRequestCadre = async (req, res) => {
    try {
        const records = await CadreRecord.find().sort({ company: 1, date: 1 }).populate('company');
        const highlighted = [];

        for (let i = 1; i < records.length; i++) {
            if (records[i].company._id.equals(records[i-1].company._id) && records[i].request_cadre < records[i-1].request_cadre) {
                if (!highlighted.find(h => h.company._id.equals(records[i].company._id))) {
                    highlighted.push({
                        company: records[i].company,
                        message: `Request cadre decreased. Previous: ${records[i-1].request_cadre} on ${records[i-1].date.toDateString()}, Current: ${records[i].request_cadre} on ${records[i].date.toDateString()}`
                    });
                }
            }
        }
        res.json(highlighted);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
};
