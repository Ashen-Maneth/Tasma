import React, { useState, useEffect } from 'react';
import api from '../api';

const AuditManagerUI = () => {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    
    const [filterCompany, setFilterCompany] = useState('');
    const [filterSupervisor, setFilterSupervisor] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const [consecutiveShortCadre, setConsecutiveShortCadre] = useState([]);
    const [increasingShortCadre, setIncreasingShortCadre] = useState([]);
    const [decreasingRequestCadre, setDecreasingRequestCadre] = useState([]);

    useEffect(() => {
        api.get('/cadre-records/')
            .then(response => {
                setRecords(response.data);
                setFilteredRecords(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

        api.get('/companies/')
            .then(response => {
                setCompanies(response.data);
                const uniqueSupervisors = [...new Set(response.data.map(item => item.supervisor_name))];
                setSupervisors(uniqueSupervisors);
            })
            .catch((error) => {
                console.log(error);
            });
        
        api.get('/cadre-records/highlights/consecutive-short-cadre')
            .then(res => setConsecutiveShortCadre(res.data));
        api.get('/cadre-records/highlights/increasing-short-cadre')
            .then(res => setIncreasingShortCadre(res.data));
        api.get('/cadre-records/highlights/decreasing-request-cadre')
            .then(res => setDecreasingRequestCadre(res.data));

    }, []);

    useEffect(() => {
        let tempRecords = records;

        if (filterCompany) {
            tempRecords = tempRecords.filter(record => record.company._id === filterCompany);
        }
        if (filterSupervisor) {
            tempRecords = tempRecords.filter(record => record.company.supervisor_name === filterSupervisor);
        }
        if (filterStartDate) {
            tempRecords = tempRecords.filter(record => new Date(record.date) >= new Date(filterStartDate));
        }
        if (filterEndDate) {
            tempRecords = tempRecords.filter(record => new Date(record.date) <= new Date(filterEndDate));
        }

        setFilteredRecords(tempRecords);
    }, [filterCompany, filterSupervisor, filterStartDate, filterEndDate, records]);

    const isHighlighted = (record, type) => {
        switch(type) {
            case 'consecutive':
                return consecutiveShortCadre.some(h => h.company._id === record.company._id);
            case 'increasing':
                return increasingShortCadre.some(h => h.company._id === record.company._id);
            case 'decreasing':
                return decreasingRequestCadre.some(h => h.company._id === record.company._id);
            default:
                return false;
        }
    }

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-md-9">
                    <div className="card">
                        <div className="card-header">
                            <h4>Filters</h4>
                        </div>
                        <div className="card-body">
                            <form>
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Filter by Company</label>
                                            <select className="form-control" value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}>
                                                <option value="">All Companies</option>
                                                {companies.map(company => (
                                                    <option key={company._id} value={company._id}>{company.company_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Filter by Supervisor</label>
                                            <select className="form-control" value={filterSupervisor} onChange={(e) => setFilterSupervisor(e.target.value)}>
                                                <option value="">All Supervisors</option>
                                                {supervisors.map(supervisor => (
                                                    <option key={supervisor} value={supervisor}>{supervisor}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Start Date</label>
                                            <input type="date" className="form-control" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>End Date</label>
                                            <input type="date" className="form-control" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card mt-4">
                        <div className="card-header">
                            <h4>Daily-wise Company Details</h4>
                        </div>
                        <div className="card-body">
                            <table className="table table-striped table-hover">
                                <thead className="thead-dark">
                                    <tr>
                                        <th>Company</th>
                                        <th>Date</th>
                                        <th>Short Cadre</th>
                                        <th>Active Cadre</th>
                                        <th>Request Cadre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map(record => (
                                        <tr key={record._id} className={
                                            isHighlighted(record, 'consecutive') ? 'table-warning' : 
                                            isHighlighted(record, 'increasing') ? 'table-danger' :
                                            isHighlighted(record, 'decreasing') ? 'table-info' : ''
                                        }>
                                            <td>{record.company.company_name}</td>
                                            <td>{new Date(record.date).toLocaleDateString()}</td>
                                            <td>{record.short_cadre}</td>
                                            <td>{record.active_cadre}</td>
                                            <td>{record.request_cadre}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-header">
                            <h4>Notifications</h4>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-warning">
                                <h5>Same Short Cadre (7+ Days)</h5>
                                <ul className="list-unstyled">
                                    {consecutiveShortCadre.map(h => <li key={h.company._id}><strong>{h.company.company_name}</strong>: {h.message}</li>)}
                                </ul>
                            </div>
                            <div className="alert alert-danger">
                                <h5>Increasing Short Cadre</h5>
                                <ul className="list-unstyled">
                                    {increasingShortCadre.map(h => <li key={h.company._id}><strong>{h.company.company_name}</strong>: {h.message}</li>)}
                                </ul>
                            </div>
                            <div className="alert alert-info">
                                <h5>Decreasing Request Cadre</h5>
                                <ul className="list-unstyled">
                                    {decreasingRequestCadre.map(h => <li key={h.company._id}><strong>{h.company.company_name}</strong>: {h.message}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuditManagerUI;
