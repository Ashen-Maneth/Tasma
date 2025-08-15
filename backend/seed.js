const mongoose = require('mongoose');
const Company = require('./models/company.model');

const companies = [
    { company_name: 'A ONE POLYMER', supervisor_name: 'ASHAN' },
    { company_name: 'ABANS-RATHMALANA', supervisor_name: 'DANANJAYA' },
    { company_name: 'ABM RATHMALANA', supervisor_name: 'OMETH' },
    { company_name: 'AMW - KALUTHARA', supervisor_name: 'NIMNA' },
    { company_name: 'ANTLER', supervisor_name: 'SHEHAN' },
    { company_name: 'BANDARAGAMA C/C', supervisor_name: 'DUNURA' },
    { company_name: 'BANDARAGAMA W/H', supervisor_name: 'DUNURA' },
    { company_name: 'BROWNS-RATHMALANA', supervisor_name: 'OMETH' },
    { company_name: 'CARGILLS RATHMALANA', supervisor_name: 'OMETH' },
    { company_name: 'CEYLON COLD STORES', supervisor_name: 'ASHAN' },
    { company_name: 'DP ATIGALA( BIC ASSE)', supervisor_name: 'SHEHAN' },
    { company_name: 'DPMC-CMU', supervisor_name: 'SHEHAN' },
    { company_name: 'ART GALLERY', supervisor_name: 'DINESH' },
    { company_name: 'ECONOPACK', supervisor_name: 'DINESH' },
    { company_name: 'F.M.J', supervisor_name: 'ASHAN' },
    { company_name: 'HETTIGODA', supervisor_name: 'OMETH' },
    { company_name: 'J.D POLYMER', supervisor_name: 'ASHAN' },
    { company_name: 'KOREAN SPA', supervisor_name: 'ASHAN' },
    { company_name: 'MACSONS-RATHMALANA', supervisor_name: 'DANANJAYA' },
    { company_name: 'MALIBAN-RATHMALANA', supervisor_name: 'INOKA/KUSHALYA/APARNA' },
    { company_name: 'MEDAGAMA ARCHIVED', supervisor_name: 'DUNURA' },
    { company_name: 'MEDAGAMA W/H', supervisor_name: 'DUNURA' },
    { company_name: 'NILKAMAL', supervisor_name: 'KAVEESHA' },
    { company_name: 'RAIGAM SOUTHERN SALT', supervisor_name: 'SAHAN' },
    { company_name: 'RAPID CREATIONS', supervisor_name: 'DANANJAYA' },
    { company_name: 'RICH LIFE', supervisor_name: 'THARINDU' },
    { company_name: 'ROCELL MATHUGAMA', supervisor_name: 'THARINDU' },
    { company_name: 'ROCELL PANADURA', supervisor_name: 'ASHAN' },
    { company_name: 'ROCELL PILIYANDALA', supervisor_name: 'KAVEESHA' },
    { company_name: 'ROYAL CERAMIC -LOT YARD', supervisor_name: 'KAVEESHA' },
    { company_name: 'ROYAL CERAMIC -SHOWROOM', supervisor_name: 'KAVEESHA' },
    { company_name: 'ROYAL CERAMIC-RATHMALANA', supervisor_name: 'OMETH' },
    { company_name: 'SEYLAN', supervisor_name: 'NIMNA' },
    { company_name: 'TOURISM BEARUE', supervisor_name: 'NIMNA' },
    { company_name: 'TOYOTA- MAHARAGAMA', supervisor_name: 'DINATH' },
    { company_name: 'TOYOTA-MATHARA', supervisor_name: 'DINATH' },
    { company_name: 'TOYOTA-RATHMALANA', supervisor_name: 'DINATH' },
];

const uri = "mongodb+srv://admin:admin123@tasmaproject.h3ds7yl.mongodb.net/";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

connection.once('open', async () => {
  console.log("MongoDB database connection established successfully");
  

  try {
    await Company.deleteMany({});
    console.log('Old companies deleted.');
    await Company.insertMany(companies);
    console.log('Database seeded!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
});
