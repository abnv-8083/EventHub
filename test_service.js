import * as adminService from './src/services/admin/adminServices.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await adminService.fetchPendingApprovalsCount();
    const data = await adminService.fetchApprovalsDashboardData();
    console.log('fetchPendingApprovalsCount result:', count);
    console.log('pendingEvents length:', data.pendingEvents.length);
    console.log('pendingOrganizers length:', data.pendingOrganizers.length);
    process.exit(0);
}

check();
