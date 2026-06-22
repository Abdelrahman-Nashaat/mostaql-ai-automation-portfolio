(function () {
  var current = location.pathname.split("/").pop() || "index.html";
  var map = {
    "ai-leads-dashboard.html": "ai-leads-dashboard",
    "foodics-analytics-api.html": "foodics-analytics-api",
    "watch-store-admin.html": "watch-store-admin",
    "n8n-jobs-wordpress.html": "n8n-jobs-wordpress",
    "whatsapp-sheets-assistant.html": "whatsapp-sheets-assistant",
    "invoice-ocr-workbench.html": "invoice-ocr-workbench",
    "crm-lead-agent.html": "crm-lead-agent"
  };
  var slug = map[current];
  if (!slug) return;

  var repo = "https://github.com/Abdelrahman-Nashaat/mostaql-ai-automation-portfolio/blob/main/";
  var strip = document.createElement("nav");
  strip.className = "proof-strip";
  strip.setAttribute("aria-label", "روابط مراجعة العمل");
  strip.innerHTML =
    '<a href="' + repo + current + '">الكود المصدر</a>' +
    '<a href="./results.html#' + slug + '">النتائج والمخرجات</a>' +
    '<a href="./index.html">كل الديموهات</a>';
  document.body.insertBefore(strip, document.body.firstChild);
})();
