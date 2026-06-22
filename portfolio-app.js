(function () {
  const page = location.pathname.split("/").pop() || "index.html";
  const storeKey = "mostaql-working-demo:";

  const $ = (selector, root = document) => root.querySelector(selector);
  const money = (value) => "$" + Number(value || 0).toLocaleString("en-US");
  const uid = () => Math.random().toString(16).slice(2, 8).toUpperCase();
  const read = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(storeKey + key)) || fallback;
    } catch (_) {
      return fallback;
    }
  };
  const save = (key, value) => localStorage.setItem(storeKey + key, JSON.stringify(value));
  const download = (name, text, type = "application/json") => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const demoMap = {
    "ai-leads-dashboard.html": renderLeads,
    "foodics-analytics-api.html": renderFoodics,
    "watch-store-admin.html": renderWatchStore,
    "n8n-jobs-wordpress.html": renderN8n,
    "whatsapp-sheets-assistant.html": renderSheetsAssistant,
    "invoice-ocr-workbench.html": renderInvoiceOcr,
    "crm-lead-agent.html": renderCrmAgent
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (!demoMap[page]) return;
    const main = $(".frame");
    const section = document.createElement("section");
    section.className = "workspace";
    section.innerHTML = `
      <div class="workspace-head">
        <div>
          <h2>نسخة تفاعلية شغالة في المتصفح</h2>
          <p>ليست صورة ثابتة: جرّب الإدخال والحسابات والتصدير. البيانات تحفظ محليًا في جهازك للتجربة فقط.</p>
        </div>
        <button class="button" type="button" data-reset-demo>إعادة ضبط الديمو</button>
      </div>
      <div class="workspace-body" data-workspace-body></div>
    `;
    main.appendChild(section);
    section.addEventListener("click", (event) => {
      if (!event.target.closest("[data-reset-demo]")) return;
      Object.keys(localStorage)
        .filter((key) => key.startsWith(storeKey))
        .forEach((key) => localStorage.removeItem(key));
      location.reload();
    });
    demoMap[page]($("[data-workspace-body]", section));
  });

  function renderLeads(root) {
    let leads = read("leads", [
      { id: uid(), name: "متجر عطور", source: "WhatsApp", budget: 1800, urgency: "high", need: "بوت يرد على العملاء ويرسل الطلبات", score: 91, status: "Hot" },
      { id: uid(), name: "عيادة أسنان", source: "Website", budget: 900, urgency: "medium", need: "جمع بيانات المراجعين", score: 73, status: "Warm" },
      { id: uid(), name: "استفسار عام", source: "Instagram", budget: 250, urgency: "low", need: "معلومات عامة", score: 38, status: "Cold" }
    ]);

    root.innerHTML = `
      <div class="tool-grid">
        <form class="tool-card form-grid" data-lead-form>
          <h3>أدخل عميل جديد</h3>
          <label>اسم العميل <input name="name" value="شركة مقاولات"></label>
          <label>القناة
            <select name="source"><option>WhatsApp</option><option>Website</option><option>Airtable Form</option><option>Instagram</option></select>
          </label>
          <label>الميزانية المتوقعة <input name="budget" type="number" value="1200"></label>
          <label>سرعة القرار
            <select name="urgency"><option value="high">هذا الأسبوع</option><option value="medium">خلال شهر</option><option value="low">غير محدد</option></select>
          </label>
          <label class="span-2">الاحتياج <textarea name="need">نحتاج بوت يستقبل العملاء ويصنفهم ويرسل البيانات إلى Google Sheets</textarea></label>
          <button class="button primary span-2" type="submit">احسب الدرجة وأضف للوحة</button>
        </form>
        <div class="tool-card">
          <h3>Webhook payload مباشر</h3>
          <pre class="console" data-lead-json></pre>
          <div class="toolbar">
            <button class="button" type="button" data-export-leads>تصدير CSV</button>
            <button class="button" type="button" data-add-sample>إضافة lead سريع</button>
          </div>
        </div>
      </div>
      <div class="tool-card">
        <h3>جدول العملاء المؤهلين</h3>
        <div class="mini-table" data-leads-table></div>
      </div>
    `;

    const scoreLead = (lead) => {
      const urgency = { high: 30, medium: 18, low: 6 }[lead.urgency] || 0;
      const budget = Math.min(35, Math.round(Number(lead.budget || 0) / 60));
      const need = /بوت|واتساب|sheets|crm|airtable|google/i.test(lead.need) ? 25 : 12;
      return Math.min(99, urgency + budget + need + 8);
    };
    const render = () => {
      save("leads", leads);
      const hot = leads.filter((lead) => lead.score >= 80).length;
      $("[data-lead-json]", root).textContent = JSON.stringify({ event: "lead.created", hot_leads: hot, total: leads.length, latest: leads[0] }, null, 2);
      $("[data-leads-table]", root).innerHTML = `
        <div class="mini-row mini-head"><b>العميل</b><b>القناة</b><b>الدرجة</b><b>الحالة</b><b>إجراء</b></div>
        ${leads.map((lead) => `
          <div class="mini-row">
            <span>${lead.name}</span><span>${lead.source}</span><strong>${lead.score}</strong>
            <span class="pill ${lead.status.toLowerCase()}">${lead.status}</span>
            <button class="mini-btn" data-remove-lead="${lead.id}">حذف</button>
          </div>
        `).join("")}
      `;
    };
    $("[data-lead-form]", root).addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const lead = Object.fromEntries(form.entries());
      lead.id = uid();
      lead.budget = Number(lead.budget);
      lead.score = scoreLead(lead);
      lead.status = lead.score >= 80 ? "Hot" : lead.score >= 55 ? "Warm" : "Cold";
      leads.unshift(lead);
      render();
    });
    root.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-remove-lead]");
      if (remove) {
        leads = leads.filter((lead) => lead.id !== remove.dataset.removeLead);
        render();
      }
      if (event.target.closest("[data-export-leads]")) {
        const csv = ["name,source,budget,score,status,need"].concat(leads.map((lead) =>
          [lead.name, lead.source, lead.budget, lead.score, lead.status, lead.need].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")
        )).join("\n");
        download("qualified-leads.csv", csv, "text/csv");
      }
      if (event.target.closest("[data-add-sample]")) {
        leads.unshift({ id: uid(), name: "عميل تجريبي " + (leads.length + 1), source: "WhatsApp", budget: 1500, urgency: "high", need: "يريد ربط واتساب مع Sheets", score: 88, status: "Hot" });
        render();
      }
    });
    render();
  }

  function renderFoodics(root) {
    let tenants = read("foodicsTenants", [
      { id: "rest-001", name: "مطعم الرياض", orders: 148, sales: 18420, branches: 3, lastSync: "10:05" },
      { id: "cafe-002", name: "كافيه جدة", orders: 92, sales: 9730, branches: 2, lastSync: "09:50" }
    ]);
    let selected = tenants[0].id;

    root.innerHTML = `
      <div class="tool-grid">
        <form class="tool-card form-grid" data-tenant-form>
          <h3>إضافة عميل Foodics</h3>
          <label>اسم المطعم <input name="name" value="مطعم جديد"></label>
          <label>عدد الفروع <input name="branches" type="number" value="1"></label>
          <button class="button primary span-2" type="submit">اربط tenant جديد</button>
        </form>
        <div class="tool-card">
          <h3>محاكاة API</h3>
          <div class="toolbar">
            <button class="button primary" type="button" data-sync-foodics>تشغيل مزامنة</button>
            <button class="button" type="button" data-export-schema>تصدير SQL schema</button>
          </div>
          <pre class="console" data-api-output></pre>
        </div>
      </div>
      <div class="tool-card">
        <h3>عزل العملاء والقراءات</h3>
        <div class="mini-table" data-tenants-table></div>
      </div>
    `;

    const schema = `create table tenants (id text primary key, name text not null);
create table orders (id text primary key, tenant_id text references tenants(id), total numeric, branch_id text, created_at timestamptz);
create index orders_tenant_created_idx on orders (tenant_id, created_at desc);
-- Supabase RLS policy would filter rows by tenant_id from the API token claims.`;
    const render = () => {
      save("foodicsTenants", tenants);
      const tenant = tenants.find((row) => row.id === selected) || tenants[0];
      $("[data-api-output]", root).textContent = JSON.stringify({
        endpoint: "/api/analytics/sales-summary?tenant_id=" + tenant.id,
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        branches: tenant.branches,
        orders_today: tenant.orders,
        gross_sales: tenant.sales,
        last_sync: tenant.lastSync,
        isolation: "All queries require tenant_id; no cross-tenant reads."
      }, null, 2);
      $("[data-tenants-table]", root).innerHTML = `
        <div class="mini-row mini-head"><b>Tenant</b><b>الفروع</b><b>الطلبات</b><b>المبيعات</b><b>اختيار</b></div>
        ${tenants.map((tenant) => `
          <div class="mini-row">
            <span>${tenant.name}<small>${tenant.id}</small></span><span>${tenant.branches}</span>
            <strong>${tenant.orders}</strong><span>${money(tenant.sales)}</span>
            <button class="mini-btn" data-select-tenant="${tenant.id}">${tenant.id === selected ? "محدد" : "اعرض"}</button>
          </div>
        `).join("")}
      `;
    };
    $("[data-tenant-form]", root).addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const tenant = {
        id: "tenant-" + uid().toLowerCase(),
        name: form.get("name"),
        branches: Number(form.get("branches")),
        orders: 0,
        sales: 0,
        lastSync: "--"
      };
      tenants.unshift(tenant);
      selected = tenant.id;
      render();
    });
    root.addEventListener("click", (event) => {
      const select = event.target.closest("[data-select-tenant]");
      if (select) {
        selected = select.dataset.selectTenant;
        render();
      }
      if (event.target.closest("[data-sync-foodics]")) {
        tenants = tenants.map((tenant) => tenant.id === selected ? {
          ...tenant,
          orders: tenant.orders + Math.floor(Math.random() * 12) + 4,
          sales: tenant.sales + Math.floor(Math.random() * 1600) + 420,
          lastSync: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
        } : tenant);
        render();
      }
      if (event.target.closest("[data-export-schema]")) download("foodics-schema.sql", schema, "text/plain");
    });
    render();
  }

  function renderWatchStore(root) {
    let products = read("watchProducts", [
      { id: uid(), name: "Classic Steel", price: 89, stock: 8 },
      { id: uid(), name: "Sport Chrono", price: 129, stock: 5 },
      { id: uid(), name: "Minimal Gold", price: 149, stock: 2 }
    ]);
    let cart = read("watchCart", []);

    root.innerHTML = `
      <div class="tool-grid">
        <form class="tool-card form-grid" data-product-form>
          <h3>لوحة إدارة المنتجات</h3>
          <label>الاسم <input name="name" value="Urban Black"></label>
          <label>السعر <input name="price" type="number" value="119"></label>
          <label>المخزون <input name="stock" type="number" value="6"></label>
          <button class="button primary" type="submit">أضف المنتج</button>
        </form>
        <div class="tool-card">
          <h3>السلة ورسالة واتساب</h3>
          <pre class="console" data-cart-message></pre>
          <div class="toolbar">
            <a class="button primary" data-whatsapp-link target="_blank" rel="noreferrer">فتح واتساب</a>
            <button class="button" type="button" data-clear-cart>مسح السلة</button>
          </div>
        </div>
      </div>
      <div class="tool-card">
        <h3>كتالوج قابل للتجربة</h3>
        <div class="product-grid" data-products></div>
      </div>
    `;
    const render = () => {
      save("watchProducts", products);
      save("watchCart", cart);
      const lines = cart.map((item) => `${item.name} x ${item.qty} = ${money(item.price * item.qty)}`);
      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const message = lines.length ? `طلب جديد:%0A${lines.join("%0A")}%0Aالإجمالي: ${money(total)}` : "السلة فارغة. أضف منتجا لتوليد رسالة الطلب.";
      $("[data-cart-message]", root).textContent = decodeURIComponent(message);
      $("[data-whatsapp-link]", root).href = "https://wa.me/?text=" + message;
      $("[data-products]", root).innerHTML = products.map((product) => `
        <article class="product-card">
          <div class="watch-face"></div>
          <h4>${product.name}</h4>
          <p>${money(product.price)} · مخزون ${product.stock}</p>
          <button class="button primary" type="button" data-add-cart="${product.id}" ${product.stock <= 0 ? "disabled" : ""}>أضف للسلة</button>
        </article>
      `).join("");
    };
    $("[data-product-form]", root).addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      products.unshift({ id: uid(), name: form.get("name"), price: Number(form.get("price")), stock: Number(form.get("stock")) });
      render();
    });
    root.addEventListener("click", (event) => {
      const add = event.target.closest("[data-add-cart]");
      if (add) {
        const product = products.find((item) => item.id === add.dataset.addCart);
        if (!product || product.stock <= 0) return;
        product.stock -= 1;
        const existing = cart.find((item) => item.id === product.id);
        if (existing) existing.qty += 1;
        else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
        render();
      }
      if (event.target.closest("[data-clear-cart]")) {
        cart = [];
        render();
      }
    });
    render();
  }

  function renderN8n(root) {
    let runs = read("n8nRuns", []);
    const sources = ["LinkedIn Jobs", "RemoteOK RSS", "Google Alerts"];
    root.innerHTML = `
      <div class="tool-grid">
        <div class="tool-card">
          <h3>تشغيل workflow</h3>
          <div class="toolbar">
            <button class="button primary" type="button" data-run-n8n>تشغيل الآن</button>
            <button class="button" type="button" data-export-n8n>تصدير JSON</button>
          </div>
          <pre class="console" data-n8n-log></pre>
        </div>
        <div class="tool-card">
          <h3>مصادر مفعلة</h3>
          <div class="flow">${sources.map((source) => `<div>${source}</div>`).join("")}<div>WordPress REST</div></div>
        </div>
      </div>
      <div class="tool-card">
        <h3>آخر المقالات المنشورة</h3>
        <div class="mini-table" data-n8n-table></div>
      </div>
    `;
    const runWorkflow = () => {
      const picked = sources[Math.floor(Math.random() * sources.length)];
      runs.unshift({
        id: "run-" + uid(),
        source: picked,
        title: "وظائف مطوري AI وAutomation - " + new Date().toLocaleDateString("ar-EG"),
        cleaned: Math.floor(Math.random() * 14) + 6,
        published: Math.floor(Math.random() * 5) + 2,
        status: "published",
        time: new Date().toLocaleTimeString("ar-EG")
      });
      runs = runs.slice(0, 8);
      render();
    };
    const render = () => {
      save("n8nRuns", runs);
      $("[data-n8n-log]", root).textContent = runs[0] ? JSON.stringify({
        workflow: "jobs_to_wordpress",
        last_run: runs[0],
        steps: ["fetch", "deduplicate", "rewrite_excerpt", "categorize", "publish"]
      }, null, 2) : "اضغط تشغيل الآن لمحاكاة workflow كامل.";
      $("[data-n8n-table]", root).innerHTML = `
        <div class="mini-row mini-head"><b>المصدر</b><b>العنوان</b><b>منشور</b><b>الوقت</b></div>
        ${runs.map((run) => `<div class="mini-row"><span>${run.source}</span><span>${run.title}</span><strong>${run.published}/${run.cleaned}</strong><span>${run.time}</span></div>`).join("")}
      `;
    };
    root.addEventListener("click", (event) => {
      if (event.target.closest("[data-run-n8n]")) runWorkflow();
      if (event.target.closest("[data-export-n8n]")) download("n8n-runs.json", JSON.stringify(runs, null, 2));
    });
    if (!runs.length) runWorkflow();
    else render();
  }

  function renderSheetsAssistant(root) {
    let rows = read("sheetRows", [
      { product: "Basic CRM", revenue: 3200, owner: "Mona", status: "active" },
      { product: "WhatsApp Bot", revenue: 5400, owner: "Omar", status: "active" },
      { product: "SEO Audit", revenue: 900, owner: "Ali", status: "paused" }
    ]);
    root.innerHTML = `
      <div class="tool-grid">
        <form class="tool-card form-grid" data-sheet-form>
          <h3>اسأل Google Sheets بالعربي</h3>
          <label class="span-2">السؤال <input name="question" value="ما إجمالي الإيرادات للصفوف active؟"></label>
          <button class="button primary span-2" type="submit">اسأل المساعد</button>
          <pre class="console span-2" data-answer></pre>
        </form>
        <form class="tool-card form-grid" data-row-form>
          <h3>أضف صف للجدول</h3>
          <label>المنتج <input name="product" value="Invoice OCR"></label>
          <label>الإيراد <input name="revenue" type="number" value="1800"></label>
          <label>المسؤول <input name="owner" value="Sara"></label>
          <label>الحالة <select name="status"><option>active</option><option>paused</option></select></label>
          <button class="button" type="submit">أضف صف</button>
        </form>
      </div>
      <div class="tool-card"><h3>Sheet preview</h3><div class="mini-table" data-sheet-table></div></div>
    `;
    const answer = (question) => {
      const activeOnly = /active|نشط|النشطة/.test(question);
      const filtered = activeOnly ? rows.filter((row) => row.status === "active") : rows;
      if (/إجمالي|total|مجموع|sum/.test(question)) {
        return "الإجمالي: " + money(filtered.reduce((sum, row) => sum + Number(row.revenue), 0)) + ` عبر ${filtered.length} صف.`;
      }
      if (/أعلى|اكبر|highest|top/.test(question)) {
        const top = [...filtered].sort((a, b) => b.revenue - a.revenue)[0];
        return top ? `أعلى صف هو ${top.product} بقيمة ${money(top.revenue)} والمسؤول ${top.owner}.` : "لا توجد صفوف مطابقة.";
      }
      return "وجدت " + filtered.length + " صفوف مطابقة. جرّب: ما إجمالي الإيرادات active؟ أو ما أعلى منتج؟";
    };
    const render = () => {
      save("sheetRows", rows);
      $("[data-sheet-table]", root).innerHTML = `
        <div class="mini-row mini-head"><b>المنتج</b><b>الإيراد</b><b>المسؤول</b><b>الحالة</b></div>
        ${rows.map((row) => `<div class="mini-row"><span>${row.product}</span><strong>${money(row.revenue)}</strong><span>${row.owner}</span><span>${row.status}</span></div>`).join("")}
      `;
    };
    $("[data-sheet-form]", root).addEventListener("submit", (event) => {
      event.preventDefault();
      const question = new FormData(event.currentTarget).get("question");
      $("[data-answer]", root).textContent = JSON.stringify({ question, answer: answer(question), rows_scanned: rows.length }, null, 2);
    });
    $("[data-row-form]", root).addEventListener("submit", (event) => {
      event.preventDefault();
      const form = Object.fromEntries(new FormData(event.currentTarget).entries());
      rows.unshift({ ...form, revenue: Number(form.revenue) });
      render();
    });
    render();
  }

  function renderInvoiceOcr(root) {
    const sample = `Vendor: Nile Office Supplies
Invoice No: INV-2026-184
Date: 2026-06-22
Subtotal: 1,240.00
VAT: 186.00
Total: 1,426.00 USD`;
    root.innerHTML = `
      <div class="tool-grid">
        <form class="tool-card form-grid" data-ocr-form>
          <h3>الصق نص فاتورة أو استخدم العينة</h3>
          <label class="span-2">النص <textarea name="text">${sample}</textarea></label>
          <button class="button primary span-2" type="submit">استخرج الحقول</button>
        </form>
        <div class="tool-card">
          <h3>الحقول المستخرجة</h3>
          <pre class="console" data-ocr-output></pre>
          <button class="button" type="button" data-export-ocr>تصدير JSON</button>
        </div>
      </div>
    `;
    let extracted = {};
    const extract = (text) => {
      const clean = text.replaceAll(",", "");
      return {
        vendor: (text.match(/Vendor:\s*(.+)/i) || [null, "غير محدد"])[1].trim(),
        invoice_no: (text.match(/Invoice\s*No:\s*([A-Z0-9-]+)/i) || [null, "غير محدد"])[1],
        date: (text.match(/Date:\s*([0-9-]+)/i) || [null, "غير محدد"])[1],
        total: Number((clean.match(/(?:^|\n)Total:\s*([0-9.]+)/i) || [null, 0])[1]),
        currency: /USD|دولار/i.test(text) ? "USD" : "غير محدد",
        confidence: Math.round(82 + Math.random() * 12)
      };
    };
    $("[data-ocr-form]", root).addEventListener("submit", (event) => {
      event.preventDefault();
      extracted = extract(new FormData(event.currentTarget).get("text"));
      $("[data-ocr-output]", root).textContent = JSON.stringify(extracted, null, 2);
    });
    root.addEventListener("click", (event) => {
      if (event.target.closest("[data-export-ocr]")) download("invoice-extraction.json", JSON.stringify(extracted, null, 2));
    });
    $("[data-ocr-form]", root).dispatchEvent(new Event("submit", { cancelable: true }));
  }

  function renderCrmAgent(root) {
    let pipeline = read("crmPipeline", []);
    root.innerHTML = `
      <div class="tool-grid">
        <form class="tool-card form-grid" data-agent-form>
          <h3>حلل lead جديد</h3>
          <label>الشركة <input name="company" value="شركة خدمات لوجستية"></label>
          <label>الميزانية <input name="budget" type="number" value="2200"></label>
          <label class="span-2">الرسالة <textarea name="message">نريد أتمتة استقبال العملاء وربط واتساب مع CRM وتحديد الأولوية تلقائيا</textarea></label>
          <button class="button primary span-2" type="submit">شغل الوكيل</button>
        </form>
        <div class="tool-card">
          <h3>قرار الوكيل</h3>
          <pre class="console" data-agent-output></pre>
        </div>
      </div>
      <div class="tool-card"><h3>CRM pipeline</h3><div class="mini-table" data-crm-table></div></div>
    `;
    const classify = (lead) => {
      const text = lead.message.toLowerCase();
      const score = Math.min(99, Math.round(Number(lead.budget) / 45) + (/crm|واتساب|automation|أتمتة|agent/.test(text) ? 35 : 12));
      return {
        id: uid(),
        company: lead.company,
        score,
        stage: score >= 80 ? "Qualified" : score >= 55 ? "Follow-up" : "Nurture",
        reason: score >= 80 ? "ميزانية مناسبة واحتياج مباشر للأتمتة" : "يحتاج توضيح النطاق قبل التسعير",
        next_step: score >= 80 ? "أرسل عرض فني مختصر وحدد مكالمة" : "اطلب تفاصيل الأدوات الحالية"
      };
    };
    const render = () => {
      save("crmPipeline", pipeline);
      $("[data-crm-table]", root).innerHTML = `
        <div class="mini-row mini-head"><b>الشركة</b><b>الدرجة</b><b>المرحلة</b><b>الخطوة</b></div>
        ${pipeline.map((lead) => `<div class="mini-row"><span>${lead.company}</span><strong>${lead.score}</strong><span>${lead.stage}</span><span>${lead.next_step}</span></div>`).join("")}
      `;
    };
    $("[data-agent-form]", root).addEventListener("submit", (event) => {
      event.preventDefault();
      const lead = Object.fromEntries(new FormData(event.currentTarget).entries());
      const result = classify(lead);
      pipeline.unshift(result);
      pipeline = pipeline.slice(0, 8);
      $("[data-agent-output]", root).textContent = JSON.stringify(result, null, 2);
      render();
    });
    render();
  }
})();
