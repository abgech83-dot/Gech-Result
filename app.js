/**
 * Universal School Management System Core Data Bridge & Shared Orchestrator
 */

// 1. Database Key Initializers & Fallback Instantiations (Using your original working keys)
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
        { username: "admin", password: "123", role: "admin", name: "Principal System Admin", gender: "Male", age: 38 }
    ]));
}
if (!localStorage.getItem('results')) localStorage.setItem('results', JSON.stringify([]));
if (!localStorage.getItem('reports')) localStorage.setItem('reports', JSON.stringify([]));

// 2. Global Database Context Driver Methods
// Initialize Supabase Client Connection Layer
const SUPABASE_URL = "sb_publishable_jMAFHsAg5nQezVCoW7sZuA_Tp6l2TNv"; // Replace with your actual Supabase URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuaHZ4Y3JoeW9pamJrenJhZ3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTQ2OTAsImV4cCI6MjA5Nzg5MDY5MH0.qBjzd4WWUTKQYiOZLMSC6Qfij-_5yWLNm2G32VC9mWA"; // Replace with your real Anon API Key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.DB = {
    // 1. Fetch all users from the cloud
    getUsers: async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) { console.error("Error fetching users:", error); return []; }
        return data || [];
    },

    // 2. Add or update a user profile (Admin Panel / Registration)
    saveUser: async (newUser) => {
        const { data, error } = await supabase.from('users').upsert(newUser, { onConflict: 'username' });
        if (error) console.error("Error writing user record:", error);
        return data;
    },
    
    // 3. Fetch all score results
    getResults: async () => {
        const { data, error } = await supabase.from('results').select('*');
        if (error) { console.error("Error reading scores table:", error); return []; }
        
        // Match stringified JSON if column type is text/varchar in your DB
        return (data || []).map(r => ({
            ...r,
            breakdown: typeof r.breakdown === 'string' ? JSON.parse(r.breakdown) : r.breakdown
        }));
    },

    // 4. Secure single student score updates (Supports both Simple and Detailed Mode objects)
    saveResult: async (studentUsername, subject, score, breakdown = null) => {
        const payload = {
            username: studentUsername,
            subject: subject,
            score: parseInt(score) || 0,
            breakdown: breakdown ? JSON.stringify(breakdown) : null,
            status: 'draft'
        };

        const { data, error } = await supabase.from('results')
            .upsert(payload, { onConflict: 'username,subject' });

        if (error) console.error("Cloud engine database write failure:", error);
        return data;
    },
    
    // 5. Save academic compliance batch reports compiled by instructors
    saveReport: async (reportObject) => {
        const payload = {
            id: reportObject.id,
            teacher: reportObject.teacher,
            segment: reportObject.segment,
            date: reportObject.date,
            data: JSON.stringify(reportObject.data), // Stringify complex array for clear table cell tracking
            approved: reportObject.approved
        };

        const { data, error } = await supabase.from('reports').insert([payload]);
        if (error) console.error("Failed to sync dispatched administrative report:", error);
        return data;
    },

    // 6. Fetch batch administrative reports
    getReports: async () => {
        const { data, error } = await supabase.from('reports').select('*');
        if (error) { console.error("Error fetching reports ledger:", error); return []; }
        return (data || []).map(rep => ({
            ...rep,
            data: typeof rep.data === 'string' ? JSON.parse(rep.data) : rep.data
        }));
    },
    
    // 7. Standard Client Verification Module Configuration 
    getCurrentUser: () => JSON.parse(sessionStorage.getItem('currentUser')) || null,

    generateCredentials: (role) => {
        const rand = Math.floor(1000 + Math.random() * 9000);
        return { username: `${role}${rand}`, password: `pass${rand}` };
    }
};
// 3. Global Course Framework Matrix By Grade and Stream Configuration
window.CourseMap = {
    "9": ['English', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Citizenship', 'Economics', 'Amharic', 'Afaan_Oromo', 'HPE', 'ICT'],
    "10": ['English', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Citizenship', 'Economics', 'Amharic', 'Afaan_Oromo', 'HPE', 'ICT'],
    "11-Natural": ['English', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'Agriculture', 'Web_Design', 'ICT'],
    "11-Social": ['English', 'Mathematics', 'Geography', 'History', 'Economics', 'Marketing', 'ICT'],
    "12-Natural": ['English', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'Agriculture', 'Web_Design', 'ICT'],
    "12-Social": ['English', 'Mathematics', 'Geography', 'History', 'Economics', 'Marketing', 'ICT']
};

// 4. Distinct Subject Arrays For Dropdown Selections
window.AllDistinctSubjects = [
    'Amharic', 'English', 'Afaan_Oromo', 'Mathematics', 'Biology', 'Physics', 
    'Chemistry', 'Geography', 'History', 'Economics', 'Marketing', 'HPE', 'ICT', 'Agriculture', 'Web_Design'
];

// 5. String Normalization & Formatting Helper Utility
window.formatSubjectName = function(sub) {
    if (!sub) return 'General Core';
    // Replaces underscores with blank spacing and applies proper capitalization
    return sub.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};