import { Sale } from "../models/sale.model.js";
export const getAllSales = async (req, res) => { try { const data = await Sale.find(); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const getSale = async (req, res) => { try { const data = await Sale.findById(req.params.id); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const createSale = async (req, res) => { try { const data = await Sale.create(req.body); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const updateSale = async (req, res) => { try { const data = await Sale.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }); res.send(data); } catch (e) { res.status(400).send(e.message); } };
export const deleteSale = async (req, res) => { try { const data = await Sale.findByIdAndDelete(req.params.id); res.send(data); } catch (e) { res.status(400).send(e.message); } };
