import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import readline from "readline";
import { exec } from "child_process";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const sleep = (ms) => new Promise((resolve => setTimeout(resolve, ms)));


const systemPrompt = "Jesteś JARVIS – osobisty asystent Mateusza. Odpowiadasz krótko, treściwie, z elegancją i lekkim humorem. Pamiętasz całą historię naszej rozmowy. Nie używaj formatowania Markdown (np. gwiazdek, płotków), bo Twoje odpowiedzi są czytane na głos.";

const chat = ai.chats.create({
  model: "gemini-3.8-flash",
  config: { systemInstruction: systemPrompt }
});

function powiedz(tekst) {
  const czystyTekst = tekst
    .replace(/[*_~`#]/g, "")
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  exec(`say -v Krzysztof "${czystyTekst}"`, (err) => {
    if (err) {
      exec(`say "${czystyTekst}"`);
    }
  });
}

async function uruchomJarvisa() {
  rl.question("\nTy: ", async (tekst) => {

    if (tekst.toLowerCase() === "wyjdz" || tekst.toLowerCase() === "wyjdź") {
      const pozegnanie = "Do usług, panie Mateuszu. Wyłączam systemy.";
      console.log(`JARVIS: ${pozegnanie}`);
      powiedz(pozegnanie);
      rl.close();
      return;
    }

    try {
      const response = await chat.sendMessage({
        message: String(tekst)
      });

      console.log("\nJARVIS:");
      console.log(response.text);
      powiedz(response.text);

    } catch (error) {


      if (error.message.includes("503") || error.message.includes("RESOURCE_EXHAUSTED")) {
        console.log("\n[System]: Serwery są mocno obciążone. Ponawiam próbę za 3 sekundy...");
        await sleep(3000);
         } else if(error.message.includes("420") || error.message,includes("RESOURCE_EXHAUSTED")) {
            console.log("\n[System]: Wykorzystano darmowy limit zapytan modelu");
         } else  {
        console.error("\nBłąd połączenia:", error.message);
      }
    }

    uruchomJarvisa();
  });
}

console.log("JARVIS z pamięcią rozmowy gotowy do pracy. Wpisz 'wyjdz', aby zakończyć.");
uruchomJarvisa();
