/**
 * Calculates expiry status and days remaining based on expiry date and archived status.
 *
 * Rules:
 * - isArchived === true => ARCHIVED
 * - No expiryDate => ACTIVE
 * - Expiry date is past (< 0 days) => EXPIRED
 * - Expiry date is within 30 days (<= 30 days) => EXPIRING_SOON
 * - More than 30 days => ACTIVE
 *
 * @param {Date|string|null} expiryDate
 * @param {boolean} isArchived
 * @returns {{ status: string, daysRemaining: number|null }}
 */
function calculateExpiryStatus(expiryDate, isArchived = false) {
  if (isArchived) {
    return { status: 'ARCHIVED', daysRemaining: null };
  }

  if (!expiryDate) {
    return { status: 'ACTIVE', daysRemaining: null };
  }

  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  let expUtc;
  if (typeof expiryDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(expiryDate.trim())) {
    const [y, m, d] = expiryDate.trim().split('-').map(Number);
    expUtc = Date.UTC(y, m - 1, d);
  } else {
    const exp = new Date(expiryDate);
    if (isNaN(exp.getTime())) {
      return { status: 'ACTIVE', daysRemaining: null };
    }
    expUtc = Date.UTC(exp.getFullYear(), exp.getMonth(), exp.getDate());
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.round((expUtc - todayUtc) / msPerDay);

  if (daysRemaining < 0) {
    return { status: 'EXPIRED', daysRemaining };
  } else if (daysRemaining <= 30) {
    return { status: 'EXPIRING_SOON', daysRemaining };
  } else {
    return { status: 'ACTIVE', daysRemaining };
  }
}

module.exports = {
  calculateExpiryStatus,
};
