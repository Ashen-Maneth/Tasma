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

    // Add state for loading and messages
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [deletingIds, setDeletingIds] = useState(new Set());

    // Function to show message
    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    // Function to fetch records with proper error handling and loading state
    const fetchRecords = async (showLoadingState = false) => {
        try {
            if (showLoadingState) setLoading(true);
            const response = await api.get('/cadre-records/');
            setRecords(response.data);
            console.log('Records refreshed:', response.data.length, 'records loaded');
        } catch (error) {
            console.error('Error fetching records:', error);
            showMessage('Error fetching records. Please refresh the page.', 'error');
        } finally {
            if (showLoadingState) setLoading(false);
        }
    };

    // Function to refresh all data (companies and records)
    const refreshAllData = async () => {
        setLoading(true);
        try {
            // Refresh companies
            const companiesResponse = await api.get('/companies/');
            setCompanies(companiesResponse.data);
            const sup = {};
            companiesResponse.data.forEach(comp => {
                sup[comp._id] = comp.supervisor_name;
            });
            setSupervisors(sup);

            // Refresh records
            const recordsResponse = await api.get('/cadre-records/');
            setRecords(recordsResponse.data);
            
            showMessage('All data refreshed successfully!', 'success');
            console.log('All data refreshed - Companies:', companiesResponse.data.length, 'Records:', recordsResponse.data.length);
        } catch (error) {
            console.error('Error refreshing data:', error);
            showMessage('Error refreshing data. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

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

    const onSubmit = async (e) => {
        e.preventDefault();
        
        // Form validation
        if (!selectedCompany || !date) {
            showMessage('Please select a company and date', 'error');
            return;
        }
        
        if (activeCadre < 0 || requestCadre < 0 || givenCadre < 0 || 
            permanentCadre < 0 || temporaryCadre < 0 || absent < 0 || 
            leave < 0 || newHeads < 0) {
            showMessage('All numeric values must be 0 or greater', 'error');
            return;
        }
        
        setLoading(true);

        const cadreRecord = {
            company: selectedCompany,
            date,
            active_cadre: parseInt(activeCadre) || 0,
            request_cadre: parseInt(requestCadre) || 0,
            given_cadre: parseInt(givenCadre) || 0,
            permanent_cadre: parseInt(permanentCadre) || 0,
            temporary_cadre: parseInt(temporaryCadre) || 0,
            absent: parseInt(absent) || 0,
            leave: parseInt(leave) || 0,
            new_heads: parseInt(newHeads) || 0,
        };

        try {
            const res = await api.post('/cadre-records/add', cadreRecord);
            console.log('Record added successfully:', res.data);
            showMessage('Cadre record added successfully!', 'success');
            
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
            
            // Add a small delay to ensure backend processing is complete
            setTimeout(() => {
                fetchRecords();
            }, 500);
            
        } catch (error) {
            console.error('Error adding record:', error);
            const errorMsg = error.response?.data?.error || 'Error adding cadre record. Please try again.';
            showMessage(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleAddCompany = async (e) => {
        e.preventDefault();
        
        // Form validation
        if (!newCompanyName.trim() || !newSupervisorName.trim()) {
            showMessage('Company name and supervisor name are required', 'error');
            return;
        }
        
        setLoading(true);
        
        const newCompany = {
            company_name: newCompanyName.trim(),
            supervisor_name: newSupervisorName.trim()
        }
        
        try {
            const res = await api.post('/companies/add', newCompany);
            console.log('Company added successfully:', res.data);
            showMessage('Company added successfully!', 'success');
            
            // Refresh companies list
            const companiesResponse = await api.get('/companies/');
            setCompanies(companiesResponse.data);
            const sup = {};
            companiesResponse.data.forEach(comp => {
                sup[comp._id] = comp.supervisor_name;
            });
            setSupervisors(sup);
            
            // Also refresh records to show any updates
            setTimeout(() => {
                fetchRecords();
            }, 500);
                    
            setNewCompanyName('');
            setNewSupervisorName('');
            
        } catch (error) {
            console.error('Error adding company:', error);
            const errorMsg = error.response?.data?.error || 'Error adding company. Please try again.';
            showMessage(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    }

    const [records, setRecords] = useState([]);

    useEffect(() => {
        fetchRecords(true); // Show loading state for initial load
    }, []);

    // Auto-refresh effect
    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchRecords(false); // Don't show loading for auto-refresh
            }, 30000); // Refresh every 30 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    // Add keyboard shortcut for refresh (Ctrl+R or F5)
    useEffect(() => {
        const handleKeyPress = (event) => {
            if ((event.ctrlKey && event.key === 'r') || event.key === 'F5') {
                event.preventDefault();
                refreshAllData();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const deleteRecord = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) {
            return;
        }
        
        // Add this ID to the deleting set
        setDeletingIds(prev => new Set([...prev, id]));
        
        try {
            console.log('Attempting to delete record with ID:', id);
            const response = await api.delete(`/cadre-records/${id}`);
            console.log('Delete response:', response.data);
            showMessage('Record deleted successfully!', 'success');
            
            // Update records state by filtering out the deleted record
            setRecords(prevRecords => {
                const updatedRecords = prevRecords.filter(el => el._id !== id);
                console.log('Records after deletion:', updatedRecords.length);
                return updatedRecords;
            });
            
        } catch (error) {
            console.error('Error deleting record:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Error deleting record. Please try again.';
            showMessage(errorMsg, 'error');
        } finally {
            // Remove this ID from the deleting set
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    }

    return (
        <div className="container mt-4">
            {/* Message Display */}
            {message && (
                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible`} role="alert">
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                </div>
            )}
            
            {/* Loading Overlay */}
            {loading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Internal Auditor UI</h3>
                    <div className="text-end">
                        <button 
                            onClick={refreshAllData} 
                            className="btn btn-success btn-sm"
                            disabled={loading}
                            title="Refresh all data without re-login (Ctrl+R or F5)"
                        >
                            <i className="fas fa-sync-alt me-1"></i>
                            {loading ? 'Refreshing...' : 'Refresh All Data'}
                        </button>
                        <div className="small text-muted mt-1">
                            Press Ctrl+R to refresh quickly
                        </div>
                    </div>
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
                                    <input type="number" min="0" required className="form-control" value={activeCadre} onChange={(e) => setActiveCadre(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label>Request Cadre:</label>
                                    <input type="number" min="0" required className="form-control" value={requestCadre} onChange={(e) => setRequestCadre(e.target.value)} />
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
                            <input 
                                type="submit" 
                                value={loading ? "Creating..." : "Create Cadre Log"} 
                                className="btn btn-primary w-100" 
                                disabled={loading}
                            />
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
                            <input 
                                type="submit" 
                                value={loading ? "Adding..." : "Add Company"} 
                                className="btn btn-success w-100" 
                                disabled={loading}
                            />
                        </div>
                    </form>
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Cadre Logs</h3>
                    <div className="d-flex gap-2">
                        <div className="form-check form-switch">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id="autoRefresh"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="autoRefresh">
                                Auto Refresh
                            </label>
                        </div>
                        <button 
                            onClick={() => fetchRecords(true)} 
                            className="btn btn-outline-primary btn-sm"
                            disabled={loading}
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {records.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">No cadre logs found. Create your first log above.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead className="thead-light">
                                    <tr>
                                        <th>Company</th>
                                        <th>Date</th>
                                        <th>Active Cadre</th>
                                        <th>Request Cadre</th>
                                        <th>Short Cadre</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(record => (
                                        <tr key={record._id}>
                                            <td>{record.company ? record.company.company_name : 'N/A'}</td>
                                            <td>{new Date(record.date).toLocaleDateString()}</td>
                                            <td>{record.active_cadre}</td>
                                            <td>{record.request_cadre}</td>
                                            <td>
                                                <span className={`badge ${record.short_cadre > 0 ? 'bg-warning' : record.short_cadre < 0 ? 'bg-success' : 'bg-secondary'}`}>
                                                    {record.short_cadre}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    onClick={() => { deleteRecord(record._id) }} 
                                                    className="btn btn-danger btn-sm"
                                                    disabled={deletingIds.has(record._id)}
                                                >
                                                    {deletingIds.has(record._id) ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default InternalAuditorUI;
