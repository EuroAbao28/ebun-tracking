const createError = require("http-errors");
const { validateFields } = require("../utils/validationFields");
const Tool = require("../models/toolModel");

// create tool
const createTool = async (req, res, next) => {
  try {
    const { toolName, totalStocks } = req.body;

    console.log("CREATE TOOL BODY", req.body);

    // validate fields
    validateFields(toolName, totalStocks);

    // check if tool already exists
    const isToolAlreadyExist = await Tool.findOne({
      toolName: { $regex: new RegExp(`^${toolName}$`, "i") },
    });
    if (isToolAlreadyExist) {
      return next(createError(409, "Tool already exist"));
    }

    const newTool = await Tool.create({
      toolName,
      totalStocks,
    });

    return res.status(201).json({
      message: "Tool created successfully",
      tool: newTool,
    });
  } catch (error) {
    return next(error);
  }
};

// get all tools
const getAllTools = async (req, res, next) => {
  try {
    const tools = await Tool.find({});

    res.status(200).json({
      message: "ALL TOOL FETCHED",
      tools,
    });
  } catch (error) {
    next(error);
  }
};

// update tool
const updateTool = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { toolName, totalStocks } = req.body;

    console.log(req.body);

    // find the truck
    const existingTool = await Tool.findById(id);
    if (!existingTool) {
      return next(createError(404, "Tool not found"));
    }

    // update fields
    const updatedFields = {
      toolName: toolName || existingTool.toolName,
      totalStocks: totalStocks || existingTool.totalStocks,
    };

    Object.assign(existingTool, updatedFields);
    await existingTool.save();

    res.status(200).json({
      message: "Truck updated successfully",
      truck: existingTool,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTool, getAllTools };
