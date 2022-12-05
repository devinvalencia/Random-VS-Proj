var policy = new GlideRecord('sn_compliance_policy');
policy.orderBy('name')
policy.query();
var count = 1;

while (policy.next()) {

    if (count > 9) {
        policy.number = 'POL00200' + count;
    } else {
        policy.number = 'POL002000' + count;
        // POL00200 01
    }

    policy.update();
    count++;
}