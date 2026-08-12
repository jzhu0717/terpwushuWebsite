const FREE_REGISTRATION_INSTITUTION = "University of Maryland College Park";

function computeAmountDue({ collegiateStatus, institution, eventCount, settings }) {
  const isCollegiate = collegiateStatus === "Collegiate";
  const isFreeUmd = isCollegiate && institution === FREE_REGISTRATION_INSTITUTION;
  if (eventCount === 0 || isFreeUmd) {
    return { total: 0, firstEventPrice: 0, additionalEventsCost: 0, additionalEventsCount: 0, isEarlyBird: null };
  }

  const basePrice = Number(settings?.early_reg_price || 0);
  const lateFee = Number(settings?.late_fee || 0);
  const pricePerEvent = Number(settings?.price_per_event || 0);
  const collegiateDiscount = Number(settings?.collegiate_discount || 0);
  const earlyEnds = settings?.early_reg_ends ? new Date(settings.early_reg_ends) : null;
  const isEarlyBird = !!earlyEnds && new Date() < earlyEnds;

  const discount = isCollegiate ? collegiateDiscount : 0;
  const firstEventBase = Math.max(0, basePrice - discount);
  const firstEventPrice = isEarlyBird ? firstEventBase : firstEventBase + lateFee;
  const additionalEventsCount = Math.max(0, eventCount - 1);
  const additionalEventsCost = additionalEventsCount * pricePerEvent;
  const total = Math.max(0, firstEventPrice + additionalEventsCost);

  return { total, firstEventPrice, additionalEventsCost, additionalEventsCount, isEarlyBird };
}

module.exports = { computeAmountDue, FREE_REGISTRATION_INSTITUTION };
