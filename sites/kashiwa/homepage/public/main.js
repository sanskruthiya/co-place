const form = document.querySelector("[data-contact-form]");
const status = document.querySelector("[data-form-status]");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "送信しています…";
  status.className = "form-status";
  status.textContent = "";

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Form submission failed");

    form.reset();
    status.classList.add("success");
    status.textContent = "お問い合わせを送信しました。ありがとうございます。";
  } catch {
    status.classList.add("error");
    status.textContent = "送信できませんでした。時間をおいて、もう一度お試しください。";
  } finally {
    button.disabled = false;
    button.innerHTML = "送信する <span aria-hidden='true'>→</span>";
  }
});
