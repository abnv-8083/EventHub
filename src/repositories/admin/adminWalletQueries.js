import { AdminWallet, AdminTransaction } from "../../models/admin/wallet.js";

export const getWalletData = async () => {
    let wallet = await AdminWallet.findOne();
    if (!wallet) {
        wallet = await AdminWallet.create({ balance: 0 });
    }
    return wallet;
};

export const creditWallet = async (amount, bookingId = null, payoutId = null) => {
    let wallet = await AdminWallet.findOne();
    if (!wallet) {
        wallet = await AdminWallet.create({ balance: 0 });
    }

    wallet.balance += amount;
    wallet.lastUpdated = new Date();
    await wallet.save();

    const txData = {
        amount,
        type: 'credit'
    };

    if (bookingId) {
        txData.bookingId = bookingId;
        txData.description = `Platform fee collected from booking #${bookingId.toString().slice(-6)}`;
    } else if (payoutId) {
        txData.payoutId = payoutId;
        txData.description = `Platform commission from payout #${payoutId.toString().slice(-6)}`;
    }

    return await AdminTransaction.create(txData);
};

export const getRecentTransactions = async (limit = 10) => {
    return await AdminTransaction.find()
        .populate({
            path: 'bookingId',
            populate: { path: 'eventId', select: 'title' }
        })
        .populate({
            path: 'payoutId',
            populate: { path: 'eventId', select: 'title' }
        })
        .sort({ createdAt: -1 })
        .limit(limit);
};
