const aiService = require('../services/ai.service');
const { sendSuccess, sendError } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

async function chat(req, res) {
  const question = req.body?.question?.trim();

  if (!question) {
    return sendError(res, 'Question is required', errorCodes.VALIDATION_001, 400);
  }

  const result = await aiService.answerEmployeeQuestion({
    companyId: req.companyId,
    userId: req.user.id,
    question,
  });

  return sendSuccess(res, result);
}

module.exports = { chat };
