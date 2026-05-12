import { CompanyWithTask } from "../models/company.model.js";
import { Task } from "../models/taskOfCompany.model.js";

export const createCompanyWithTask = async (req, res) => {
  try {
    const { name, isInstitution, taskDescription } = req.body;
    const task = await Task.create({ description: taskDescription });
    const company = await CompanyWithTask.create({ name, isInstitution, tasks: [task] });
    res.status(201).json({ message: "Company created successfully", company });
  } catch (error) {
    res.status(500).json({ message: "Error creating company", error });
  }
};

export const addTask = async (req, res) => {
  try {
    const companyId = req.params.id;
    const { newDescription } = req.body;
    const newTask = new Task({ description: newDescription });
    await newTask.save();
    const updatedCompany = await CompanyWithTask.findByIdAndUpdate(
      { _id: companyId },
      { $push: { tasks: newTask._id } },
      { new: true }
    ).populate("tasks");
    if (!updatedCompany) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "Task added successfully", updatedCompany });
  } catch (error) {
    res.status(500).json({ message: "Error adding task", error });
  }
};

export const updateTask = async (req, res) => {
  try {
    const companyId = req.params.id;
    const { newDescription } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      { _id: companyId },
      { description: newDescription },
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task updated successfully", updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const deletedTask = await Task.findByIdAndDelete({ _id: taskId });
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully", deletedTask });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await CompanyWithTask.find().populate("tasks");
    res.status(200).json({ companies });
  } catch (error) {
    res.status(500).json({ message: "Error fetching companies", error });
  }
};

export const getCompany = async (req, res) => {
  try {
    const company = await CompanyWithTask.findById(req.params.id).populate("tasks");
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ company });
  } catch (error) {
    res.status(500).json({ message: "Error fetching company", error });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { name, isInstitution } = req.body;
    const updatedCompany = await CompanyWithTask.findByIdAndUpdate(
      { _id: req.params.id },
      { name, isInstitution },
      { new: true }
    );
    if (!updatedCompany) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "Company updated successfully", updatedCompany });
  } catch (error) {
    res.status(500).json({ message: "Error updating company", error });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const deletedCompany = await CompanyWithTask.findByIdAndDelete({ _id: req.params.id });
    if (!deletedCompany) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "Company deleted successfully", deletedCompany });
  } catch (error) {
    res.status(500).json({ message: "Error deleting company", error });
  }
};
