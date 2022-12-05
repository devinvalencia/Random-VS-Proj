var controlObjective = new GlideRecord('sn_compliance_policy_statement');
controlObjective.addEncodedQuery('attestation=NULL');
// controlObjective.addEncodedQuery('active=false');
// controlObjective.setLimit(2);
controlObjective.query();

var count = 0;

while (controlObjective.next()) {
    if (controlObjective.active == false) {
        controlObjective.active = true;
    }
    count++;
    
    controlObjective.setDisplayValue('attestation','12c75d12df101200dca6a5f59bf26394');
    controlObjective.update();
}

gs.info(count);