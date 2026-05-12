import { SaleToCompany } from "../models/salesToCompany.model.js";
export const getAll = async (req, res) => { try { const data = await SaleToCompany.find(); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const getOne = async (req, res) => { try { const data = await SaleToCompany.findById(req.params.id); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const create = async (req, res) => { try { const data = await SaleToCompany.create(req.body); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const update = async (req, res) => { try { const data = await SaleToCompany.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const remove = async (req, res) => { try { const data = await SaleToCompany.findByIdAndDelete(req.params.id); res.send(data); } catch (e) { res.status(400).send(e.message); } };
