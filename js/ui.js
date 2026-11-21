/* =========================================================
   js/ui.js — პატარა ინტერფეისული ქცევა
   ---------------------------------------------------------
   მხოლოდ მოსწავლეთა ზონის ქვე-ჩანართები (ექსკურსიები / კლუბები / ოლიმპიადები):
   ღილაკი data-subtab="..." ააქტიურებს ელემენტს იგივე ID-ით (class="sub-content").
   მონაცემებს არ ეხება.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // მოსწავლეების ზონის შიდა ქვე-ჩანართები
  const subButtons = document.querySelectorAll('.sub-btn');
  const subContents = document.querySelectorAll('.sub-content');

  subButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSub = button.getAttribute('data-subtab');
      if (!targetSub) return;

      subButtons.forEach(btn => btn.classList.remove('active'));
      subContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      const targetSubElement = document.getElementById(targetSub);
      if (targetSubElement) {
        targetSubElement.classList.add('active');
      }
    });
  });
});