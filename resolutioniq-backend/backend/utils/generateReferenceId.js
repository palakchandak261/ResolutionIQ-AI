async function generateReferenceId(ComplaintModel) {
  const year = new Date().getFullYear();
  const count = await ComplaintModel.countDocuments({
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lte: new Date(`${year}-12-31T23:59:59.999Z`),
    },
  });
  const seq = String(count + 1).padStart(6, "0");
  return `RIQ-${year}-${seq}`;
}

module.exports = generateReferenceId;
