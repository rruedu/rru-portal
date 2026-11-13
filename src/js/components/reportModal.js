/**
 * RRU School Portal - Report Broken Link / System Issue Modal Component
 */

import { callGasApi } from '../api.js';
import { escapeHtml, refreshIcons, showToast } from '../utils.js';

export function renderReportModal(container) {
  if (!container) return;

  let currentTarget = null; // { linkId, systemName, link }

  document.addEventListener('open-report-modal', (e) => {
    currentTarget = e.detail || null;
    if (currentTarget) {
      openModal();
    }
  });

  function openModal() {
    container.classList.remove('hidden');
    render();
  }

  function closeModal() {
    container.classList.add('hidden');
    container.innerHTML = '';
    currentTarget = null;
  }

  function render() {
    if (!currentTarget) return;

    container.innerHTML = `
      <div id="report-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-md view-enter">
        <div class="glass-panel w-full max-w-lg p-5 sm:p-7 rounded-3xl border border-pink-500/30 shadow-2xl relative text-left" onclick="event.stopPropagation();">
          
          <!-- Close button -->
          <button id="btn-close-report" class="absolute right-4 top-4 p-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/40 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>

          <!-- Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/10">
              <i data-lucide="flag" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-extrabold text-purple-100">
                แจ้งปัญหาระบบงานหรือลิงก์เสีย
              </h3>
              <p class="text-xs text-purple-300/70">
                รายงานนี้จะถูกส่งตรงไปยังครูผู้ดูแลระบบเพื่อทำการตรวจสอบและแก้ไข
              </p>
            </div>
          </div>

          <!-- Target System Pill -->
          <div class="p-3 rounded-2xl bg-purple-950/40 border border-pink-500/20 mb-4">
            <div class="text-[11px] text-pink-300 font-semibold mb-0.5">ระบบที่ต้องการแจ้งปัญหา:</div>
            <div class="text-sm font-bold text-purple-100">${escapeHtml(currentTarget.systemName || 'ไม่ระบุชื่อระบบ')}</div>
            <div class="text-[10px] text-purple-300/60 font-mono truncate mt-0.5">${escapeHtml(currentTarget.link || '')}</div>
          </div>

          <!-- Report Form -->
          <form id="report-issue-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-purple-200 mb-2">
                ลักษณะปัญหาที่พบ *
              </label>
              <div class="space-y-2 text-xs">
                <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-900/20 hover:bg-purple-900/40 border border-pink-500/15 cursor-pointer">
                  <input type="radio" name="issueType" value="ลิงก์เสีย / เข้าเว็บไซต์ไม่ได้ (404 / Error)" checked class="text-pink-500 focus:ring-pink-500" />
                  <span class="text-purple-100 font-medium">ลิงก์เสีย / เข้าเว็บไซต์ไม่ได้ (404, ไม่พบหน้าเว็บ)</span>
                </label>
                <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-900/20 hover:bg-purple-900/40 border border-pink-500/15 cursor-pointer">
                  <input type="radio" name="issueType" value="สิทธิ์ถูกปิด / ต้องขอสิทธิ์เข้าถึง (Google Drive/Form)" class="text-pink-500 focus:ring-pink-500" />
                  <span class="text-purple-100 font-medium">สิทธิ์ถูกปิด / ต้องขอสิทธิ์เข้าถึง (ติด Permission Google)</span>
                </label>
                <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-900/20 hover:bg-purple-900/40 border border-pink-500/15 cursor-pointer">
                  <input type="radio" name="issueType" value="ลิงก์ไม่ถูกต้อง / เปิดไปผิดระบบ" class="text-pink-500 focus:ring-pink-500" />
                  <span class="text-purple-100 font-medium">ลิงก์ไม่ถูกต้อง / เปิดไปผิดระบบงาน</span>
                </label>
                <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-900/20 hover:bg-purple-900/40 border border-pink-500/15 cursor-pointer">
                  <input type="radio" name="issueType" value="อื่นๆ" class="text-pink-500 focus:ring-pink-500" />
                  <span class="text-purple-100 font-medium">ปัญหาอื่นๆ</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-purple-200 mb-1.5">
                รายละเอียดเพิ่มเติม (ถ้ามี)
              </label>
              <textarea 
                id="field-report-note" 
                rows="3" 
                placeholder="ระบุข้อความแจ้งเตือนที่ปรากฏ หรือรายละเอียดเพิ่มเติม..." 
                class="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/40 border border-pink-500/25 focus:border-pink-500 text-purple-100 placeholder-purple-300/40 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 resize-none"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2">
              <button 
                type="button" 
                id="btn-cancel-report" 
                class="px-4 py-2.5 rounded-xl border border-pink-500/20 text-purple-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                id="btn-submit-report" 
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-pink-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i data-lucide="send" class="w-3.5 h-3.5"></i>
                <span>ส่งรายงานปัญหา</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    refreshIcons(container);

    // Bind event handlers
    const closeBtn = container.querySelector('#btn-close-report');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const cancelBtn = container.querySelector('#btn-cancel-report');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    const backdrop = container.querySelector('#report-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });
    }

    const form = container.querySelector('#report-issue-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const issueTypeRadio = form.querySelector('input[name="issueType"]:checked');
        const issueType = issueTypeRadio ? issueTypeRadio.value : 'ลิงก์เสีย / เข้าไม่ได้';
        const note = form.querySelector('#field-report-note')?.value.trim() || '';

        const submitBtn = form.querySelector('#btn-submit-report');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-spin mr-1">◌</span> กำลังส่งข้อมูล...';

        try {
          await callGasApi('reportIssue', {
            linkId: currentTarget.linkId,
            systemName: currentTarget.systemName,
            issueType,
            note
          });
          showToast('ส่งรายงานปัญหาเรียบร้อยแล้ว ขอบคุณที่ช่วยแจ้งข้อมูลครับ', 'success');
          closeModal();
        } catch (err) {
          showToast(`ส่งรายงานไม่สำเร็จ: ${err.message}`, 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i data-lucide="send" class="w-3.5 h-3.5"></i> ส่งรายงานปัญหา';
          refreshIcons(submitBtn);
        }
      });
    }
  }
}
