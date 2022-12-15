var policyRecord = new GlideRecord('sn_compliance_policy');
policyRecord.get(current.getValue('sn_compliance_policy'));
var pk = new global.GRCKnowledge();
pk.createArticle(policyRecord, 'sn_compliance.knowledge_base', policyRecord.getValue('article_template'));

policyRecord.kb_article = articleId + '';
policyRecordUpdate.update();