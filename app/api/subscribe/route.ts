import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, lang } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Замени эту ссылку на ту, которую тебе выдал сервис Sheety!
    const sheetyUrl = "https://api.sheety.co/f6516087a6ec3576628e7eb45cd00375/emberHomeSubscribers/лист1";

    // Отправляем данные в JSON-формате, как требует Sheety.
    // Названия полей (date, email, lang) должны строго совпадать с первой строчкой твоей таблицы!
    const response = await fetch(sheetyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        лист1: {
          date: new Date().toLocaleString("ru-RU"),
          email: email,
          lang: lang,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Sheety Error:", errText);
      return NextResponse.json({ error: "Sheety failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
