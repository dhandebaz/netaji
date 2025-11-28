import { PublicComplaint, ComplaintStatus } from "../types";
import { getAllComplaints, addComplaint as addComplaintToStore, upvoteComplaint, updateComplaintStatus as updateStatus } from './dataService';

export const getComplaints = (): PublicComplaint[] => {
    return getAllComplaints();
};

export const getComplaintsByPolitician = (politicianId: number): PublicComplaint[] => {
    const complaints = getAllComplaints();
    return complaints.filter(c => c.politicianId === politicianId);
};

export const addComplaint = (complaint: Omit<PublicComplaint, 'id' | 'upvotes' | 'status' | 'filedAt'>): PublicComplaint => {
    return addComplaintToStore(complaint);
};

export const upvoteComplaintById = (id: string): PublicComplaint | null => {
    return upvoteComplaint(id);
};

export const updateComplaintStatus = (id: string, status: ComplaintStatus, proof?: string): PublicComplaint | null => {
    return updateStatus(id, status, proof);
};

export const deleteComplaint = (id: string): PublicComplaint[] => {
    const complaints = getAllComplaints();
    const updated = complaints.filter(c => c.id !== id);
    const COMPLAINTS_KEY = 'neta_complaints';
    try {
        localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('Storage error:', e);
    }
    return updated;
};
