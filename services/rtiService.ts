
import { RTITask, Politician, RTIStatus } from "../types";
import { MOCK_RTI_TASKS, MOCK_POLITICIANS } from "../constants";

const RTI_STORAGE_KEY = 'neta_rti_tasks';

// --- DATA PERSISTENCE ---

export const getRTITasks = (): RTITask[] => {
    try {
        const stored = localStorage.getItem(RTI_STORAGE_KEY);
        return stored ? JSON.parse(stored) : MOCK_RTI_TASKS;
    } catch {
        return MOCK_RTI_TASKS;
    }
};

export const saveRTITasks = (tasks: RTITask[]) => {
    localStorage.setItem(RTI_STORAGE_KEY, JSON.stringify(tasks));
};

// --- CORE INTELLIGENCE ENGINE ---

/**
 * Scans politician data and auto-generates tasks based on anomalies.
 * 500% Upgrade: Uses heuristic rules to find dirt.
 */
export const generateAutoRTITasks = (): { tasks: RTITask[], count: number } => {
    const existingTasks = getRTITasks();
    const newTasks: RTITask[] = [];
    const existingIds = new Set(existingTasks.map(t => t.id));

    MOCK_POLITICIANS.forEach(p => {
        // RULE 1: Low Attendance Anomaly
        if (p.attendance < 60) {
            const taskId = `rti-auto-${p.id}-att`;
            if (!existingIds.has(taskId)) {
                newTasks.push({
                    id: taskId,
                    politicianId: p.id,
                    politicianName: p.name,
                    topic: "Attendance Discrepancy",
                    description: `Attendance is dangerously low (${p.attendance}%). Request leave applications and medical certificates submitted for absence during Monsoon Session.`,
                    priority: "high",
                    status: "generated",
                    generatedDate: new Date().toISOString(),
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
                    pioDetails: { name: "Secretary General", address: "Parliament House, New Delhi" }
                });
            }
        }

        // RULE 2: High Asset Watch
        if (p.totalAssets > 10) {
            const taskId = `rti-auto-${p.id}-assets`;
            if (!existingIds.has(taskId)) {
                newTasks.push({
                    id: taskId,
                    politicianId: p.id,
                    politicianName: p.name,
                    topic: "Asset Verification",
                    description: `High net worth individual (₹${p.totalAssets}Cr). Request last 3 years' tax filing acknowledgement vs affidavit declaration.`,
                    priority: "medium",
                    status: "generated",
                    generatedDate: new Date().toISOString(),
                    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
                    pioDetails: { name: "Income Tax Officer", address: `Circle Office, ${p.state}` }
                });
            }
        }

        // RULE 3: Criminal History Probe
        if (p.criminalCases > 0) {
            const taskId = `rti-auto-${p.id}-crime`;
            if (!existingIds.has(taskId)) {
                newTasks.push({
                    id: taskId,
                    politicianId: p.id,
                    politicianName: p.name,
                    topic: "Case Status Update",
                    description: `Found ${p.criminalCases} pending cases. Request current status of FIRs and police charge sheets.`,
                    priority: "high",
                    status: "generated",
                    generatedDate: new Date().toISOString(),
                    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                    pioDetails: { name: "Station House Officer", address: `Police HQ, ${p.state}` }
                });
            }
        }
    });

    if (newTasks.length > 0) {
        const updatedList = [...newTasks, ...existingTasks];
        saveRTITasks(updatedList);
    }

    return { tasks: newTasks, count: newTasks.length };
};

// --- WORKFLOW ACTIONS ---

export const updateTaskStatus = (taskId: string, status: RTIStatus, meta?: Partial<RTITask>) => {
    const tasks = getRTITasks();
    const updated = tasks.map(t => {
        if (t.id === taskId) {
            return { 
                ...t, 
                status, 
                ...meta 
            };
        }
        return t;
    });
    saveRTITasks(updated);
    return updated;
};

export const claimTask = (taskId: string, volunteerName: string) => {
    return updateTaskStatus(taskId, 'claimed', { 
        claimedBy: volunteerName 
    });
};

export const fileTask = (taskId: string, proofUrl: string) => {
    return updateTaskStatus(taskId, 'filed', { 
        filedDate: new Date().toISOString(),
        proofOfFilingUrl: proofUrl
    });
};

export const submitResponse = (taskId: string, responseUrl: string) => {
    return updateTaskStatus(taskId, 'response_received', {
        responseDate: new Date().toISOString(),
        governmentResponseUrl: responseUrl
    });
};

export const verifyTask = (taskId: string) => {
    return updateTaskStatus(taskId, 'verified');
};
