/**
 * 初始化示例数据 API
 * POST /api/init-sample-data
 * 注意：这个端点应在生产环境中删除或保护
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Term = require('../../models/Term');
const Case = require('../../models/Case');

// 示例术语数据
const sampleTerms = [
  { term: '人工智能', meaning: 'Artificial Intelligence (AI) - 计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。', cat: '计算机科学' },
  { term: '机器学习', meaning: 'Machine Learning - 人工智能的一个子集，专注于开发能够从数据中学习并随着经验提高的算法。', cat: '计算机科学' },
  { term: '深度学习', meaning: 'Deep Learning - 机器学习的一个子集，使用多层神经网络来模拟人脑的决策过程。', cat: '计算机科学' },
  { term: '自然语言处理', meaning: 'Natural Language Processing (NLP) - 使计算机能够理解、解释和生成人类语言的技术。', cat: '计算机科学' },
  { term: '神经网络', meaning: 'Neural Network - 由相互连接的节点组成，灵感来自人脑的结构和功能。', cat: '计算机科学' },
  { term: '可持续发展', meaning: 'Sustainable Development - 满足当前需求而不损害后代满足其自身需求的能力的发展。', cat: '环境科学' },
  { term: '气候变化', meaning: 'Climate Change - 地球气候的长期变化，包括温度、降水和其他气候要素的变化。', cat: '环境科学' },
  { term: '生物多样性', meaning: 'Biodiversity - 地球上所有生物的多样性，包括物种多样性、遗传多样性和生态系统多样性。', cat: '环境科学' },
  { term: '供应链管理', meaning: 'Supply Chain Management - 对商品和服务从原材料到最终交付消费者的全过程的计划和管理。', cat: '商业管理' },
  { term: '项目管理', meaning: 'Project Management - 应用知识、技能、工具和技术于项目活动，以满足项目要求。', cat: '商业管理' },
];

// 创建一个虚拟的 ObjectId 用于示例数据
const dummyUserId = new mongoose.Types.ObjectId();

// 示例案例数据
const sampleCases = [
  {
    title: '人工智能在医疗诊断中的应用',
    domain: '医疗健康',
    summary: '探讨了人工智能技术如何应用于医疗诊断，提高诊断准确性和效率。',
    content: '人工智能技术在医疗领域的应用越来越广泛，特别是在医疗诊断方面。本案例研究了一家医院如何使用深度学习算法分析医学影像。\n\n研究结果表明，AI系统在检测某些疾病（如肺癌、乳腺癌）方面的准确率已经达到或超过了人类专家。此外，AI系统还能够处理大量数据，快速分析患者的病史、症状和检查结果，为医生提供诊断建议。\n\n然而，AI在医疗诊断中的应用也面临一些挑战，如数据隐私问题、算法透明度不足以及与现有医疗系统的集成问题。',
    tags: ['人工智能', '医疗诊断', '深度学习', '医学影像'],
    createdBy: dummyUserId
  },
  {
    title: '可持续发展教育在高等教育中的实施',
    domain: '教育',
    summary: '研究了一所大学如何将可持续发展教育融入其课程体系和校园生活。',
    content: '可持续发展教育已成为全球高等教育的重要趋势。该大学采取了多种措施：开发跨学科的可持续发展课程、建立可持续发展研究中心、实施校园可持续发展计划、鼓励学生参与可持续发展实践项目。\n\n通过这些措施，该大学不仅提高了学生的可持续发展意识和能力，还为社会培养了具有环境责任感和创新精神的人才。',
    tags: ['可持续发展', '高等教育', '环境教育', '课程改革'],
    createdBy: dummyUserId
  },
  {
    title: '电子商务平台的用户体验优化',
    domain: '电子商务',
    summary: '分析了一家电子商务公司如何通过用户体验优化提高转化率和客户满意度。',
    content: '在竞争激烈的电子商务市场中，良好的用户体验是企业成功的关键因素。\n\n该公司采取了一系列优化措施：进行用户研究以了解目标用户的需求和行为习惯、优化网站和移动应用的界面设计、改进搜索功能以提供更准确的产品推荐、简化购物流程以减少结账步骤、实施个性化推荐系统。\n\n通过这些优化措施，该公司的网站转化率提高了25%，客户满意度也显著提升。',
    tags: ['电子商务', '用户体验', '转化率', '界面设计'],
    createdBy: dummyUserId
  },
  {
    title: '智能翻译技术的发展与应用',
    domain: '翻译',
    summary: '探讨了智能翻译技术的发展历程、当前应用场景及未来发展趋势。',
    content: '智能翻译技术经历了从规则翻译、统计翻译到神经机器翻译的三个主要阶段。\n\n当前最先进的神经机器翻译（NMT）技术利用深度学习模型，能够捕捉语言的上下文语义，提供更加流畅自然的翻译结果。\n\n在应用场景方面，智能翻译已广泛应用于跨境电商、国际会议、文档翻译等领域。未来发展趋势包括：多模态翻译（结合图像和语音）、领域自适应翻译、实时同声传译等。',
    tags: ['智能翻译', '神经机器翻译', '人工智能', '语言技术'],
    createdBy: dummyUserId
  }
];

router.post('/init-sample-data', async (req, res) => {
  try {
    // 清空现有数据
    await Term.deleteMany({});
    await Case.deleteMany({});

    // 插入示例数据
    const terms = await Term.insertMany(sampleTerms);
    const cases = await Case.insertMany(sampleCases);

    res.json({
      success: true,
      message: '示例数据初始化成功',
      data: {
        termsCreated: terms.length,
        casesCreated: cases.length
      }
    });
  } catch (error) {
    console.error('初始化数据失败:', error);
    res.status(500).json({ error: '初始化数据失败: ' + error.message });
  }
});

module.exports = router;
