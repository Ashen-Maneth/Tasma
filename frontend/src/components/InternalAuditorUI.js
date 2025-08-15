import React, { useState, useEffect } from 'react';
import api from '../api';

const InternalAuditorUI = () => {
    const [companies, setCompanies] = useState([]);
    const [supervisors, setSupervisors] = useState({});
    const [selectedCompany, setSelectedCompany] = useState('');
    const [supervisorName, setSupervisorName] = useState('');
    const [date, setDate] = useState('');
    const [activeCadre, setActiveCadre] = useState(0);
    const [requestCadre, setRequestCadre] = useState(0);
    const [givenCadre, setGivenCadre] = useState(0);
    const [permanentCadre, setPermanentCadre] = useState(0);
    const [temporaryCadre, setTemporaryCadre] = useState(0);
    const [absent, setAbsent] = useState(0);
    const [leave, setLeave] = useState(0);
    const [newHeads, setNewHeads] = useState(0);
    const [shortCadre, setShortCadre] = useState(0);

    const [newCompanyName, setNewCompanyName] = useState('');
    const [newSupervisorName, setNewSupervisorName] = useState('');

    useEffect(() => {
        api.get('/companies/')
            .then(response => {
                setCompanies(response.data);
                const sup = {};
                response.data.forEach(comp => {
                    sup[comp._id] = comp.supervisor_name;
                });
                setSupervisors(sup);
            })
            .catch((error) => {
                console.log(error);
            })
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            setSupervisorName(supervisors[selectedCompany]);
        } else {
            setSupervisorName('');
        }
    }, [selectedCompany, supervisors]);

    useEffect(() => {
        setShortCadre(requestCadre - activeCadre);
    }, [requestCadre, activeCadre]);

    const onSubmit = (e) => {
        e.preventDefault();

        const cadreRecord = {
            company: selectedCompany,
            date,
            active_cadre: activeCadre,
            request_cadre: requestCadre,
            given_cadre: givenCadre,
            permanent_cadre: permanentCadre,
            temporary_cadre: temporaryCadre,
            absent,
            leave,
            new_heads: newHeads,
        };

        api.post('/cadre-records/add', cadreRecord)
            .then(res => console.log(res.data));

        // Reset form
        setSelectedCompany('');
        setDate('');
        setActiveCadre(0);
        setRequestCadre(0);
        setGivenCadre(0);
        setPermanentCadre(0);
        setTemporaryCadre(0);
        setAbsent(0);
        setLeave(0);
        setNewHeads(0);
    }

    const handleAddCompany = (e) => {
        e.preventDefault();
        const newCompany = {
            company_name: newCompanyName,
            supervisor_name: newSupervisorName
        }
        api.post('/companies/add', newCompany)
            .then(res => {
                console.log(res.data);
                // Refresh companies list
                api.get('/companies/')
                    .then(response => {
                        setCompanies(response.data);
                        const sup = {};
                        response.data.forEach(comp => {
                            sup[comp._id] = comp.supervisor_name;
                        });
                        setSupervisors(sup);
                    });
                setNewCompanyName('');
                setNewSupervisorName('');
            });
    }

    const [records, setRecords] = useState([]);

    useEffect(() => {
        api.get('/cadre-records/')
            .then(response => {
                setRecords(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const deleteRecord = (id) => {
        api.delete('/cadre-records/'+id)
            .then(response => { console.log(response.data)});

        setRecords(records.filter(el => el._id !== id))
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">
                    <h3>Internal Auditor UI</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Company Name:</label>
                                    <select required className="form-control" value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                                        <option value="">Select Company</option>
                                        {companies.map(company => (
                                            <option key={company._id} value={company._id}>{company.company_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Supervisor Name:</label>
                                    <input type="text" readOnly className="form-control" value={supervisorName} />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Date:</label>
                            <input type="date" required className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Active Cadre:</label>
                                    <input type="number" required className="form-control" value={activeCadre} onChange={(e) => setActiveCadre(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Request Cadre:</label>
                                    <input type="number" required className="form-control" value={requestCadre} onChange={(e) => setRequestCadre(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Short Cadre:</label>
                                    <input type="number" readOnly className="form-control" value={shortCadre} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Given Cadre:</label>
                                    <input type="number" required className="form-control" value={givenCadre} onChange={(e) => setGivenCadre(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Permanent Cadre:</label>
                                    <input type="number" required className="form-control" value={permanentCadre} onChange={(e) => setPermanentCadre(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Temporary Cadre:</label>
                                    <input type="number" required className="form-control" value={temporaryCadre} onChange={(e) => setTemporaryCadre(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Absent:</label>
                                    <input type="number" required className="form-control" value={absent} onChange={(e) => setAbsent(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Leave:</label>
                                    <input type="number" required className="form-control" value={leave} onChange={(e) => setLeave(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>New Heads:</label>
                                    <input type="number" required className="form-control" value={newHeads} onChange={(e) => setNewHeads(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="form-group mt-3">
                            <input type="submit" value="Create Cadre Log" className="btn btn-primary w-100" />
                        </div>
                    </form>
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-header">
                    <h3>Add New Company</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleAddCompany}>
                        <div className="form-group">
                            <label>New Company Name:</label>
                            <input type="text" required className="form-control" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Supervisor Name:</label>
                            <input type="text" required className="form-control" value={newSupervisorName} onChange={(e) => setNewSupervisorName(e.target.value)} />
                        </div>
                        <div className="form-group mt-3">
                            <input type="submit" value="Add Company" className="btn btn-success w-100" />
                        </div>
                    </form>
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-header">
                    <h3>Cadre Logs</h3>
                </div>
                <div className="card-body">
                    <table className="table table-striped">
                        <thead className="thead-light">
                            <tr>
                                <th>Company</th>
                                <th>Date</th>
                                <th>Short Cadre</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(record => (
                                <tr key={record._id}>
                                    <td>{record.company ? record.company.company_name : 'N/A'}</td>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>{record.short_cadre}</td>
                                    <td>
                                        <button onClick={() => { deleteRecord(record._id) }} className="btn btn-danger">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default InternalAuditorUI;
