var policyRecord = new GlideRecord('sn_compliance_policy');
policyRecord.get(current.getValue('sn_compliance_policy'));
publishKB(policyRecord);

function publishKB(policy) {
    var newArticleCreated = false;
    var publishedBefore = policy.publish_count > 0;
    var publishCount = policy.publish_count += 1;

    var templateId = policy.article_template + '';
    var articleTemplate = new GlideRecord('sn_compliance_article_template');
    articleTemplate.get(templateId);

    var pk = new global.GRCKnowledge();
    // use pk.checkoutArticle !== undefined to check if the policy itbm code supports checkout
    if (publishedBefore && !policy.kb_article.nil() && pk.checkoutArticle !== undefined && pk.isVersioningEnabled()) {
        gs.info('DV - Do we even get here?'); // We dont!
        
        var articleId = pk.checkoutArticle(policy, 'sn_compliance.knowledge_base', articleTemplate, policy.kb_knowledge_base);

        if (!articleId) {
            gs.addErrorMessage(gs.getMessage('Could not create new knowledge article version'));
            return;
        }
        policy.kb_article = articleId + '';
        newArticleCreated = true;
    } else {
        // if we cannot perform checkout to the policy kb, we need to retire it
        // if (!policy.kb_article.nil()){
            // ORIGINAL VERSION -- pk.retireArticle(policy, 'sn_compliance.knowledge_base');
            // pk.retireArticle(policy);
        // }

        var articleId = pk.createArticle(policy, 'sn_compliance.knowledge_base', articleTemplate);
        if (!articleId) {
            gs.addErrorMessage(gs.getMessage('Could not create knowledge article'));
            return;
        }

        // policy.kb_article = articleId + '';
        newArticleCreated = true;
    }

    if (!pk.publishArticle(policy)) {
        gs.addErrorMessage(gs.getMessage('Failed to publish knowledge article'));
        return;
    }

    if (newArticleCreated) {
        var article = populateArticleSource(articleId, policy.getUniqueValue());
        if (article.getValue('version') == null) {
            gs.addInfoMessage(gs.getMessage('Added article {0} to the {1} Knowledge Base', [article.number, GlideStringUtil.escapeHTML(article.kb_knowledge_base.getDisplayValue())]));
        } else
            gs.addInfoMessage(gs.getMessage('Added article {0} v{1} to the {2} Knowledge Base', [article.number, article.version.version, GlideStringUtil.escapeHTML(article.kb_knowledge_base.getDisplayValue())]));
    }

    var policyRecordUpdate = new GlideRecord('sn_compliance_policy');
    policyRecordUpdate.get(policy.getUniqueValue());
    policyRecordUpdate.kb_article = articleId + '';
    policyRecordUpdate.publish_count = publishCount;
    policyRecordUpdate.update();
}

function populateArticleSource(articleId, policyId) {
    var article = new GlideRecord('kb_knowledge');
    if (article.get(articleId)) {
        article.sn_grc_target_table = 'sn_compliance_policy';
        article.sn_grc_source = policyId;
        article.workflow_state = 'published';
        article.update();
    }
    return article;
}