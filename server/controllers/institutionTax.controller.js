import { InstitutionTax } from "../models/institutionTax.model.js";
export const getAll = async (req, res) => { try { const data = await InstitutionTax.find(); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const getOne = async (req, res) => { try { const data = await InstitutionTax.findById(req.params.id); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const create = async (req, res) => { try { const data = await InstitutionTax.create(req.body); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const update = async (req, res) => { try { const data = await InstitutionTax.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const remove = async (req, res) => { try { const data = await InstitutionTax.findByIdAndDelete(req.params.id); res.send(data); } catch (e) { res.status(400).send(e.message); } };
