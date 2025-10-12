// server/controllers/reportController.js
const Report = require("../models/reportModel");

// --- PARA USUARIOS ---
exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.findByUserId(req.user.id);
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

exports.getReportEmbedUrl = async (req, res, next) => {
  try {
    const report = await Report.findByIdForUser(req.params.id, req.user.id);
    if (!report) {
      res.status(403);
      throw new Error("No tienes permiso para ver este informe.");
    }
    res.status(200).json({ url: report.powerbi_url });
  } catch (error) {
    next(error);
  }
};

// --- PARA ADMINISTRADORES ---
exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.getAll();
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

exports.createReport = async (req, res, next) => {
  const { title, description, powerbi_url, assigned_users } = req.body;
  if (!title || !powerbi_url) {
    res.status(400);
    return next(new Error("El título y la URL de Power BI son requeridos."));
  }
  try {
    const newReport = await Report.create(
      { title, description, powerbi_url },
      assigned_users
    );
    res.status(201).json(newReport);
  } catch (error) {
    next(error);
  }
};

exports.updateReport = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, powerbi_url, assigned_users } = req.body;
  if (!title || !powerbi_url) {
    res.status(400);
    return next(new Error("El título y la URL de Power BI son requeridos."));
  }
  try {
    await Report.update(
      id,
      { title, description, powerbi_url },
      assigned_users
    );
    res.status(200).json({ message: "Informe actualizado correctamente." });
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    await Report.delete(req.params.id);
    res.status(200).json({ message: "Informe eliminado correctamente." });
  } catch (error) {
    next(error);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findByIdAdmin(req.params.id);
    if (!report) {
      res.status(404);
      throw new Error("Informe no encontrado.");
    }
    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};
