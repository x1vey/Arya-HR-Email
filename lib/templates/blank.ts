import type { Template } from "@/lib/blocks/types";

/**
 * A blank starting point — a clean 600px white card with no blocks. Pick this
 * to build an email from scratch: drag elements in or click to add, then
 * double-click to edit. Common HR variables are pre-declared so anything you
 * add can reference them right away.
 */
export const blankTemplate: Template = {
  id: "tpl_blank_v1",
  name: "Blank",
  category: "scratch",
  variables: [
    { key: "employee.first_name", label: "Employee first name", sample: "Alex", required: false },
    { key: "company.name", label: "Company name", sample: "Arya", required: false },
    { key: "sender.name", label: "Sender (HR) name", sample: "People Ops", required: false }
  ],
  wrapper_html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Untitled</title></head>
<body style="margin:0;padding:0;background:#F4F2FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F2FB;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border-radius:10px;overflow:hidden;border:1px solid #E9E6F5;min-height:120px;">
      {{__blocks__}}
    </table>
  </td></tr>
</table>
</body>
</html>`,
  blocks: []
};
