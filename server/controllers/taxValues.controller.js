import { TaxValues } from "../models/taxValues.model.js";

export const getTaxValues = async (req, res) => {
  try {
    const data = await TaxValues.findOne();
    res.send(data);
  } catch (e) {
    res.status(400).send(e.message);
  }
};

export const upsertTaxValues = async (req, res) => {
  try {
    const existing = await TaxValues.findOne();
    let data;
    if (existing) {
      data = await TaxValues.findByIdAndUpdate(existing._id, { $set: req.body }, { new: true });
    } else {
      data = await TaxValues.create(req.body);
    }
    res.send(data);
  } catch (e) {
    res.status(400).send(e.message);
  }
};
