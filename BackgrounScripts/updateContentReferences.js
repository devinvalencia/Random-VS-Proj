var gr = new GlideRecord('sn_compliance_content_references_imported');
gr.get('e3d355de2f6f95d073c795acf699b60d');

var name = gr.u_name;
var str = 'ISO/IEC 27001:2013 - ';

    
// name = name.substring(0, str.indexOf(' '));
str += name;

var desc = name.substring(name.indexOf(' ') + 1);

gs.info(desc);
