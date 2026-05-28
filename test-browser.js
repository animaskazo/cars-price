import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log("Iniciando prueba en el navegador...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to a nice size
  await page.setViewport({ width: 1280, height: 1000 });

  console.log("Visitando http://localhost:5173 ...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Wait for the make dropdown to load
  await page.waitForSelector('#make');
  
  // Select "Toyota"
  await page.select('#make', 'Toyota');
  console.log("Marca 'Toyota' seleccionada.");

  // Wait for the model dropdown to populate and select "Corolla"
  await page.waitForSelector('#model');
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.select('#model', 'Corolla');
  console.log("Modelo 'Corolla' seleccionado.");

  // Select Year "2022"
  await page.select('#year', '2022');
  console.log("Año '2022' seleccionado.");

  // Fill in mileage "50000"
  await page.type('#mileage', '50000');
  console.log("Kilometraje '50.000 km' ingresado.");

  // Click calculate button
  console.log("Haciendo clic en 'Calcular Precio'...");
  await page.click('button[type="submit"]');

  // Wait for results to load
  console.log("Esperando respuesta de la API y rendering...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Take screenshot
  const screenshotPath = '/Users/fer/.gemini/antigravity-ide/brain/917741ca-d733-4666-8f6f-c57cca4ad985/screenshot.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`Captura de pantalla guardada en: ${screenshotPath}`);

  // Try to read the estimated price
  const price = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1'));
    const priceHeading = headings.find(h => h.innerText.includes('$') || h.innerText.includes('CLP'));
    return priceHeading ? priceHeading.innerText : (headings[0] ? headings[0].innerText : 'No encontrado');
  });
  console.log(`Resultado leído en la UI: ${price}`);

  await browser.close();
  console.log("Prueba finalizada exitosamente.");
})().catch(err => {
  console.error("Error durante la prueba:", err);
  process.exit(1);
});
