var policyRecord = new GlideRecord('sn_compliance_policy');
policyRecord.get(current.getValue('sn_compliance_policy'));
pk.retireArticle(policyRecord);