/**
 * printHelper.js
 * ──────────────
 * أداة طباعة مشتركة لكل الصفحات
 *
 * ✅ يدعم logoUrl (ملف على السيرفر) + logoBase64
 * ✅ يفتح نافذة الطباعة بدون tab جديد (iframe مخفي)
 * ✅ يُستورد ويُستخدم في أي صفحة
 *
 * الاستخدام:
 *   import { getLogoHtml, printViaIframe } from "../utils/printHelper";
 *
 *   const logoHtml = getLogoHtml(settings);
 *   printViaIframe("عنوان", `<html>..${logoHtml}..</html>`);
 */

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

// ─── buildLogoHtml ────────────────────────────────────────────
/**
 * @param {object} settings - كائن الإعدادات من السيرفر
 * @returns {string} HTML string للوغو أو اسم المتجر
 */
export function getLogoHtml(settings) {
  const logoSrc = settings?.logoUrl
    ? `${BASE_URL}${settings.logoUrl}`
    : settings?.logoBase64 || "";

  if (logoSrc) {
    return `<div style="text-align:center;margin-bottom:14px;">
      <img src="${logoSrc}" style="max-height:90px;max-width:55%;object-fit:contain;" />
    </div>`;
  }

  return `<div style="text-align:center;margin-bottom:14px;font-size:22px;font-weight:800;color:#1f2937;">
    ${settings?.storeName || "מתפרת מלאק"}
  </div>`;
}

// ─── buildFooterHtml ─────────────────────────────────────────
export function getFooterHtml(settings) {
  const date = new Date().toLocaleDateString("he-IL");
  const parts = [`הופק בתאריך ${date}`];
  if (settings?.storePhone) parts.push(settings.storePhone);
  if (settings?.footerText)  parts.push(settings.footerText);
  return `<div style="margin-top:18px;font-size:10px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb;padding-top:10px;">
    ${parts.join(" | ")}
  </div>`;
}

// ─── printViaIframe ───────────────────────────────────────────
/**
 * يطبع HTML عبر iframe مخفي — لا يفتح tab جديد
 * @param {string} title  - عنوان نافذة الطباعة
 * @param {string} html   - محتوى HTML الكامل بما فيه <html><head>...</html>
 */
export function printViaIframe(title, html) {
  let iframe = document.getElementById("__malak_print_frame__");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "__malak_print_frame__";
    iframe.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;visibility:hidden;";
    document.body.appendChild(iframe);
  }

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  // نعطي وقتاً للصور لتحميل (خاصة اللوغو)
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 300);
  };
}

// ─── CSS مشترك للطباعة ────────────────────────────────────────
export const PRINT_CSS = `
  * { font-family: 'Assistant', Arial, sans-serif; direction: rtl; box-sizing: border-box; }
  body { padding: 10px; font-size: 10px; color: #1f2937; margin: 0; }
  h1 { font-size: 15px; margin: 0 0 3px; text-align: center; }
  .subtitle { font-size: 9px; color: #6b7280; margin-bottom: 10px; text-align: center; }
  .divider { border: none; border-top: 2px solid #1f2937; margin: 7px 0 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5px; table-layout: auto; }
  th {
    background: #1f2937; color: white;
    padding: 5px 5px; text-align: right; font-weight: 600;
    white-space: nowrap;
  }
  td {
    padding: 3px 5px; border-bottom: 1px solid #f0f0ef; text-align: right;
    white-space: nowrap;
  }
  tr:nth-child(even) td { background: #f9fafb; }
  .footer { margin-top: 12px; font-size: 9px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  @media print {
    body { padding: 0; }
    @page { margin: 6mm; size: A4 landscape; }
  }
`;
