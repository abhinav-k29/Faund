export async function permitResearch(page) {
  const choice = page.locator(".research-save-choice");
  if ((await choice.getAttribute("open")) === null)
    await choice.locator("summary").click();
  await page
    .getByRole("checkbox", {
      name: "I authorise this observation for the local biodiversity research demonstration.",
    })
    .check();
}
