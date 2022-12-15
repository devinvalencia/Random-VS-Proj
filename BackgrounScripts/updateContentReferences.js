var gr = new GlideRecord('sn_compliance_content_references_imported');
gr.get('efd315de2f6f95d073c795acf699b6f1');

var name = gr.u_name;
var str = 'ISO/IEC 27001:2013 - ';

name = name.substring(0, name.indexOf(' '));
str += name;
gs.info(str);


// var desc = name.substring(name.indexOf(' ') + 1);
// gs.info(desc);



